import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function createHmacSha256(key: Buffer, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest();
}

function parseInitData(initData: string): Record<string, string> {
  const params: Record<string, string> = {};
  initData.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return params;
}

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json({ error: 'No initData provided' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    // Validate initData
    const params = parseInitData(initData);
    const hash = params['hash'];
    delete params['hash'];

    // Sort remaining params and create data-check-string
    const dataCheckString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('\n');

    const secretKey = createHmacSha256(
      Buffer.from('WebAppData', 'utf-8'),
      Buffer.from(botToken, 'utf-8')
    );
    const calculatedHash = createHmacSha256(secretKey, dataCheckString);
    const calculatedHashHex = calculatedHash.toString('hex');

    if (calculatedHashHex !== hash) {
      return NextResponse.json({ error: 'Invalid auth data' }, { status: 401 });
    }

    // Check auth date (max 5 minutes old)
    const authDate = parseInt(params['auth_date'], 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 300) {
      return NextResponse.json({ error: 'Auth data expired' }, { status: 401 });
    }

    const telegramId = parseInt(params['id'], 10);
    const firstName = params['first_name'] || 'Unknown';
    const lastName = params['last_name'] || null;
    const username = params['username'] || null;
    const photoUrl = params['photo_url'] || null;
    const languageCode = params['language_code'] || null;

    // Upsert user
    const user = await db.telegramUser.upsert({
      where: { id: telegramId },
      create: {
        id: telegramId,
        firstName,
        lastName,
        username,
        photoUrl,
        languageCode,
        referrerCode: `ph_${telegramId}`,
      },
      update: {
        firstName,
        lastName,
        username,
        photoUrl,
        languageCode,
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

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        isAuthorized: true,
        referrerCode: user.referrerCode,
      },
      subscription: {
        planType: subscription.planType,
        generationsLeft: subscription.generationsLeft,
        totalPurchased: subscription.totalPurchased,
      },
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}