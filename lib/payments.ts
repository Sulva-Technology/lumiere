import { headers } from 'next/headers';
import type Stripe from 'stripe';

import { getOptionalEnv } from '@/lib/env';
import { getOriginFromHeaders } from '@/lib/site';
import { getStripe } from '@/lib/stripe';

export type HostedCheckoutLine = {
  name: string;
  description?: string;
  amount: number;
  quantity: number;
  imageUrl?: string | null;
};

export type HostedCheckoutInput = {
  email: string;
  lines: HostedCheckoutLine[];
  successPath: string;
  cancelPath: string;
  metadata: Record<string, string>;
};

function cents(amount: number) {
  return Math.round(amount * 100);
}

export async function getAppOrigin() {
  const hdrs = await headers();
  return getOriginFromHeaders(hdrs) || getOptionalEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
}

export async function createHostedCheckoutSession(input: HostedCheckoutInput) {
  const stripe = getStripe();
  const origin = await getAppOrigin();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: input.email,
    success_url: `${origin}${input.successPath}`,
    cancel_url: `${origin}${input.cancelPath}`,
    line_items: input.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: 'usd',
        unit_amount: cents(line.amount),
        product_data: {
          name: line.name,
          description: line.description,
          images: line.imageUrl ? [line.imageUrl] : [],
        },
      },
    })),
    metadata: input.metadata,
  });

  if (!session.url) {
    throw new Error('Unable to start secure checkout right now.');
  }

  return session;
}

export function verifyHostedCheckoutEvent(payload: string, signature: string) {
  return getStripe().webhooks.constructEvent(payload, signature, getOptionalEnv('STRIPE_WEBHOOK_SECRET'));
}

export function extractPaymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === 'string' ? session.payment_intent : null;
}
