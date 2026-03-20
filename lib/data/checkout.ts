import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { validateCartLines } from '@/lib/data/public';
import type { CheckoutSummary, CreateCheckoutSessionInput, CreateCheckoutSessionResult } from '@/lib/types';

function cents(amount: number) {
  return Math.round(amount * 100);
}

function generateOrderNumber() {
  return `LUM-${Math.floor(Date.now() / 1000)}`;
}

export async function buildCheckoutSummary(lines: CreateCheckoutSessionInput['lines']): Promise<CheckoutSummary> {
  const validatedLines = await validateCartLines(lines);
  const subtotal = validatedLines.reduce((sum, line) => sum + line.unitAmount * line.quantity, 0);
  const shipping = subtotal >= 400 ? 0 : 25;

  return {
    currency: 'usd',
    subtotal,
    shipping,
    total: subtotal + shipping,
    lines: validatedLines,
  };
}

export async function createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult> {
  const summary = await buildCheckoutSummary(input.lines);
  const supabase = createSupabaseAdminClient();
  const stripe = getStripe();
  const hdrs = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || hdrs.get('origin') || 'http://localhost:3000';

  const { data: customer } = await supabase
    .from('customers')
    .upsert(
      {
        email: input.email,
        full_name: `${input.firstName} ${input.lastName}`.trim(),
        phone: input.phone ?? null,
      },
      { onConflict: 'email' }
    )
    .select('id')
    .single();

  const { data: address, error: addressError } = await supabase
    .from('addresses')
    .insert({
      customer_id: customer?.id ?? null,
      type: 'shipping',
      line1: input.shippingAddress.line1,
      line2: input.shippingAddress.line2 ?? null,
      city: input.shippingAddress.city,
      state: input.shippingAddress.state ?? null,
      postal_code: input.shippingAddress.postalCode,
      country: input.shippingAddress.country.toUpperCase(),
    })
    .select('id')
    .single();

  if (addressError) throw addressError;

  const orderNumber = generateOrderNumber();
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: customer?.id ?? null,
      email: input.email,
      subtotal: summary.subtotal,
      shipping_total: summary.shipping,
      total: summary.total,
      currency: summary.currency,
      payment_status: 'pending',
      fulfillment_status: 'unfulfilled',
      shipping_address_id: address.id,
    })
    .select('id')
    .single();

  if (orderError) throw orderError;

  const lineItems = summary.lines.map((line) => ({
    order_id: order.id,
    product_id: line.productId,
    variant_id: line.variantId,
    product_name: line.productName,
    variant_title: line.variantTitle,
    quantity: line.quantity,
    unit_price: line.unitAmount,
    line_total: line.unitAmount * line.quantity,
    image_url: line.imageUrl,
  }));

  const { error: orderItemsError } = await supabase.from('order_items').insert(lineItems);
  if (orderItemsError) throw orderItemsError;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: input.email,
    success_url: `${origin}/checkout?success=1&order=${order.id}`,
    cancel_url: `${origin}/checkout?canceled=1&order=${order.id}`,
    payment_method_types: ['card'],
    shipping_address_collection: {
      allowed_countries: [input.shippingAddress.country.toUpperCase() as 'US'],
    },
    line_items: [
      ...summary.lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: cents(line.unitAmount),
          product_data: {
            name: `${line.productName} - ${line.variantTitle}`,
            images: line.imageUrl ? [line.imageUrl] : [],
          },
        },
      })),
      ...(summary.shipping > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: 'usd',
                unit_amount: cents(summary.shipping),
                product_data: {
                  name: 'Shipping',
                },
              },
            },
          ]
        : []),
    ],
    metadata: {
      orderId: order.id,
      orderNumber,
    },
  });

  const { error: updateError } = await supabase
    .from('orders')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', order.id);

  if (updateError) throw updateError;

  if (!session.url) {
    throw new Error('Stripe Checkout session did not return a redirect URL.');
  }

  return {
    checkoutUrl: session.url,
    orderId: order.id,
  };
}

export async function finalizePaidOrder(checkoutSessionId: string, paymentIntentId?: string | null) {
  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, payment_status, order_items(variant_id, quantity)')
    .eq('stripe_checkout_session_id', checkoutSessionId)
    .maybeSingle();

  if (error) throw error;
  if (!order) return;
  if (order.payment_status === 'paid') return;

  const { error: updateOrderError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      fulfillment_status: 'processing',
      stripe_payment_intent_id: paymentIntentId ?? null,
    })
    .eq('id', order.id);

  if (updateOrderError) throw updateOrderError;

  for (const item of order.order_items ?? []) {
    const { data: variant } = await supabase.from('product_variants').select('stock_quantity').eq('id', item.variant_id).single();

    if (!variant) continue;

    await supabase
      .from('product_variants')
      .update({
        stock_quantity: Math.max(0, variant.stock_quantity - item.quantity),
      })
      .eq('id', item.variant_id);
  }
}

