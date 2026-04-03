import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createHostedCheckoutSession } from '@/lib/payments';
import { getPublicStoreSettings, validateCartLines } from '@/lib/data/public';
import { createAuditLog } from '@/lib/data/audit';
import { sendOrderConfirmationEmails } from '@/lib/notifications';
import type { CheckoutSummary, CreateCheckoutSessionInput, CreateCheckoutSessionResult } from '@/lib/types';

function nowIso() {
  return new Date().toISOString();
}

function expiresIn(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function generateOrderNumber() {
  return `LUM-${Math.floor(Date.now() / 1000)}`;
}

function money(value: number | string | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
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
      payment_status: 'pending_payment',
      fulfillment_status: 'unfulfilled',
      shipping_address_id: address.id,
      checkout_expires_at: expiresIn(30),
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

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      order_id: order.id,
      provider: 'hosted_checkout',
      status: 'pending',
      amount: summary.total,
      currency: summary.currency,
      method_family: 'hosted_checkout',
      expires_at: expiresIn(30),
      metadata: {
        kind: 'order',
        orderNumber,
      },
    })
    .select('id')
    .single();

  if (paymentError) throw paymentError;

  try {
    const session = await createHostedCheckoutSession({
      email: input.email,
      successPath: `/checkout?success=1&order=${order.id}`,
      cancelPath: `/checkout?canceled=1&order=${order.id}`,
      metadata: {
        kind: 'order',
        orderId: order.id,
        paymentId: payment.id,
        orderNumber,
      },
      lines: [
        ...summary.lines.map((line) => ({
          name: `${line.productName} - ${line.variantTitle}`,
          amount: line.unitAmount,
          quantity: line.quantity,
          imageUrl: line.imageUrl,
        })),
        ...(summary.shipping > 0
          ? [
              {
                name: 'Delivery',
                amount: summary.shipping,
                quantity: 1,
              },
            ]
          : []),
      ],
    });

    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        session_reference: session.id,
        provider_reference: session.id,
        idempotency_key: session.id,
      })
      .eq('id', payment.id);

    if (updatePaymentError) throw updatePaymentError;

    return {
      checkoutUrl: session.url!,
      orderId: order.id,
      paymentId: payment.id,
    };
  } catch (error) {
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: error instanceof Error ? error.message : 'Unable to start checkout.',
        failed_at: nowIso(),
      })
      .eq('id', payment.id);

    await supabase.from('orders').update({ payment_status: 'payment_failed' }).eq('id', order.id);
    throw error;
  }
}

async function decrementInventoryForOrder(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: items, error } = await supabase.from('order_items').select('variant_id, quantity').eq('order_id', orderId);
  if (error) throw error;

  for (const item of items ?? []) {
    if (!item.variant_id) continue;
    const { data: variant } = await supabase.from('product_variants').select('stock_quantity').eq('id', item.variant_id).maybeSingle();
    if (!variant) continue;

    await supabase
      .from('product_variants')
      .update({ stock_quantity: Math.max(0, variant.stock_quantity - item.quantity) })
      .eq('id', item.variant_id);
  }
}

export async function finalizePaidOrder(paymentId: string, providerReference?: string | null) {
  const supabase = createSupabaseAdminClient();
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, order_id, status, paid_at')
    .eq('id', paymentId)
    .maybeSingle();

  if (paymentError) throw paymentError;
  if (!payment?.order_id) return;
  if (payment.status === 'paid') return;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_number, email, subtotal, shipping_total, total, customers(full_name), order_items(product_name, variant_title, quantity, line_total)')
    .eq('id', payment.order_id)
    .single();

  if (orderError) throw orderError;

  await supabase
    .from('payments')
    .update({
      status: 'paid',
      paid_at: payment.paid_at ?? nowIso(),
      provider_reference: providerReference ?? payment.id,
      reconciliation_state: 'captured',
    })
    .eq('id', payment.id)
    .neq('status', 'paid');

  await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      fulfillment_status: 'processing',
    })
    .eq('id', order.id)
    .neq('payment_status', 'paid');

  await decrementInventoryForOrder(order.id);
  await createAuditLog({
    action: 'order.payment_captured',
    entityType: 'order',
    entityId: order.id,
    payload: { paymentId: payment.id },
  });

  try {
    const store = await getPublicStoreSettings();
    await sendOrderConfirmationEmails({
      storeName: store.storeName,
      supportEmail: store.supportEmail,
      customerName: order.customers?.[0]?.full_name ?? 'there',
      customerEmail: order.email,
      orderNumber: order.order_number,
      subtotal: money(order.subtotal),
      shipping: money(order.shipping_total),
      total: money(order.total),
      items: (order.order_items ?? []).map((item) => ({
        productName: item.product_name,
        variantTitle: item.variant_title,
        quantity: item.quantity,
        lineTotal: money(item.line_total),
      })),
    });
  } catch (notificationError) {
    console.error('Order confirmation email failed', notificationError);
  }
}

export async function markOrderCheckoutCancelled(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase.from('orders').select('id, payment_status').eq('id', orderId).maybeSingle();

  if (error) throw error;
  if (!order || order.payment_status === 'paid') return;

  await supabase
    .from('orders')
    .update({ payment_status: 'cancelled' })
    .eq('id', orderId)
    .neq('payment_status', 'paid');

  await supabase
    .from('payments')
    .update({
      status: 'cancelled',
      cancelled_at: nowIso(),
    })
    .eq('order_id', orderId)
    .in('status', ['created', 'pending', 'authorized']);
}

export async function expireStaleOrderPayments() {
  const supabase = createSupabaseAdminClient();
  const now = nowIso();
  const { data: stalePayments, error } = await supabase
    .from('payments')
    .select('id, order_id')
    .lt('expires_at', now)
    .in('status', ['created', 'pending', 'authorized']);

  if (error) throw error;

  for (const payment of stalePayments ?? []) {
    await supabase.from('payments').update({ status: 'expired' }).eq('id', payment.id);
    if (payment.order_id) {
      await supabase.from('orders').update({ payment_status: 'cancelled' }).eq('id', payment.order_id).neq('payment_status', 'paid');
    }
  }
}
