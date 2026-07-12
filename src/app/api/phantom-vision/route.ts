import { NextRequest } from 'next/server';

// Full API endpoint URL. If DIFY_API_URL ends with /run, use it directly.
// Otherwise append /v1/workflows/run (standard Dify pattern).
const DIFY_API_URL = process.env.DIFY_API_URL || '';
const DIFY_WORKFLOW_KEY = process.env.DIFY_WORKFLOW_API_KEY || '';

function getDifyEndpoint(): string {
  if (DIFY_API_URL.endsWith('/run')) return DIFY_API_URL;
  return `${DIFY_API_URL}/v1/workflows/run`;
}

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return new Response(JSON.stringify({ error: 'slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!DIFY_WORKFLOW_KEY) {
      return new Response(JSON.stringify({ error: 'Phantom Vision is not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const gammaUrl = `https://gamma-api.polymarket.com/events?slug=${encodeURIComponent(slug)}`;
    const endpoint = getDifyEndpoint();

    console.log('[Phantom Vision] slug:', slug);
    console.log('[Phantom Vision] gamma URL:', gammaUrl);
    console.log('[Phantom Vision] Dify endpoint:', endpoint);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180_000); // 3 min timeout

    let difyResponse: Response;
    try {
      difyResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_WORKFLOW_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: { url: gammaUrl },
          response_mode: 'streaming',
          user: 'phantom-tma',
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error('Dify API error:', difyResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Pipeline error: ${difyResponse.status} — ${errorText.slice(0, 200)}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!difyResponse.body) {
      return new Response(
        JSON.stringify({ error: 'No stream body from pipeline' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward the SSE stream from Dify to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = difyResponse.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (err) {
          const msg = err instanceof Error && err.name === 'AbortError'
            ? 'data: {\"event\":\"error\",\"data\":\"Pipeline timed out\"}\n\n'
            : `data: {\"event\":\"error\",\"data\":\"Stream interrupted\"}\n\n`;
          controller.enqueue(new TextEncoder().encode(msg));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Phantom Vision error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}