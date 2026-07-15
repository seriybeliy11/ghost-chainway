import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHmac } from 'crypto';

// GET /api/auth/session — validate session cookie and return user
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('phantom_session');
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }

    // Decode session token
    let payload: { tid: number; ts: number };
    try {
      const decoded = Buffer.from(sessionCookie.value, 'base64url').toString('utf-8');
      payload = JSON.parse(decoded);
    } catch {
      return NextResponse.json({ user: null });
    }

    // Check token age (max 30 days)
    const age = Date.now() - payload.ts;
    if (age > 30 * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ user: null });
    }

    const telegramId = payload.tid;
    const user = await db.telegramUser.findUnique({
      where: { id: telegramId },
      select: {
        id: true,
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
      select: { planType: true, generationsLeft: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName || undefined,
        username: user.username || undefined,
        photo_url: user.photoUrl || undefined,
        isAuthorized: true,
        referrerCode: user.referrerCode || undefined,
        planType: subscription?.planType || 'free',
        generationsLeft: subscription?.generationsLeft || 0,
      },
    });
  } catch (error) {
    console.error('[auth/session] error:', error);
    return NextResponse.json({ user: null });
  }
}