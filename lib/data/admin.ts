import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendOrderStatusUpdateEmail } from '@/lib/notifications';
import { assignMediaAsset, deleteMediaObject, updateMediaLifecycle } from '@/lib/data/media';
import { createAuditLog } from '@/lib/data/audit';
import type { AdminBookingRow, AdminCustomerRow, AdminOrderRow, Category, DashboardMetrics, PaymentRecord, ProductDetail } from '@/lib/types';

function money(value: number | string | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

function relationFirst<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function mapPayment(row: any): PaymentRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    bookingId: row.booking_id,
    reservationId: row.reservation_id,
    provider: row.provider,
    status: row.status,
    amount: money(row.amount),
    currency: row.currency,
    methodFamily: row.method_family,
    providerReference: row.provider_reference,
    sessionReference: row.session_reference,
    failureReason: row.failure_reason,
    reconciliationState: row.reconciliation_state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
    expiresAt: row.expires_at,
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createSupabaseAdminClient();
  const [
    { data: orders },
    { count: bookingsCount },
    { count: customersCount },
    { data: variants },
    revenueResult,
    { count: pendingPayments },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, email, total, payment_status, fulfillment_status, created_at, customers(full_name), order_items(id), payments(provider_reference, provider)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('customers').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('product_variants').select('id, title, stock_quantity, products(name)').order('stock_quantity').limit(3),
    supabase.from('orders').select('total, payment_status'),
    supabase.from('payments').select('id', { count: 'exact', head: true }).in('status', ['created', 'pending', 'authorized']),
  ]);

  const totalRevenue = (revenueResult.data ?? [])
    .filter((order) => order.payment_status === 'paid')
    .reduce((sum, order) => sum + money(order.total), 0);

  const recentOrders: AdminOrderRow[] = (orders ?? []).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    customerName: relationFirst(order.customers)?.full_name ?? 'Guest customer',
    email: order.email,
    createdAt: order.created_at,
    total: money(order.total),
    paymentStatus: order.payment_status,
    fulfillmentStatus: order.fulfillment_status,
    itemsCount: Array.isArray(order.order_items) ? order.order_items.length : 0,
    paymentProvider: relationFirst(order.payments)?.provider ?? null,
    paymentReference: relationFirst(order.payments)?.provider_reference ?? null,
  }));

  return {
    totalRevenue,
    totalOrders: revenueResult.data?.length ?? 0,
    activeBookings: bookingsCount ?? 0,
    newCustomers: customersCount ?? 0,
    recentOrders,
    pendingPayments: pendingPayments ?? 0,
    lowStockProducts: (variants ?? []).map((variant) => ({
      variantId: variant.id,
      label: `${relationFirst(variant.products)?.name ?? 'Product'} - ${variant.title}`,
      stockQuantity: variant.stock_quantity,
    })),
  };
}

export async function getAdminOrders(): Promise<AdminOrderRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, email, total, payment_status, fulfillment_status, created_at, customers(full_name), order_items(id), payments(provider_reference, provider)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    customerName: relationFirst(order.customers)?.full_name ?? 'Guest customer',
    email: order.email,
    createdAt: order.created_at,
    total: money(order.total),
    paymentStatus: order.payment_status,
    fulfillmentStatus: order.fulfillment_status,
    itemsCount: order.order_items?.length ?? 0,
    paymentProvider: relationFirst(order.payments)?.provider ?? null,
    paymentReference: relationFirst(order.payments)?.provider_reference ?? null,
  }));
}

export async function getAdminPayments(): Promise<PaymentRecord[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPayment);
}

