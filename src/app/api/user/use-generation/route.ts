import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    }

    const tgId = BigInt(telegramId);

    const user = await db.user.findUnique({
      where: { id: tgId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.generationsAvailable <= 0) {
      return NextResponse.json(
        { error: 'No generations available', generationsAvailable: 0 },
        { status: 429 }
      );
    }

    const updated = await db.user.update({
      where: { id: tgId },
      data: { generationsAvailable: { decrement: 1 } },
    });

    return NextResponse.json({
      success: true,
      generationsAvailable: updated.generationsAvailable,
      generationsUsed: true,
    });
  } catch (error) {
    console.error('[user/use-generation] error:', error);
    return NextResponse.json(
      { error: 'Failed to use generation' },
      { status: 500 }
    );
  }
}