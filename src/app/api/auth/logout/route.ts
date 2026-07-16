import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: true }).cookies.set('phantom_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}