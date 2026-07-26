import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/user/profile?telegramId=123
export async function GET(request: NextRequest) {
  const telegramId = request.nextUrl.searchParams.get('telegramId');
  if (!telegramId) {
    return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
  }

  try {
    const user = await db.telegramUser.findUnique({
      where: { id: BigInt(telegramId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        photoUrl: true,
        referrerCode: true,
        balance: true,
        totalEarned: true,
        cashoutAddress: true,
        referredById: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = await db.subscription.findFirst({
      where: { telegramUserId: user.id, isActive: true },
    });

    const purchaseCount = await db.purchase.count({
      where: { telegramUserId: user.id, status: 'paid' },
    });

    return NextResponse.json({
      user: {
        ...user,
        id: Number(user.id),
        referredById: user.referredById ? Number(user.referredById) : null,
        planType: subscription?.planType || 'free',
        generationsLeft: subscription?.generationsLeft || 0,
        totalPurchased: subscription?.totalPurchased || 0,
        totalUsed: subscription?.totalUsed || 0,
        purchaseCount,
      },
    });
  } catch (error) {
    console.error('[user/profile] error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}