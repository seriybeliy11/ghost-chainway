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
      where: { telegramId: parseInt(telegramId) },
      include: {
        _count: { select: { referrals: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null, exists: false });
    }

    return NextResponse.json({
      user,
      referralCount: user._count.referrals,
      exists: true,
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST /api/user - Create or update user (auto-generates referral code)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, username, firstName, lastName, photoUrl, languageCode, isAuthorized, initDataRaw, referredBy } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
    }

    // Generate a unique referral code for new users
    const referralCode = generateReferralCode();

    const existingUser = await db.user.findUnique({
      where: { telegramId },
      select: { id: true, referralCode: true },
    });

    if (existingUser) {
      // Update existing
      const user = await db.user.update({
        where: { telegramId },
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
      return NextResponse.json({ user, referralCode: user.referralCode, exists: true });
    }

    // Create new user with referral code
    const user = await db.user.create({
      data: {
        telegramId,
        username,
        firstName,
        lastName,
        photoUrl,
        languageCode,
        isAuthorized: isAuthorized ?? true,
        initDataRaw,
        referralCode,
        referredBy: referredBy || null,
      },
    });

    // If referred by someone, create a Referral record
    if (referredBy) {
      try {
        const inviter = await db.user.findUnique({
          where: { referralCode: referredBy },
          select: { id: true },
        });
        if (inviter) {
          await db.referral.create({
            data: {
              code: referredBy,
              inviterId: inviter.id,
              referredId: user.id,
              reward: 0,
            },
          });
        }
      } catch {
        // Referral record creation is best-effort
      }
    }

    return NextResponse.json({ user, referralCode: user.referralCode, exists: true, isNew: true });
  } catch (error) {
    console.error('Failed to upsert user:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}