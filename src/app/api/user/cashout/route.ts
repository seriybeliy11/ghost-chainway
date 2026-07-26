import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/user/cashout — update cashout address
export async function POST(request: NextRequest) {
  try {
    const { telegramId, cashoutAddress } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
    }

    if (!cashoutAddress || typeof cashoutAddress !== 'string' || cashoutAddress.length < 10) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const tgId = BigInt(telegramId);

    await db.telegramUser.update({
      where: { id: tgId },
      data: { cashoutAddress },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[cashout] error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}