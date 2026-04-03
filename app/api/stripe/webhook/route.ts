import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { finalizePaidOrder } from '@/lib/data/checkout';
import { finalizePaidBooking } from '@/lib/data/public';
import { getRequiredEnv } from '@/lib/env';
import { extractPaymentIntentId, verifyHostedCheckoutEvent } from '@/lib/payments';

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    getRequiredEnv('STRIPE_WEBHOOK_SECRET');
    event = verifyHostedCheckoutEvent(payload, signature);
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid payment signature.', meta: null }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = typeof session.metadata?.paymentId === 'string' ? session.metadata.paymentId : '';
      const kind = typeof session.metadata?.kind === 'string' ? session.metadata.kind : 'order';

      if (paymentId) {
        if (kind === 'booking') {
          await finalizePaidBooking(paymentId, extractPaymentIntentId(session));
        } else {
          await finalizePaidOrder(paymentId, extractPaymentIntentId(session));
        }
      }
    }

    return NextResponse.json({ data: { received: true }, error: null, meta: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Payment processing failed.', meta: null }, { status: 500 });
  }
}
