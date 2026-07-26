import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/referrals/stats?telegramId=123
export async function GET(request: NextRequest) {
  const telegramId = request.nextUrl.searchParams.get('telegramId');
  if (!telegramId) {
    return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
  }

  try {
    const tid = BigInt(telegramId);

    // Count direct referrals
    const referralCount = await db.telegramUser.count({
      where: { referredById: tid },
    });

    // Count active referrals (those who purchased)
    const activeReferralCount = await db.telegramUser.count({
      where: {
        referredById: tid,
        purchases: { some: { status: 'paid' } },
      },
    });

    // Total earned from referrals
    const earnings = await db.referralEarning.findMany({
      where: { referrerId: tid },
      select: { amount: true, cashedOut: true, createdAt: true, referred: { select: { firstName: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const totalEarned = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalCashedOut = earnings.filter(e => e.cashedOut).reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Recent referral list
    const referrals = await db.telegramUser.findMany({
      where: { referredById: tid },
      select: {
        id: true,
        firstName: true,
        username: true,
        photoUrl: true,
        createdAt: true,
        purchases: {
          where: { status: 'paid' },
          select: { amount: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const referralList = referrals.map(r => ({
      id: Number(r.id),
      firstName: r.firstName,
      username: r.username,
      photoUrl: r.photoUrl,
      joinedAt: r.createdAt,
      totalSpent: r.purchases.reduce((s, p) => s + parseFloat(p.amount), 0),
      purchaseCount: r.purchases.length,
    }));

    // Earnings history
    const earningsHistory = earnings.map(e => ({
      amount: parseFloat(e.amount),
      cashedOut: e.cashedOut,
      date: e.createdAt,
      referredName: e.referred?.firstName || 'Unknown',
      referredUsername: e.referred?.username,
    }));

    return NextResponse.json({
      stats: {
        referralCount,
        activeReferralCount,
        totalEarned: Math.round(totalEarned * 100) / 100,
        totalCashedOut: Math.round(totalCashedOut * 100) / 100,
        pendingBalance: Math.round((totalEarned - totalCashedOut) * 100) / 100,
      },
      referrals: referralList,
      earningsHistory,
    });
  } catch (error) {
    console.error('[referrals/stats] error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}