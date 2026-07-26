import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/** Deterministic numeric ID from email (2B+ range to avoid Telegram ID conflicts) */
function emailToId(email: string): number {
  let hash = 0;
  const str = email.toLowerCase().trim();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return 2_000_000_000 + (Math.abs(hash) % 1_000_000_000);
}

// POST /api/auth/email — simple email login (no verification)
export async function POST(request: NextRequest) {
  try {
    const { email, ref } = await request.json();

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userId = BigInt(emailToId(normalizedEmail));

    // Resolve referral
    let referredById: bigint | null = null;
    if (ref) {
      const referrer = await db.telegramUser.findUnique({
        where: { referrerCode: ref },
        select: { id: true },
      });
      if (referrer) referredById = referrer.id;
    }

    // Check if user exists by email
    const existingByEmail = await db.telegramUser.findUnique({
      where: { email: normalizedEmail },
    });

    let user;
    if (existingByEmail) {
      user = await db.telegramUser.update({
        where: { id: existingByEmail.id },
        data: { authDate: new Date() },
      });
    } else {
      user = await db.telegramUser.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: normalizedEmail,
          firstName: normalizedEmail.split('@')[0],
          username: normalizedEmail,
          referrerCode: `ph_${userId}`,
          referredById,
        },
        update: {
          email: normalizedEmail,
          authDate: new Date(),
        },
      });
    }

    // Get or create subscription (no free generations for email users)
    let subscription = await db.subscription.findFirst({
      where: { telegramUserId: user.id, isActive: true },
    });

    if (!subscription) {
      subscription = await db.subscription.create({
        data: {
          telegramUserId: user.id,
          planType: 'free',
          generationsLeft: 0,
          totalPurchased: 0,
        },
      });
    }

    // Session token
    const sessionToken = Buffer.from(
      JSON.stringify({ tid: user.id.toString(), ts: Date.now() })
    ).toString('base64url');

    const response = NextResponse.json({
      user: {
        id: Number(user.id),
        email: user.email,
        firstName: user.firstName,
        referrerCode: user.referrerCode,
      },
      subscription: {
        planType: subscription.planType,
        generationsLeft: subscription.generationsLeft,
        totalPurchased: subscription.totalPurchased,
      },
    });

    response.cookies.set('phantom_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[auth/email] error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}