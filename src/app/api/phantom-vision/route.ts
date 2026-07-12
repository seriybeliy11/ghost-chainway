import { NextRequest } from 'next/server';

const DIFY_API_URL = process.env.DIFY_API_URL || '';
const DIFY_WORKFLOW_KEY = process.env.DIFY_WORKFLOW_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return new Response(JSON.stringify({ error: 'slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!DIFY_API_URL) {
      return new Response(JSON.stringify({ error: 'Phantom Vision is not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const gammaUrl = `https://gamma-api.polymarket.com/events?slug=${encodeURIComponent(slug)}`;

    console.log('[Phantom Vision] slug:', slug);
    console.log('[Phantom Vision] url:', gammaUrl);
    console.log('[Phantom Vision] webhook:', DIFY_API_URL);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180_000);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (DIFY_WORKFLOW_KEY) {
      headers['Authorization'] = `Bearer ${DIFY_WORKFLOW_KEY}`;
    }

    let difyResponse: Response;
    try {
      difyResponse = await fetch(DIFY_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: gammaUrl }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    console.log('[Phantom Vision] response status:', difyResponse.status);
    console.log('[Phantom Vision] content-type:', difyResponse.headers.get('content-type'));

    // Non-OK → return JSON error
    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error('[Phantom Vision] error body:', errorText.slice(0, 500));
      return new Response(
        JSON.stringify({ error: `Pipeline ${difyResponse.status}: ${errorText.slice(0, 300)}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ct = difyResponse.headers.get('content-type') || '';

    // SSE stream → forward to client
    if (ct.includes('text/event-stream')) {
      if (!difyResponse.body) {
        return new Response(
          JSON.stringify({ error: 'Empty stream' }),
          { status: 502, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const stream = new ReadableStream({
        async start(ctrl) {
          const reader = difyResponse.body!.getReader();
          const decoder = new TextDecoder();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              ctrl.enqueue(new TextEncoder().encode(decoder.decode(value, { stream: true })));
            }
          } catch (err) {
            const msg = err instanceof Error && err.name === 'AbortError'
              ? 'data: {"event":"error","data":"Pipeline timed out"}\n\n'
              : 'data: {"event":"error","data":"Stream interrupted"}\n\n';
            ctrl.enqueue(new TextEncoder().encode(msg));
          } finally {
            ctrl.close();
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
    }

    // JSON response → extract output and return as SSE with workflow_finished event
    const json = await difyResponse.json();
    console.log('[Phantom Vision] JSON response:', JSON.stringify(json).slice(0, 500));

    // Try to extract text from various response shapes
    let outputText = '';

    // Shape 1: Dify standard { data: { outputs: { ... } } }
    if (json.data?.outputs) {
      outputText = extractText(json.data.outputs);
    }
    // Shape 2: Direct { outputs: { ... } }
    else if (json.outputs) {
      outputText = extractText(json.outputs);
    }
    // Shape 3: Direct { text/result/answer: "..." }
    else {
      outputText = extractText(json);
    }

    if (!outputText) {
      outputText = JSON.stringify(json, null, 2);
    }

    // Wrap in a single SSE event so the frontend can parse it uniformly
    const ssePayload = `data: ${JSON.stringify({
      event: 'workflow_finished',
      data: {
        outputs: { text: outputText },
        elapsed_time: 0,
        status: 'succeeded',
      },
    })}\n\n`;

    return new Response(ssePayload, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Phantom Vision] error:', error);
    const msg = error instanceof Error && error.name === 'AbortError'
      ? 'Pipeline timed out'
      : 'Internal server error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function extractText(obj: Record<string, unknown>): string {
  const keys = ['text', 'result', 'output', 'answer', 'response', 'analysis', 'content'];
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'string' && val.trim()) return val;
  }
  for (const val of Object.values(obj)) {
    if (typeof val === 'string' && val.trim()) return val;
  }
  return '';
}