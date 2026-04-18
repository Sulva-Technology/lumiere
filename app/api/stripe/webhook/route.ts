import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { finalizePaidOrder } from '@/lib/data/checkout';
import { finalizePaidBooking } from '@/lib/data/public';
import { getRequiredEnv } from '@/lib/env';
import { logEvent } from '@/lib/observability';
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
    logEvent('warn', 'stripe.webhook_invalid_signature', {
      hasSignature: Boolean(signature),
    });
    return NextResponse.json({ data: null, error: 'Invalid payment signature.', meta: null }, { status: 400 });
  }

  try {
    logEvent('info', 'stripe.webhook_received', {
      eventId: event.id,
      type: event.type,
      livemode: event.livemode,
    });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = typeof session.metadata?.paymentId === 'string' ? session.metadata.paymentId : '';
      const orderId = typeof session.metadata?.orderId === 'string' ? session.metadata.orderId : '';
      const reservationId = typeof session.metadata?.reservationId === 'string' ? session.metadata.reservationId : '';
      const kind = typeof session.metadata?.kind === 'string' ? session.metadata.kind : 'order';
      const paymentIntentId = extractPaymentIntentId(session);

      logEvent('info', 'stripe.checkout_session_completed', {
        eventId: event.id,
        sessionId: session.id,
        paymentId: paymentId || null,
        orderId: orderId || null,
        reservationId: reservationId || null,
        kind,
        paymentIntentId,
        livemode: session.livemode,
      });

      if (kind === 'booking') {
        await finalizePaidBooking({
          paymentId,
          providerReference: paymentIntentId,
          sessionReference: session.id,
          reservationId,
        });
      } else {
        await finalizePaidOrder({
          paymentId,
          providerReference: paymentIntentId,
          sessionReference: session.id,
          orderId,
        });
      }
    }

    return NextResponse.json({ data: { received: true }, error: null, meta: null });
  } catch (error) {
    logEvent('error', 'stripe.webhook_processing_failed', {
      eventId: event.id,
      type: event.type,
      reason: error instanceof Error ? error.message : 'Payment processing failed.',
    });
    return NextResponse.json({ data: null, error: 'Payment processing failed.', meta: null }, { status: 500 });
  }
}
