import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/auth/session — validate session cookie and return user
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('phantom_session');
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }

    let payload: { tid: number; ts: number };
    try {
      const decoded = Buffer.from(sessionCookie.value, 'base64url').toString('utf-8');
      payload = JSON.parse(decoded);
    } catch {
      return NextResponse.json({ user: null });
    }

    const age = Date.now() - payload.ts;
    if (age > 30 * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ user: null });
    }

    const user = await db.telegramUser.findUnique({
      where: { id: payload.tid },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        photoUrl: true,
        referrerCode: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const subscription = await db.subscription.findFirst({
      where: { telegramUserId: user.id, isActive: true },
      select: { planType: true, generationsLeft: true, totalPurchased: true, totalUsed: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email || undefined,
        first_name: user.email ? user.email.split('@')[0] : user.firstName,
        last_name: user.lastName || undefined,
        username: user.username || undefined,
        photo_url: user.photoUrl || undefined,
        isAuthorized: true,
        referrerCode: user.referrerCode || undefined,
        planType: subscription?.planType || 'free',
        generationsLeft: subscription?.generationsLeft || 0,
        totalPurchased: subscription?.totalPurchased || 0,
        totalUsed: subscription?.totalUsed || 0,
      },
    });
  } catch (error) {
    console.error('[auth/session] error:', error);
    return NextResponse.json({ user: null });
  }
}