export async function getAdminBookings(): Promise<AdminBookingRow[]> {
  const supabase = createSupabaseAdminClient();
  const [{ data: bookings, error: bookingsError }, { data: reservations, error: reservationsError }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, booking_reference, full_name, starts_at, status, notes, payment_status, stylists(name), booking_services(name), payments(provider, provider_reference)')
      .order('starts_at', { ascending: false }),
    supabase
      .from('booking_reservations')
      .select('id, full_name, created_at, notes, reservation_status, expires_at, booking_availability(starts_at), stylists(name), booking_services(name), payments(provider, provider_reference, status)')
      .in('reservation_status', ['pending_payment', 'expired', 'cancelled'])
      .order('created_at', { ascending: false }),
  ]);

  if (bookingsError) throw bookingsError;
  if (reservationsError) throw reservationsError;

  const mappedBookings: AdminBookingRow[] = (bookings ?? []).map((booking) => ({
    id: booking.id,
    bookingReference: booking.booking_reference,
    reservationId: null,
    clientName: booking.full_name,
    stylistName: relationFirst(booking.stylists)?.name ?? 'Lead Artist',
    serviceName: relationFirst(booking.booking_services)?.name ?? 'Service',
    startsAt: booking.starts_at,
    status: booking.status,
    paymentStatus: booking.payment_status,
    paymentProvider: relationFirst(booking.payments)?.provider ?? null,
    paymentReference: relationFirst(booking.payments)?.provider_reference ?? null,
    notes: booking.notes,
    entryType: 'booking',
  }));

  const mappedReservations: AdminBookingRow[] = (reservations ?? []).map((reservation) => ({
    id: reservation.id,
    bookingReference: null,
    reservationId: reservation.id,
    clientName: reservation.full_name,
    stylistName: relationFirst(reservation.stylists)?.name ?? 'Lead Artist',
    serviceName: relationFirst(reservation.booking_services)?.name ?? 'Service',
    startsAt: relationFirst(reservation.booking_availability)?.starts_at ?? reservation.expires_at,
    status: reservation.reservation_status,
    paymentStatus: relationFirst(reservation.payments)?.status ?? 'pending',
    paymentProvider: relationFirst(reservation.payments)?.provider ?? null,
    paymentReference: relationFirst(reservation.payments)?.provider_reference ?? null,
    notes: reservation.notes,
    entryType: 'reservation',
  }));

  return [...mappedBookings, ...mappedReservations].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
}

export async function getAdminCustomers(): Promise<AdminCustomerRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, email, phone, created_at, orders(total, created_at, payment_status), bookings(id, created_at, status)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((customer) => {
    const paidOrders = (customer.orders ?? []).filter((order) => order.payment_status === 'paid');
    const bookings = customer.bookings ?? [];
    const lastOrder = paidOrders.map((order) => order.created_at).sort().at(-1);
    const lastBooking = bookings.map((booking) => booking.created_at).sort().at(-1);

    return {
      id: customer.id,
      name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      ordersCount: paidOrders.length,
      bookingsCount: bookings.length,
      totalSpent: paidOrders.reduce((sum, order) => sum + money(order.total), 0),
      lastActiveAt: [lastOrder, lastBooking].filter(Boolean).sort().at(-1) ?? null,
    };
  });
}

