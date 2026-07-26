import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET /api/user?telegramId=123
export async function GET(request: NextRequest) {
  const telegramId = request.nextUrl.searchParams.get('telegramId');
  if (!telegramId) {
    return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
  }

  try {
    const user = await db.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: {
        _count: {
          select: {
            receivedCommissions: true,
            payments: { where: { status: 'paid' } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null, exists: false });
    }

    return NextResponse.json({
      user: {
        ...user,
        id: user.id !== undefined && user.id !== null ? Number(user.id) : user.id,
      },
      stats: {
        totalReferrals: user._count.payments,
        totalCommissions: user._count.receivedCommissions,
      },
      exists: true,
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST /api/user — Create or update user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, username, firstName, lastName, photoUrl, languageCode, isAuthorized, initDataRaw, referredByCode } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
    }

    const referralCode = generateReferralCode();
    const tgId = BigInt(telegramId);

    const existingUser = await db.user.findUnique({
      where: { telegramId: tgId },
      select: { id: true, referralCode: true },
    });

    if (existingUser) {
      const user = await db.user.update({
        where: { telegramId: tgId },
        data: {
          username,
          firstName,
          lastName,
          photoUrl,
          languageCode,
          isAuthorized: isAuthorized ?? true,
          initDataRaw,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ user: { ...user, id: Number(user.id) }, referralCode: user.referralCode, exists: true });
    }

    // New user — validate referral code if provided
    let validReferrerCode: string | null = null;
    if (referredByCode) {
      const inviter = await db.user.findUnique({
        where: { referralCode: referredByCode },
        select: { id: true },
      });
      if (inviter) validReferrerCode = referredByCode;
    }

    const user = await db.user.create({
      data: {
        telegramId: tgId,
        username,
        firstName,
        lastName,
        photoUrl,
        languageCode,
        isAuthorized: isAuthorized ?? true,
        initDataRaw,
        referralCode,
        referredByCode: validReferrerCode,
      },
    });

    return NextResponse.json({ user: { ...user, id: Number(user.id) }, referralCode: user.referralCode, exists: true, isNew: true });
  } catch (error) {
    console.error('Failed to upsert user:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}