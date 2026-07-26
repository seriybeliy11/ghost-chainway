import { createHmac, createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function createHmacSha256(key: Buffer, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest();
}

// Telegram Login Widget sends auth data as query params (redirect from oauth.telegram.org)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.redirect(new URL('/?auth_error=no_bot', request.url));
    }

    // Extract all params from the widget callback
    const id = searchParams.get('id');
    const first_name = searchParams.get('first_name') || 'Unknown';
    const last_name = searchParams.get('last_name');
    const username = searchParams.get('username');
    const photo_url = searchParams.get('photo_url');
    const language_code = searchParams.get('language_code');
    const auth_date = searchParams.get('auth_date');
    const hash = searchParams.get('hash');

    if (!id || !hash || !auth_date) {
      return NextResponse.redirect(new URL('/?auth_error=missing_data', request.url));
    }

    // Validate auth_date (max 5 minutes)
    const authTimestamp = parseInt(auth_date, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authTimestamp > 300) {
      return NextResponse.redirect(new URL('/?auth_error=expired', request.url));
    }

    // Build data-check-string: sort all params except hash, join with \n
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'hash' && value) {
        params[key] = value;
      }
    });

    const dataCheckString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('\n');

    // Login Widget validation: HMAC-SHA256(SHA256(bot_token), data_check_string)
    // See: https://core.telegram.org/widgets/login#checking-authorization
    const secretKey = createHash('sha256').update(botToken).digest();
    const calculatedHash = createHmacSha256(secretKey, dataCheckString).toString('hex');

    if (calculatedHash !== hash) {
      console.warn('[auth/telegram-widget] invalid hash');
      return NextResponse.redirect(new URL('/?auth_error=invalid', request.url));
    }

    const telegramId = BigInt(id);

    // Check for referral code in URL
    const refCode = searchParams.get('ref');

    // Upsert user
    let referredById: bigint | null = null;

    if (refCode) {
      const referrer = await db.telegramUser.findUnique({
        where: { referrerCode: refCode },
        select: { id: true },
      });
      if (referrer) referredById = referrer.id;
    }

    const user = await db.telegramUser.upsert({
      where: { id: telegramId },
      create: {
        id: telegramId,
        firstName: first_name,
        lastName: lastName || null,
        username: username || null,
        photoUrl: photo_url || null,
        languageCode: language_code || null,
        referrerCode: `ph_${telegramId}`,
        referredById,
      },
      update: {
        firstName: first_name,
        lastName: lastName || null,
        username: username || null,
        photoUrl: photo_url || null,
        languageCode: language_code || null,
        authDate: new Date(),
      },
    });

    // Get or create free subscription
    let subscription = await db.subscription.findFirst({
      where: { telegramUserId: telegramId, isActive: true },
    });

    if (!subscription) {
      subscription = await db.subscription.create({
        data: {
          telegramUserId: telegramId,
          planType: 'free',
          generationsLeft: 5,
          totalPurchased: 0,
        },
      });
    }

    // Create a session token
    const sessionToken = Buffer.from(
      JSON.stringify({ tid: user.id.toString(), ts: Date.now() })
    ).toString('base64url');

    // Redirect back to main page with auth data
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('auth', 'success');
    redirectUrl.searchParams.set('tid', String(user.id));
    redirectUrl.searchParams.set('fn', encodeURIComponent(user.firstName || ''));
    redirectUrl.searchParams.set('ln', encodeURIComponent(user.lastName || ''));
    redirectUrl.searchParams.set('un', encodeURIComponent(user.username || ''));
    redirectUrl.searchParams.set('pp', encodeURIComponent(user.photoUrl || ''));
    redirectUrl.searchParams.set('rc', user.referrerCode || '');
    redirectUrl.searchParams.set('gl', String(subscription.generationsLeft));
    redirectUrl.searchParams.set('pt', subscription.planType);
    redirectUrl.searchParams.set('ri', referredById ? String(referredById) : '');

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('phantom_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[auth/telegram-widget] error:', error);
    return NextResponse.redirect(new URL('/?auth_error=server', request.url));
  }
}