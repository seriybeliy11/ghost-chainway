import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { telegramId, eventSlug, eventQuestion } = await request.json();

    if (!telegramId || !eventSlug) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const tgId = BigInt(telegramId);

    // Get active subscription
    const sub = await db.subscription.findFirst({
      where: { telegramUserId: tgId, isActive: true },
    });

    if (!sub || sub.generationsLeft <= 0) {
      return NextResponse.json({
        allowed: false,
        error: 'No generations left',
        generationsLeft: sub?.generationsLeft ?? 0,
      });
    }

    // Create generation record
    const generation = await db.generation.create({
      data: {
        telegramUserId: tgId,
        eventSlug,
        eventQuestion: eventQuestion || null,
        status: 'running',
      },
    });

    // Debit one generation
    await db.subscription.update({
      where: { id: sub.id },
      data: {
        generationsLeft: sub.generationsLeft - 1,
        totalUsed: sub.totalUsed + 1,
      },
    });

    return NextResponse.json({
      allowed: true,
      generationId: generation.id,
      generationsLeft: sub.generationsLeft - 1,
    });
  } catch (error) {
    console.error('Generation use error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Refund a failed generation (with anti-farm protection)
export async function PATCH(request: NextRequest) {
  try {
    const { telegramId, generationId } = await request.json();

    if (!telegramId || !generationId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const tgId = BigInt(telegramId);

    const generation = await db.generation.findUnique({
      where: { id: generationId },
    });

    if (!generation || generation.telegramUserId !== tgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (generation.refunded) {
      return NextResponse.json({ error: 'Already refunded' }, { status: 400 });
    }

    // Anti-farm: check refund rate
    const sub = await db.subscription.findFirst({
      where: { telegramUserId: tgId, isActive: true },
    });

    if (!sub) {
      return NextResponse.json({ error: 'No subscription' }, { status: 404 });
    }

    // Max 50% refund rate
    const refundRate = sub.totalPurchased > 0 ? sub.totalRefunded / sub.totalPurchased : 0;
    if (refundRate >= 0.5) {
      return NextResponse.json({
        refunded: false,
        error: 'Refund limit reached (50% max)',
        refundRate: Math.round(refundRate * 100),
      });
    }

    // Refund
    await db.generation.update({
      where: { id: generationId },
      data: { status: 'refunded', refunded: true, errorMessage: 'Auto-refunded' },
    });

    await db.subscription.update({
      where: { id: sub.id },
      data: {
        generationsLeft: sub.generationsLeft + 1,
        totalRefunded: sub.totalRefunded + 1,
      },
    });

    return NextResponse.json({
      refunded: true,
      generationsLeft: sub.generationsLeft + 1,
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}