export async function getAdminProducts(): Promise<ProductDetail[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      `
        id,
        slug,
        name,
        description,
        category_id,
        featured,
        rating,
        review_count,
        default_image_url,
        active,
        lifecycle_status,
        details,
        care_instructions,
        shipping_notes,
        product_categories(name),
        product_variants(id, product_id, sku, title, shade, length, size, price, compare_at_price, stock_quantity, active),
        product_images(id, url, alt, sort_order, media_asset_id)
      `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((product) => {
    const variants = product.product_variants ?? [];
    const firstVariant = variants[0];
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      categoryId: product.category_id,
      categoryName: relationFirst(product.product_categories)?.name ?? null,
      featured: product.featured,
      active: product.active,
      rating: money(product.rating),
      reviewCount: product.review_count,
      defaultImage: product.default_image_url,
      price: money(firstVariant?.price),
      compareAtPrice: firstVariant?.compare_at_price ? money(firstVariant.compare_at_price) : null,
      available: variants.some((variant) => variant.stock_quantity > 0),
      images: (product.product_images ?? []).map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        sortOrder: image.sort_order,
      })),
      variants: variants.map((variant) => ({
        id: variant.id,
        productId: variant.product_id,
        sku: variant.sku,
        title: variant.title,
        shade: variant.shade,
        length: variant.length,
        size: variant.size,
        price: money(variant.price),
        compareAtPrice: variant.compare_at_price ? money(variant.compare_at_price) : null,
        stockQuantity: variant.stock_quantity,
        active: variant.active,
      })),
      details: product.details ?? [],
      careInstructions: product.care_instructions ?? [],
      shippingNotes: product.shipping_notes ?? [],
    };
  });
}

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('product_categories').select('id, name, slug, description').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createAdminProduct(input: {
  name: string;
  slug: string;
  description?: string | null;
  categoryId?: string | null;
  featured?: boolean;
  active?: boolean;
  defaultImageUrl?: string | null;
  mediaAssetId?: string | null;
  variantTitle: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  shade?: string | null;
  length?: string | null;
  size?: string | null;
  actorUserId?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description?.trim() || null,
      category_id: input.categoryId || null,
      featured: input.featured ?? false,
      active: input.active ?? true,
      default_image_url: input.defaultImageUrl?.trim() || null,
      lifecycle_status: 'active',
    })
    .select('id')
    .single();

  if (productError) throw productError;

  const { error: variantError } = await supabase.from('product_variants').insert({
    product_id: product.id,
    sku: input.sku,
    title: input.variantTitle,
    shade: input.shade?.trim() || null,
    length: input.length?.trim() || null,
    size: input.size?.trim() || null,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    stock_quantity: input.stockQuantity,
    active: input.active ?? true,
  });

  if (variantError) throw variantError;

  if (input.defaultImageUrl?.trim()) {
    const { error: imageError } = await supabase.from('product_images').insert({
      product_id: product.id,
      url: input.defaultImageUrl.trim(),
      alt: input.name,
      sort_order: 0,
      media_asset_id: input.mediaAssetId ?? null,
    });

    if (imageError) throw imageError;
  }

  if (input.mediaAssetId) {
    await assignMediaAsset(input.mediaAssetId, 'product', product.id, input.name);
  }

  await createAuditLog({
    action: 'product.created',
    entityType: 'product',
    entityId: product.id,
    actorUserId: input.actorUserId,
    payload: { slug: input.slug },
  });

  const products = await getAdminProducts();
  return products.find((item) => item.id === product.id) ?? null;
}

export async function updateAdminProduct(productId: string, input: {
  name: string;
  slug: string;
  description?: string | null;
  categoryId?: string | null;
  featured?: boolean;
  active?: boolean;
  lifecycleStatus?: 'active' | 'archived';
  defaultImageUrl?: string | null;
  mediaAssetId?: string | null;
  actorUserId?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('products')
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description?.trim() || null,
      category_id: input.categoryId || null,
      featured: input.featured ?? false,
      active: input.active ?? true,
      lifecycle_status: input.lifecycleStatus ?? 'active',
      default_image_url: input.defaultImageUrl?.trim() || null,
    })
    .eq('id', productId);

  if (error) throw error;

  if (input.mediaAssetId && input.defaultImageUrl) {
    const { data: imageRow } = await supabase
      .from('product_images')
      .select('id, media_asset_id')
      .eq('product_id', productId)
      .order('sort_order')
      .limit(1)
      .maybeSingle();

    if (imageRow?.media_asset_id && imageRow.media_asset_id !== input.mediaAssetId) {
      await updateMediaLifecycle(imageRow.media_asset_id, 'archived');
    }

    if (imageRow) {
      await supabase
        .from('product_images')
        .update({ url: input.defaultImageUrl, alt: input.name, media_asset_id: input.mediaAssetId })
        .eq('id', imageRow.id);
    } else {
      await supabase.from('product_images').insert({
        product_id: productId,
        url: input.defaultImageUrl,
        alt: input.name,
        sort_order: 0,
        media_asset_id: input.mediaAssetId,
      });
    }

    await assignMediaAsset(input.mediaAssetId, 'product', productId, input.name);
  }

  await createAuditLog({
    action: 'product.updated',
    entityType: 'product',
    entityId: productId,
    actorUserId: input.actorUserId,
  });

  const products = await getAdminProducts();
  return products.find((item) => item.id === productId) ?? null;
}

