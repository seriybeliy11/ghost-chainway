import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const API_KEY = process.env.PAYMENT_2328_API_KEY || '';
const PAYOUT_KEY = process.env.PAYMENT_2328_PAYOUT_KEY || '';
const PROJECT_UUID = process.env.PAYMENT_2328_PROJECT_UUID || '';
const API_BASE = 'https://api.2328.io';
const REFERRAL_PERCENT = 10;
const AUTO_CASHOUT_PERCENT = 5;

// How many generations per amount
const GENERATIONS_MAP: Record<string, number> = {
  '2.00': 20,
  '4.00': 50,
  '10.00': 150,
};

function apiSign(body: string, apiKey: string): string {
  const base64 = Buffer.from(body, 'utf8').toString('base64');
  return createHmac('sha256', apiKey).update(base64).digest('hex');
}

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
      const generationsToAdd = GENERATIONS_MAP[purchase.amount] || 20;

      // Mark purchase as paid
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

      // Process referral commission
      const buyer = await db.telegramUser.findUnique({
        where: { id: purchase.telegramUserId },
        include: { parent: true },
      });

      if (buyer?.referredById && buyer.parent) {
        const purchaseAmount = parseFloat(purchase.amount);
        const commission = (purchaseAmount * REFERRAL_PERCENT / 100).toFixed(2);
        const cashoutAmount = (purchaseAmount * AUTO_CASHOUT_PERCENT / 100).toFixed(2);

        // Record referral earning
        const earning = await db.referralEarning.create({
          data: {
            referrerId: buyer.referredById,
            referredId: purchase.telegramUserId,
            purchaseId: purchase.id,
            amount: commission,
            percent: REFERRAL_PERCENT,
            cashedOut: false,
          },
        });

        // Update referrer's balance and total earned
        await db.telegramUser.update({
          where: { id: buyer.referredById },
          data: {
            balance: { increment: parseFloat(commission) },
            totalEarned: { increment: parseFloat(commission) },
          },
        });

        // Auto cashout 5% if referrer has a cashout address
        const referrer = await db.telegramUser.findUnique({
          where: { id: buyer.referredById },
          select: { cashoutAddress: true },
        });

        if (referrer?.cashoutAddress && PAYOUT_KEY && PROJECT_UUID) {
          try {
            const payoutPayload = {
              address: referrer.cashoutAddress,
              amount: cashoutAmount,
              currency: 'USDT',
              order_id: `CO-${buyer.referredById}-${purchase.id.slice(0, 8)}`,
            };

            const payoutBody = JSON.stringify(payoutPayload);
            const payoutSign = apiSign(payoutBody, PAYOUT_KEY);

            const payoutRes = await fetch(`${API_BASE}/api/v1/payout/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Project': PROJECT_UUID,
                'X-Signature': payoutSign,
              },
              body: payoutBody,
            });

            if (payoutRes.ok) {
              // Mark as cashed out
              await db.referralEarning.update({
                where: { id: earning.id },
                data: { cashedOut: true },
              });
              console.log(`✅ Auto cashout $${cashoutAmount} to referrer ${buyer.referredById}`);
            } else {
              const errText = await payoutRes.text();
              console.error('Payout failed:', errText);
            }
          } catch (payoutErr) {
            console.error('Payout error:', payoutErr);
          }
        }

        console.log(`💰 Referral: $${commission} commission to ${buyer.referredById} (auto cashout $${cashoutAmount})`);
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