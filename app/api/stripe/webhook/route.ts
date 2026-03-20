import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { finalizePaidOrder } from '@/lib/data/checkout';
import { getStripe } from '@/lib/stripe';
import { getRequiredEnv } from '@/lib/env';

export async function POST(request: Request) {
  const stripe = getStripe();
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, getRequiredEnv('STRIPE_WEBHOOK_SECRET'));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid webhook signature.' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await finalizePaidOrder(session.id, typeof session.payment_intent === 'string' ? session.payment_intent : null);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook processing failed.' }, { status: 500 });
  }
}
