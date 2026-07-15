import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const { slug, telegramId, eventQuestion } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    if (!DIFY_WORKFLOW_KEY) {
      return NextResponse.json({ error: 'Phantom Vision is not configured' }, { status: 503 });
    }

    // Check and debit generation if telegramId provided
    let generationId: string | null = null;
    let subscriptionId: string | null = null;

    if (telegramId) {
      const sub = await db.subscription.findFirst({
        where: { telegramUserId: telegramId, isActive: true },
      });

      if (!sub || sub.generationsLeft <= 0) {
        return NextResponse.json({
          error: 'No generations left. Purchase more to continue.',
          code: 'NO_GENERATIONS',
          generationsLeft: sub?.generationsLeft ?? 0,
        }, { status: 429 });
      }

      // Create generation record
      const generation = await db.generation.create({
        data: {
          telegramUserId: telegramId,
          eventSlug: slug,
          eventQuestion: eventQuestion || null,
          status: 'running',
        },
      });

      generationId = generation.id;
      subscriptionId = sub.id;

      // Debit one generation
      await db.subscription.update({
        where: { id: sub.id },
        data: {
          generationsLeft: sub.generationsLeft - 1,
          totalUsed: sub.totalUsed + 1,
        },
      });
    }

    // Call Dify workflow
    const gammaUrl = `https://gamma-api.polymarket.com/events?slug=${encodeURIComponent(slug)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

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

      // Refund generation on Dify error
      if (generationId && subscriptionId) {
        await refundGeneration(generationId, subscriptionId, telegramId, `Dify error ${difyResponse.status}`);
      }

      return NextResponse.json(
        { error: `Pipeline error: ${difyResponse.status}` },
        { status: 502 }
      );
    }

    const data: DifyWorkflowResponse = await difyResponse.json();

    if (data.data?.status === 'succeeded' && data.data.outputs) {
      // Mark generation as completed
      if (generationId) {
        const outputKeys = Object.keys(data.data.outputs);
        const textKey = outputKeys.find(k =>
          k.toLowerCase().includes('text') ||
          k.toLowerCase().includes('result') ||
          k.toLowerCase().includes('output') ||
          k.toLowerCase().includes('analysis') ||
          k.toLowerCase().includes('response')
        ) || outputKeys[0];

        await db.generation.update({
          where: { id: generationId },
          data: {
            status: 'completed',
            result: String(data.data.outputs[textKey] || '').slice(0, 10000),
          },
        });
      }

      return NextResponse.json({
        success: true,
        outputs: data.data.outputs,
        elapsed_time: data.data.elapsed_time,
      });
    }

    // Dify returned failure
    const difyError = data.data?.error || 'Pipeline returned unexpected response';

    // Refund generation
    if (generationId && subscriptionId) {
      await refundGeneration(generationId, subscriptionId, telegramId, difyError);
    }

    if (data.data?.error) {
      return NextResponse.json({ error: difyError }, { status: 502 });
    }

    return NextResponse.json({ error: difyError }, { status: 502 });
  } catch (error) {
    console.error('Phantom Vision error:', error);
    const msg = error instanceof Error && error.name === 'AbortError'
      ? 'Pipeline timed out after 2 minutes. Try again.'
      : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function refundGeneration(
  generationId: string,
  subscriptionId: string,
  telegramId: number,
  errorMessage: string
) {
  try {
    // Anti-farm: check refund rate
    const sub = await db.subscription.findFirst({
      where: { telegramUserId: telegramId, isActive: true },
    });

    if (!sub) return;

    // Max 50% refund rate
    const refundRate = sub.totalPurchased > 0 ? sub.totalRefunded / sub.totalPurchased : 0;
    if (refundRate >= 0.5) {
      await db.generation.update({
        where: { id: generationId },
        data: { status: 'failed', errorMessage, refunded: false },
      });
      console.log(`🛡️ Anti-farm: refund blocked for user ${telegramId} (rate: ${Math.round(refundRate * 100)}%)`);
      return;
    }

    // Refund
    await db.generation.update({
      where: { id: generationId },
      data: { status: 'refunded', refunded: true, errorMessage },
    });

    await db.subscription.update({
      where: { id: sub.id },
      data: {
        generationsLeft: sub.generationsLeft + 1,
        totalRefunded: sub.totalRefunded + 1,
      },
    });

    console.log(`↩️ Refunded generation ${generationId} for user ${telegramId}`);
  } catch (err) {
    console.error('Refund error:', err);
  }
}