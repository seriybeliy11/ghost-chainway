import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const API_KEY = process.env.PAYMENT_2328_API_KEY || '';
const REFERRAL_PERCENT = 10;

// Pricing plans
const PLANS: Record<string, number> = {
  '2.00': 20,
  '4.00': 50,
  '10.00': 150,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature') || request.headers.get('X-Signature') || '';

    // Verify signature
    if (API_KEY && signature) {
      const base64 = Buffer.from(body, 'utf8').toString('base64');
      const expected = createHmac('sha256', API_KEY).update(base64).digest('hex');
      if (signature !== expected) {
        console.warn('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const orderId = String(data.order_id || '');
    const status = String(data.status || data.state || '');

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Find purchase
    const purchase = await db.purchase.findUnique({ where: { orderId } });
    if (!purchase) {
      console.warn('Purchase not found:', orderId);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Already processed
    if (purchase.status === 'paid') {
      return NextResponse.json({ ok: true });
    }

    if (status === 'paid' || status === 'success' || status === 'completed') {
      // Mark purchase as paid
      const generationsToAdd = PLANS[purchase.amount] || 20;

      await db.purchase.update({
        where: { orderId },
        data: { status: 'paid', generationsAdded: generationsToAdd, updatedAt: new Date() },
      });

      // Credit generations to subscription
      const sub = await db.subscription.findFirst({
        where: { telegramUserId: purchase.telegramUserId, isActive: true },
      });

      if (sub) {
        await db.subscription.update({
          where: { id: sub.id },
          data: {
            generationsLeft: sub.generationsLeft + generationsToAdd,
            totalPurchased: sub.totalPurchased + generationsToAdd,
            planType: 'premium',
          },
        });
      } else {
        await db.subscription.create({
          data: {
            telegramUserId: purchase.telegramUserId,
            planType: 'premium',
            generationsLeft: generationsToAdd,
            totalPurchased: generationsToAdd,
          },
        });
      }

      // Referral commission
      const user = await db.telegramUser.findUnique({
        where: { id: purchase.telegramUserId },
        include: { parent: true },
      });

      if (user?.referredById && user.parent) {
        const commission = (parseFloat(purchase.amount) * REFERRAL_PERCENT / 100).toFixed(2);
        await db.referralEarning.create({
          data: {
            referrerId: user.referredById,
            referredId: purchase.telegramUserId,
            purchaseId: purchase.id,
            amount: commission,
            percent: REFERRAL_PERCENT,
          },
        });
      }

      return NextResponse.json({ ok: true });
    }

    if (status === 'failed' || status === 'expired') {
      await db.purchase.update({
        where: { orderId },
        data: { status, updatedAt: new Date() },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}