import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Commission tiers: level -> percent
const COMMISSION_TIERS: Record<number, number> = {
  1: 30, // direct referrer: 30%
  2: 10, // 2nd level: 10%
  3: 5,  // 3rd level: 5%
};

const MAX_LEVEL = 3;

// POST /api/subscription/webhook — 2328.io callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 2328.io sends: { order_id, status, ... }
    const { order_id, status } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // Find payment by orderId
    const payment = await db.payment.findUnique({
      where: { orderId: String(order_id) },
      include: { user: true },
    });

    if (!payment) {
      console.error('Webhook: payment not found for order', order_id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Already processed?
    if (payment.status === 'paid') {
      return NextResponse.json({ ok: true, message: 'Already processed' });
    }

    if (status === 'paid' || status === 'success' || status === 'completed') {
      // Mark payment as paid
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      });

      // Grant subscription: increase generationsLimit
      const newLimit = payment.user.generationsLimit + payment.generationsGranted;
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 30);

      await db.user.update({
        where: { id: payment.user.id },
        data: {
          subscriptionStatus: 'premium',
          subscriptionExpiry: newExpiry,
          generationsLimit: newLimit,
        },
      });

      // Process multi-level referral commissions
      await processReferralCommissions(payment.user.id, payment.amount, payment.id);

      console.log(`✅ Payment ${order_id} processed. User ${payment.user.telegramId} granted ${payment.generationsGranted} generations.`);
    } else if (status === 'failed' || status === 'expired') {
      await db.payment.update({
        where: { id: payment.id },
        data: { status },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Walk up the referral chain and distribute commissions.
 * Level 1 (direct inviter): 30%
 * Level 2 (inviter's inviter): 10%
 * Level 3: 5%
 */
async function processReferralCommissions(buyerId: string, paymentAmount: number, paymentId: string) {
  let currentCode = null;

  // Get the buyer's referrer code
  const buyer = await db.user.findUnique({
    where: { id: buyerId },
    select: { referredByCode: true },
  });

  if (!buyer?.referredByCode) return;

  let currentReferralCode: string | null = buyer.referredByCode;

  for (let level = 1; level <= MAX_LEVEL; level++) {
    const percent = COMMISSION_TIERS[level];
    if (!percent) break;

    // Find the referrer by their referral code
    const referrer = await db.user.findUnique({
      where: { referralCode: currentReferralCode },
      select: { id: true, referredByCode: true },
    });

    if (!referrer) break;

    const commissionAmount = (paymentAmount * percent) / 100;

    // Credit balance + record commission
    await db.$transaction([
      // Credit balance to referrer
      db.user.update({
        where: { id: referrer.id },
        data: { balance: { increment: commissionAmount } },
      }),
      // Record commission
      db.referralCommission.create({
        data: {
          receiverId: referrer.id,
          senderId: buyerId,
          paymentId,
          level,
          percent,
          amount: commissionAmount,
        },
      }),
    ]);

    console.log(`  💰 Level ${level}: +$${commissionAmount.toFixed(2)} (${percent}%) → referrer ${referrer.id}`);

    // Walk up the chain
    currentReferralCode = referrer.referredByCode ?? null;
    if (!currentReferralCode) break;
  }
}