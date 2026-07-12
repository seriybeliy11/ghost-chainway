import { NextRequest, NextResponse } from 'next/server';

const DIFY_API_URL = process.env.DIFY_API_URL || '';
const DIFY_WORKFLOW_KEY = process.env.DIFY_WORKFLOW_API_KEY || '';

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

// Health check — test webhook reachability
export async function GET() {
  if (!DIFY_API_URL) {
    return NextResponse.json({ ok: false, error: 'DIFY_API_URL not set' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const headers: Record<string, string> = {};
    if (DIFY_WORKFLOW_KEY) {
      headers['Authorization'] = `Bearer ${DIFY_WORKFLOW_KEY}`;
    }

    const res = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url: 'https://gamma-api.polymarket.com/events?slug=test' }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const ct = res.headers.get('content-type') || '';
    const body = await res.text();

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      contentType: ct,
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

    if (!DIFY_API_URL) {
      return NextResponse.json({ error: 'Phantom Vision is not configured' }, { status: 503 });
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

    console.log('[Phantom Vision] status:', difyResponse.status);
    console.log('[Phantom Vision] content-type:', difyResponse.headers.get('content-type'));

    // Read response as text first — safe for any format
    const responseText = await difyResponse.text();
    console.log('[Phantom Vision] body:', responseText.slice(0, 1000));

    if (!difyResponse.ok) {
      return NextResponse.json(
        { error: `Webhook ${difyResponse.status}: ${responseText.slice(0, 300)}` },
        { status: 502 }
      );
    }

    // Try parse as JSON
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(responseText);
    } catch {
      // Not JSON — return raw text as output
      return NextResponse.json({ success: true, output: responseText });
    }

    // Extract text from various shapes
    let output = '';

    if (json.data && typeof json.data === 'object' && json.data !== null) {
      const d = json.data as Record<string, unknown>;
      if (d.outputs) output = extractText(d.outputs as Record<string, unknown>);
      else output = extractText(d);
    } else if (json.outputs) {
      output = extractText(json.outputs as Record<string, unknown>);
    } else {
      output = extractText(json);
    }

    // Fallback to full JSON stringified
    if (!output) {
      output = JSON.stringify(json, null, 2);
    }

    return NextResponse.json({ success: true, output });
  } catch (error) {
    console.error('[Phantom Vision] error:', error);
    const msg = error instanceof Error && error.name === 'AbortError'
      ? 'Pipeline timed out'
      : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}