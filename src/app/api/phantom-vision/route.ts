import { NextRequest, NextResponse } from 'next/server';

const DIFY_WEBHOOK_URL = process.env.DIFY_API_URL || '';
const DIFY_WORKFLOW_KEY = process.env.DIFY_WORKFLOW_API_KEY || '';

// Health check — verify webhook is reachable
export async function GET() {
  if (!DIFY_WEBHOOK_URL) {
    return NextResponse.json({ ok: false, error: 'DIFY_API_URL not set' });
  }

  try {
    const testUrl = encodeURIComponent('https://gamma-api.polymarket.com/events?slug=health-check');
    const url = `${DIFY_WEBHOOK_URL}?url=${testUrl}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (DIFY_WORKFLOW_KEY) {
      headers['Authorization'] = `Bearer ${DIFY_WORKFLOW_KEY}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const body = await res.text();

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get('content-type'),
      bodyPreview: body.slice(0, 500),
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    if (!DIFY_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Phantom Vision is not configured' }, { status: 503 });
    }

    const gammaUrl = `https://gamma-api.polymarket.com/events?slug=${encodeURIComponent(slug)}`;
    const encodedUrl = encodeURIComponent(gammaUrl);
    const webhookUrl = `${DIFY_WEBHOOK_URL}?url=${encodedUrl}`;

    console.log('[Phantom Vision] slug:', slug);
    console.log('[Phantom Vision] gammaUrl:', gammaUrl);
    console.log('[Phantom Vision] webhookUrl:', webhookUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180_000);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (DIFY_WORKFLOW_KEY) {
      headers['Authorization'] = `Bearer ${DIFY_WORKFLOW_KEY}`;
    }

    let difyResponse: Response;
    try {
      difyResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    console.log('[Phantom Vision] status:', difyResponse.status);
    console.log('[Phantom Vision] content-type:', difyResponse.headers.get('content-type'));

    const responseText = await difyResponse.text();
    console.log('[Phantom Vision] body:', responseText.slice(0, 1000));

    if (!difyResponse.ok) {
      return NextResponse.json(
        { error: `Webhook ${difyResponse.status}: ${responseText.slice(0, 300)}` },
        { status: 502 }
      );
    }

    // Parse the webhook response
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(responseText);
    } catch {
      // Not JSON — return as-is
      return NextResponse.json({ success: true, output: responseText });
    }

    // If the webhook returned a result with data, extract text from it
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

    let output = '';

    if (json.data && typeof json.data === 'object' && json.data !== null) {
      const d = json.data as Record<string, unknown>;
      if (d.outputs && typeof d.outputs === 'object' && d.outputs !== null) {
        output = extractText(d.outputs as Record<string, unknown>);
      }
      if (!output) output = extractText(d);
    }
    if (!output && json.outputs) {
      output = extractText(json.outputs as Record<string, unknown>);
    }
    if (!output) {
      output = extractText(json);
    }

    if (!output) {
      output = JSON.stringify(json, null, 2);
    }

    return NextResponse.json({ success: true, output });
  } catch (error) {
    console.error('[Phantom Vision] error:', error);
    const msg = error instanceof Error && error.name === 'AbortError'
      ? 'Pipeline timed out (3 min)'
      : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}