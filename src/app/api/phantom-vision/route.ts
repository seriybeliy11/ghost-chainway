import { NextRequest, NextResponse } from 'next/server';

const DIFY_API_URL = process.env.DIFY_API_URL || '';
const DIFY_WORKFLOW_KEY = process.env.DIFY_WORKFLOW_API_KEY || '';

interface DifyWorkflowResponse {
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: 'succeeded' | 'failed' | 'running';
    outputs: Record<string, unknown>;
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'slug is required' },
        { status: 400 }
      );
    }

    if (!DIFY_WORKFLOW_KEY) {
      return NextResponse.json(
        { error: 'Phantom Vision is not configured' },
        { status: 503 }
      );
    }

    const gammaUrl = `https://gamma-api.polymarket.com/events?slug=${encodeURIComponent(slug)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000); // 2 min timeout

    let difyResponse: Response;
    try {
      difyResponse = await fetch(`${DIFY_API_URL}/v1/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_WORKFLOW_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: { url: gammaUrl },
          response_mode: 'blocking',
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
      return NextResponse.json(
        { error: `Pipeline error: ${difyResponse.status}` },
        { status: 502 }
      );
    }

    const data: DifyWorkflowResponse = await difyResponse.json();

    if (data.data?.status === 'succeeded' && data.data.outputs) {
      return NextResponse.json({
        success: true,
        outputs: data.data.outputs,
        elapsed_time: data.data.elapsed_time,
      });
    }

    if (data.data?.error) {
      return NextResponse.json(
        { error: data.data.error },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Pipeline returned unexpected response' },
      { status: 502 }
    );
  } catch (error) {
    console.error('Phantom Vision error:', error);
    const msg = error instanceof Error && error.name === 'AbortError'
      ? 'Pipeline timed out after 2 minutes. Try again.'
      : 'Internal server error';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}