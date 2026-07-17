import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/debit-generation — use one generation (called when opening chatflow)
export async function POST(request: NextRequest) {
  try {
    const { telegramId, eventSlug, eventQuestion } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
    }

    const sub = await db.subscription.findFirst({
      where: { telegramUserId: telegramId, isActive: true },
    });

    if (!sub || sub.generationsLeft <= 0) {
      return NextResponse.json({ error: 'No generations left', code: 'NO_GENERATIONS' }, { status: 429 });
    }

    // Create generation record
    await db.generation.create({
      data: {
        telegramUserId: telegramId,
        eventSlug: eventSlug || '',
        eventQuestion: eventQuestion || null,
        status: 'completed',
      },
    });

    // Debit
    await db.subscription.update({
      where: { id: sub.id },
      data: {
        generationsLeft: sub.generationsLeft - 1,
        totalUsed: sub.totalUsed + 1,
      },
    });

    return NextResponse.json({ ok: true, generationsLeft: sub.generationsLeft - 1 });
  } catch (error) {
    console.error('[debit-generation] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}