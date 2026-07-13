import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/user?telegramId=123
export async function GET(request: NextRequest) {
  const telegramId = request.nextUrl.searchParams.get('telegramId');
  if (!telegramId) {
    return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
  }

  try {
    const user = await db.user.findUnique({
      where: { telegramId: parseInt(telegramId) },
    });

    if (!user) {
      return NextResponse.json({ user: null, exists: false });
    }

    return NextResponse.json({ user, exists: true });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST /api/user - Create or update user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, username, firstName, lastName, photoUrl, languageCode, isAuthorized, initDataRaw } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
    }

    const user = await db.user.upsert({
      where: { telegramId },
      update: {
        username,
        firstName,
        lastName,
        photoUrl,
        languageCode,
        isAuthorized: isAuthorized ?? true,
        initDataRaw,
        updatedAt: new Date(),
      },
      create: {
        telegramId,
        username,
        firstName,
        lastName,
        photoUrl,
        languageCode,
        isAuthorized: isAuthorized ?? true,
        initDataRaw,
      },
    });

    return NextResponse.json({ user, exists: true });
  } catch (error) {
    console.error('Failed to upsert user:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}