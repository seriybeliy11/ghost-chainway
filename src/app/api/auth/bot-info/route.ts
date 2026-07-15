import { NextResponse } from 'next/server';

// GET /api/auth/bot-info — expose bot_id for Telegram Login Widget
export async function GET() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  // bot_id is the numeric part before the colon in the token
  const botId = botToken.split(':')[0];

  return NextResponse.json({
    botId,
    // The widget callback URL
    callbackUrl: '/api/auth/telegram-widget',
  });
}