export async function archiveAdminProduct(productId: string, actorUserId?: string | null) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('products')
    .update({
      active: false,
      lifecycle_status: 'archived',
    })
    .eq('id', productId);
  if (error) throw error;
  await createAuditLog({
    action: 'product.archived',
    entityType: 'product',
    entityId: productId,
    actorUserId,
  });
  return { ok: true };
}

export async function deleteAdminProduct(productId: string, actorUserId?: string | null) {
  const supabase = createSupabaseAdminClient();
  const [{ count: orderCount }, { count: bookingCount }, { data: images }] = await Promise.all([
    supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('product_id', productId),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('service_id', productId),
    supabase.from('product_images').select('media_asset_id').eq('product_id', productId),
  ]);

  if ((orderCount ?? 0) > 0 || (bookingCount ?? 0) > 0) {
    const { error } = await supabase.from('products').update({ active: false, lifecycle_status: 'archived' }).eq('id', productId);
    if (error) throw error;
    await createAuditLog({
      action: 'product.archived',
      entityType: 'product',
      entityId: productId,
      actorUserId,
      payload: { reason: 'historical_records_present' },
    });
    return { mode: 'archived' as const };
  }

  for (const image of images ?? []) {
    if (image.media_asset_id) {
      await deleteMediaObject(image.media_asset_id);
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;

  await createAuditLog({
    action: 'product.deleted',
    entityType: 'product',
    entityId: productId,
    actorUserId,
  });

  return { mode: 'deleted' as const };
}

export async function getStoreSettings() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('store_settings')
    .select('id, store_name, support_email, support_phone, booking_contact_email, announcement_bar')
    .order('created_at')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateStoreSettings(input: {
  storeName: string;
  supportEmail: string;
  supportPhone?: string;
  bookingContactEmail?: string;
  announcementBar?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const current = await getStoreSettings();
  const supportPhone = input.supportPhone?.trim() ? input.supportPhone.trim() : null;
  const bookingContactEmail = input.bookingContactEmail?.trim() ? input.bookingContactEmail.trim() : null;
  const announcementBar = input.announcementBar?.trim() ? input.announcementBar.trim() : null;

  if (!current) {
    const { data, error } = await supabase
      .from('store_settings')
      .insert({
        store_name: input.storeName,
        support_email: input.supportEmail,
        support_phone: supportPhone,
        booking_contact_email: bookingContactEmail,
        announcement_bar: announcementBar,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('store_settings')
    .update({
      store_name: input.storeName,
      support_email: input.supportEmail,
      support_phone: supportPhone,
      booking_contact_email: bookingContactEmail,
      announcement_bar: announcementBar,
    })
    .eq('id', current.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, input: { paymentStatus?: string; fulfillmentStatus?: string }) {
  const supabase = createSupabaseAdminClient();
  const { data: existingOrder, error: existingOrderError } = await supabase
    .from('orders')
    .select('id, order_number, email, fulfillment_status, customers(full_name)')
    .eq('id', orderId)
    .maybeSingle();

  if (existingOrderError) throw existingOrderError;

  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status: input.paymentStatus,
      fulfillment_status: input.fulfillmentStatus,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;

  const didFulfillmentChange =
    existingOrder &&
    input.fulfillmentStatus &&
    existingOrder.fulfillment_status !== input.fulfillmentStatus &&
    data.fulfillment_status === input.fulfillmentStatus;

  if (didFulfillmentChange) {
    try {
      const settings = await getStoreSettings();
      await sendOrderStatusUpdateEmail({
        storeName: settings?.store_name?.trim() || 'theDMAshop',
        supportEmail: settings?.support_email?.trim() || 'support@thedmashop.com',
        customerName: relationFirst(existingOrder.customers)?.full_name ?? 'there',
        customerEmail: data.email,
        orderNumber: data.order_number,
        fulfillmentStatus: data.fulfillment_status,
      });
    } catch (notificationError) {
      console.error('Order status email failed', notificationError);
    }
  }

  return data;
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status,
      payment_status: status === 'refunded' ? 'refunded' : status === 'cancelled' ? 'cancelled' : undefined,
    })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw error;

  if (status === 'cancelled') {
    await supabase.from('booking_availability').update({ is_available: true }).eq('id', data.availability_id);
  }

  return data;
}

export async function getAvailabilityAdminRows() {
  const supabase = createSupabaseAdminClient();
  const [{ data: availability, error: availabilityError }, { data: activeReservations, error: reservationError }] = await Promise.all([
    supabase
      .from('booking_availability')
      .select('id, starts_at, ends_at, is_available, service_id, stylist_id, stylists(name), booking_services(name), bookings(id)')
      .order('starts_at', { ascending: false }),
    supabase
      .from('booking_reservations')
      .select('availability_id')
      .eq('reservation_status', 'pending_payment')
      .gt('expires_at', new Date().toISOString()),
  ]);

  if (availabilityError) throw availabilityError;
  if (reservationError) throw reservationError;

  const reservedIds = new Set((activeReservations ?? []).map((reservation) => reservation.availability_id));

  return (availability ?? []).map((slot) => ({
    id: slot.id,
    starts_at: slot.starts_at,
    ends_at: slot.ends_at,
    is_available: slot.is_available,
    has_booking: Array.isArray(slot.bookings) ? slot.bookings.length > 0 : false,
    is_reserved: reservedIds.has(slot.id),
    booking_services: relationFirst(slot.booking_services) ?? null,
    stylists: relationFirst(slot.stylists) ?? null,
  }));
}

export async function createAvailabilitySlot(input: { stylistId: string; serviceId: string; startsAt: string; durationMinutes: number }) {
  const supabase = createSupabaseAdminClient();
  const startsAtDate = new Date(input.startsAt);
  const endsAtDate = new Date(startsAtDate.getTime() + input.durationMinutes * 60_000);

  const { data: overlapping } = await supabase
    .from('booking_availability')
    .select('id')
    .eq('stylist_id', input.stylistId)
    .lt('starts_at', endsAtDate.toISOString())
    .gt('ends_at', startsAtDate.toISOString())
    .limit(1)
    .maybeSingle();

  if (overlapping) {
    throw new Error('That time overlaps an existing availability slot.');
  }

  const { data, error } = await supabase
    .from('booking_availability')
    .insert({
      stylist_id: input.stylistId,
      service_id: input.serviceId,
      starts_at: startsAtDate.toISOString(),
      ends_at: endsAtDate.toISOString(),
      is_available: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAvailabilitySlot(id: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: booking }, { data: reservation }] = await Promise.all([
    supabase.from('bookings').select('id').eq('availability_id', id).maybeSingle(),
    supabase
      .from('booking_reservations')
      .select('id')
      .eq('availability_id', id)
      .eq('reservation_status', 'pending_payment')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle(),
  ]);

  if (booking || reservation) {
    throw new Error('This slot is already reserved or booked and cannot be removed.');
  }

  const { error } = await supabase.from('booking_availability').delete().eq('id', id);
  if (error) throw error;
}
