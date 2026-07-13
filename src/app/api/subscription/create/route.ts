import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomUUID } from 'crypto';
import { db } from '@/lib/db';

const PROJECT_UUID = process.env.CURRENCY_2328_PROJECT_UUID || '';
const API_KEY = process.env.CURRENCY_2328_API_KEY || '';

// Subscription plans
const PLANS: Record<string, { amount: string; generations: number; label: string }> = {
  premium: { amount: '4.00', generations: 40, label: 'Premium — 40 generations' },
};

function apiSign(body: string, apiKey: string): string {
  const base64 = Buffer.from(body, 'utf8').toString('base64');
  return createHmac('sha256', apiKey).update(base64).digest('hex');
}

// POST /api/subscription/create — create 2328.io invoice
export async function POST(request: NextRequest) {
  try {
    const { telegramId, plan = 'premium' } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
    }

    const planConfig = PLANS[plan];
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Find or create user
    const user = await db.user.upsert({
      where: { telegramId },
      update: { isAuthorized: true, updatedAt: new Date() },
      create: {
        telegramId,
        firstName: 'User',
        isAuthorized: true,
        referralCode: generateReferralCode(),
      },
    });

    const orderId = `PH-${randomUUID().slice(0, 12)}`;

    // Create payment record
    await db.payment.create({
      data: {
        userId: user.id,
        amount: planConfig.amount as unknown as number,
        currency: 'USD',
        type: plan,
        orderId,
        status: 'pending',
        generationsGranted: planConfig.generations,
      },
    });

    // Build 2328.io request
    const invoiceData = {
      amount: planConfig.amount,
      currency: 'USD',
      order_id: orderId,
      url_callback: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-site.com'}/api/subscription/webhook`,
    };

    const bodyStr = JSON.stringify(invoiceData);
    const sign = apiSign(bodyStr, API_KEY);

    const response = await fetch('https://api.2328.io/v1/invoice/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project': PROJECT_UUID,
        'X-Sign': sign,
      },
      body: bodyStr,
    });

    const result = await response.json();

    if (!response.ok || !result?.url) {
      console.error('2328.io invoice error:', result);
      return NextResponse.json({ error: 'Failed to create invoice', details: result }, { status: 500 });
    }

    // Store invoice ID
    await db.payment.update({
      where: { orderId },
      data: { invoiceId: result.id?.toString() || result.invoice_id?.toString() },
    });

    return NextResponse.json({
      url: result.url,
      orderId,
      amount: planConfig.amount,
      generations: planConfig.generations,
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}