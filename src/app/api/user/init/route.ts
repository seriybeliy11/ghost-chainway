import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      telegramId,
      firstName,
      lastName,
      username,
      photoUrl,
      languageCode,
      isAuthorized = false,
    } = body;

    if (!telegramId || !firstName) {
      return NextResponse.json({ error: 'telegramId and firstName are required' }, { status: 400 });
    }

    const tgId = BigInt(telegramId);

    // Upsert: create user if not exists, update profile fields if exists
    const user = await db.user.upsert({
      where: { id: tgId },
      create: {
        id: tgId,
        firstName,
        lastName: lastName || null,
        username: username || null,
        photoUrl: photoUrl || null,
        languageCode: languageCode || null,
        isAuthorized,
        // Default values from schema: subscriptionStatus="free", generationsAvailable=3, balance=0
      },
      update: {
        firstName,
        lastName: lastName || null,
        username: username || null,
        photoUrl: photoUrl || null,
        languageCode: languageCode || null,
        isAuthorized,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: Number(user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        languageCode: user.languageCode,
        isAuthorized: user.isAuthorized,
        subscriptionStatus: user.subscriptionStatus,
        generationsAvailable: user.generationsAvailable,
        balance: user.balance,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('[user/init] error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize user' },
      { status: 500 }
    );
  }
}