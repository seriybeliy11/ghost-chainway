import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PROJECT_UUID = process.env.PAYMENT_2328_PROJECT_UUID || '';
const API_KEY = process.env.PAYMENT_2328_API_KEY || '';
const API_BASE = process.env.PAYMENT_2328_API_BASE || 'https://2328.io';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

function apiSign(body: string, apiKey: string): string {
  const base64 = Buffer.from(body, 'utf8').toString('base64');
  return createHmac('sha256', apiKey).update(base64).digest('hex');
}

// Pricing plans
const PLANS: Record<string, { amount: string; generations: number }> = {
  starter: { amount: '2.00', generations: 20 },
  pro: { amount: '4.00', generations: 50 },
  whale: { amount: '10.00', generations: 150 },
};

export async function POST(request: NextRequest) {
  try {
    const { telegramId, plan = 'starter' } = await request.json();

    if (!telegramId || !PLANs[plan]) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!API_KEY || !PROJECT_UUID) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 503 });
    }

    const pricing = PLANS[plan];
    const orderId = `PH-${telegramId}-${Date.now()}`;

    // Create purchase record
    await db.purchase.create({
      data: {
        telegramUserId: telegramId,
        amount: pricing.amount,
        currency: 'USDT',
        orderId,
      },
    });

    // Build 2328.io request
    const body = JSON.stringify({
      amount: pricing.amount,
      currency: 'USDT',
      order_id: orderId,
      url_callback: `${BASE_URL}/api/payment/webhook`,
    });

    const signature = apiSign(body, API_KEY);

    const response = await fetch(`${API_BASE}/api/v1/invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project': PROJECT_UUID,
        'X-Signature': signature,
      },
      body,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('2328.io error:', response.status, errText);
      return NextResponse.json({ error: 'Payment gateway error' }, { status: 502 });
    }

    const invoiceData = await response.json();

    // Update purchase with invoice ID
    if (invoiceData?.id) {
      await db.purchase.update({
        where: { orderId },
        data: { invoiceId: String(invoiceData.id) },
      });
    }

    return NextResponse.json({
      orderId,
      payUrl: invoiceData?.pay_url || invoiceData?.url || invoiceData?.checkout_url,
      invoiceId: invoiceData?.id,
      amount: pricing.amount,
      generations: pricing.generations,
    });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}