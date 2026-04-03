import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createHostedCheckoutSession } from '@/lib/payments';
import { sendBookingConfirmationEmails } from '@/lib/notifications';
import { createAuditLog } from '@/lib/data/audit';
import type {
  AvailableSlot,
  BookingConfirmation,
  BookingReservation,
  BookingService,
  CartLineInput,
  Category,
  CreateBookingCheckoutResult,
  CreateBookingInput,
  MakeupBookingIntake,
  ProductDetail,
  ProductListItem,
  StylistSummary,
  ValidatedCartLine,
} from '@/lib/types';

function normalizeMoney(value: number | string | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

function relationFirst<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function nowIso() {
  return new Date().toISOString();
}

function expiresIn(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function normalizeIntakePayload(value: unknown): MakeupBookingIntake | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return Object.keys(value as Record<string, unknown>).length > 0 ? (value as MakeupBookingIntake) : null;
}

function mapReservation(row: any): BookingReservation {
  return {
    id: row.id,
    availabilityId: row.availability_id,
    stylistId: row.stylist_id,
    serviceId: row.service_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    makeupIntake: normalizeIntakePayload(row.intake_payload),
    reservationStatus: row.reservation_status,
    expiresAt: row.expires_at,
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('product_categories').select('id, name, slug, description').order('name');

  if (error) throw error;
  return data;
}

export async function getProducts(category?: string): Promise<ProductListItem[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
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
        product_categories(name),
        product_variants(price, compare_at_price, stock_quantity, active)
      `
    )
    .eq('active', true)
    .eq('lifecycle_status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    const { data: categoryRecord } = await supabase.from('product_categories').select('id').eq('slug', category).maybeSingle();
    if (categoryRecord) query = query.eq('category_id', categoryRecord.id);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((product) => {
    const activeVariants = (product.product_variants ?? []).filter((variant) => variant.active);
    const cheapestVariant = activeVariants.sort((a, b) => normalizeMoney(a.price) - normalizeMoney(b.price))[0];
    const totalStock = activeVariants.reduce((sum, variant) => sum + variant.stock_quantity, 0);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      categoryId: product.category_id,
      categoryName: relationFirst(product.product_categories)?.name ?? null,
      featured: product.featured,
      active: product.active,
      rating: normalizeMoney(product.rating),
      reviewCount: product.review_count,
      defaultImage: product.default_image_url,
      price: normalizeMoney(cheapestVariant?.price),
      compareAtPrice: cheapestVariant?.compare_at_price ? normalizeMoney(cheapestVariant.compare_at_price) : null,
      available: totalStock > 0,
    };
  });
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
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
        details,
        care_instructions,
        shipping_notes,
        lifecycle_status,
        product_categories(name),
        product_variants(id, product_id, sku, title, shade, length, size, price, compare_at_price, stock_quantity, active),
        product_images(id, url, alt, sort_order, media_asset_id)
      `
    )
    .eq('slug', slug)
    .eq('active', true)
    .eq('lifecycle_status', 'active')
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const activeVariants = (data.product_variants ?? []).filter((variant) => variant.active);
  const cheapestVariant = activeVariants.sort((a, b) => normalizeMoney(a.price) - normalizeMoney(b.price))[0];

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    categoryId: data.category_id,
    categoryName: relationFirst(data.product_categories)?.name ?? null,
    featured: data.featured,
    active: data.active,
    rating: normalizeMoney(data.rating),
    reviewCount: data.review_count,
    defaultImage: data.default_image_url,
    price: normalizeMoney(cheapestVariant?.price),
    compareAtPrice: cheapestVariant?.compare_at_price ? normalizeMoney(cheapestVariant.compare_at_price) : null,
    available: activeVariants.some((variant) => variant.stock_quantity > 0),
    images: (data.product_images ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        sortOrder: image.sort_order,
      })),
    variants: activeVariants.map((variant) => ({
      id: variant.id,
      productId: variant.product_id,
      sku: variant.sku,
      title: variant.title,
      shade: variant.shade,
      length: variant.length,
      size: variant.size,
      price: normalizeMoney(variant.price),
      compareAtPrice: variant.compare_at_price ? normalizeMoney(variant.compare_at_price) : null,
      stockQuantity: variant.stock_quantity,
      active: variant.active,
    })),
    details: data.details ?? [],
    careInstructions: data.care_instructions ?? [],
    shippingNotes: data.shipping_notes ?? [],
  };
}

export async function getBookingServices(): Promise<BookingService[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('booking_services')
    .select('id, slug, name, description, duration_minutes, price')
    .eq('active', true)
    .order('price');

  if (error) throw error;

  return (data ?? []).slice(0, 2).map((service) => ({
    id: service.id,
    slug: service.slug,
    name: service.name,
    description: service.description,
    durationMinutes: service.duration_minutes,
    price: normalizeMoney(service.price),
  }));
}

export async function getStylists(): Promise<StylistSummary[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('stylists')
    .select('id, slug, name, bio, specialties, rating, avatar_url, available, base_price')
    .eq('available', true)
    .order('name');

  if (error) throw error;

  return (data ?? []).map((stylist) => ({
    id: stylist.id,
    slug: stylist.slug,
    name: stylist.name,
    bio: stylist.bio,
    specialties: stylist.specialties ?? [],
    rating: normalizeMoney(stylist.rating),
    avatarUrl: stylist.avatar_url,
    available: stylist.available,
    basePrice: stylist.base_price ? normalizeMoney(stylist.base_price) : null,
  }));
}

export async function getAvailability(stylistId?: string, serviceId?: string): Promise<AvailableSlot[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from('booking_availability')
    .select('id, stylist_id, service_id, starts_at, ends_at, is_available')
    .eq('is_available', true)
    .gte('starts_at', nowIso())
    .order('starts_at')
    .limit(40);

  if (stylistId) query = query.eq('stylist_id', stylistId);
  if (serviceId) query = query.eq('service_id', serviceId);

  const [{ data, error }, { data: reservations, error: reservationError }] = await Promise.all([
    query,
    supabase
      .from('booking_reservations')
      .select('availability_id, expires_at, reservation_status')
      .eq('reservation_status', 'pending_payment')
      .gt('expires_at', nowIso()),
  ]);

  if (error) throw error;
  if (reservationError) throw reservationError;

  const blockedIds = new Set((reservations ?? []).map((item) => item.availability_id));

  return (data ?? [])
    .filter((slot) => !blockedIds.has(slot.id))
    .map((slot) => ({
      id: slot.id,
      stylistId: slot.stylist_id,
      serviceId: slot.service_id,
      startsAt: slot.starts_at,
      endsAt: slot.ends_at,
      isAvailable: slot.is_available,
    }));
}

export async function validateCartLines(lines: CartLineInput[]): Promise<ValidatedCartLine[]> {
  const supabase = createSupabaseAdminClient();
  const variantIds = lines.map((line) => line.variantId);

  const { data, error } = await supabase
    .from('product_variants')
    .select(
      `
        id,
        product_id,
        title,
        price,
        stock_quantity,
        active,
        products!inner(id, slug, name, default_image_url, active, lifecycle_status)
      `
    )
    .in('id', variantIds);

  if (error) throw error;

  const variantMap = new Map(data.map((variant) => [variant.id, variant]));

  return lines.map((line) => {
    const variant = variantMap.get(line.variantId);
    const product = relationFirst(variant?.products);

    if (!variant || !variant.active || !product?.active || product.lifecycle_status !== 'active') {
      throw new Error('One or more selected items are no longer available.');
    }

    if (variant.stock_quantity < line.quantity) {
      throw new Error(`Insufficient inventory for ${product.name}.`);
    }

    return {
      variantId: variant.id,
      productId: variant.product_id,
      productSlug: product.slug,
      productName: product.name,
      variantTitle: variant.title,
      unitAmount: normalizeMoney(variant.price),
      quantity: line.quantity,
      imageUrl: product.default_image_url,
    };
  });
}

async function getAvailableSlot(input: Pick<CreateBookingInput, 'availabilityId' | 'serviceId' | 'stylistId'>) {
  const supabase = createSupabaseAdminClient();
  const { data: slot, error: slotError } = await supabase
    .from('booking_availability')
    .select('id, starts_at, ends_at, is_available, stylist_id, service_id')
    .eq('id', input.availabilityId)
    .eq('is_available', true)
    .maybeSingle();

  if (slotError) throw slotError;
  if (!slot || slot.stylist_id !== input.stylistId || slot.service_id !== input.serviceId) {
    throw new Error('That appointment time is no longer available.');
  }

  const { data: activeReservation } = await supabase
    .from('booking_reservations')
    .select('id')
    .eq('availability_id', input.availabilityId)
    .eq('reservation_status', 'pending_payment')
    .gt('expires_at', nowIso())
    .maybeSingle();

  if (activeReservation) {
    throw new Error('That appointment time is being held for another guest.');
  }

  return slot;
}

export async function createBookingCheckout(input: CreateBookingInput): Promise<CreateBookingCheckoutResult> {
  const supabase = createSupabaseAdminClient();
  const [slot, services] = await Promise.all([getAvailableSlot(input), getBookingServices()]);
  const service = services.find((item) => item.id === input.serviceId);
  if (!service) throw new Error('Selected service is unavailable.');
  const isMakeupService = service.slug.includes('makeup');

  if (isMakeupService && !input.makeupIntake) {
    throw new Error('Complete the makeup booking form before continuing.');
  }

  const normalizedIntake = isMakeupService && input.makeupIntake ? input.makeupIntake : null;

  const { data: reservation, error: reservationError } = await supabase
    .from('booking_reservations')
    .insert({
      availability_id: input.availabilityId,
      stylist_id: input.stylistId,
      service_id: input.serviceId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      notes: input.notes ?? null,
      intake_payload: normalizedIntake,
      reservation_status: 'pending_payment',
      expires_at: expiresIn(15),
    })
    .select('*')
    .single();

  if (reservationError) throw reservationError;

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      reservation_id: reservation.id,
      provider: 'hosted_checkout',
      status: 'pending',
      amount: service.price,
      currency: 'usd',
      method_family: 'hosted_checkout',
      expires_at: reservation.expires_at,
      metadata: {
        kind: 'booking',
        serviceName: service.name,
        makeupIntake: normalizedIntake,
      },
    })
    .select('id')
    .single();

  if (paymentError) throw paymentError;

  try {
    const session = await createHostedCheckoutSession({
      email: input.email,
      successPath: `/book?success=1&reservation=${reservation.id}`,
      cancelPath: `/book?canceled=1&reservation=${reservation.id}`,
      metadata: {
        kind: 'booking',
        reservationId: reservation.id,
        paymentId: payment.id,
        availabilityId: input.availabilityId,
      },
      lines: [
        {
          name: service.name,
          description: `Scheduled for ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(slot.starts_at))}`,
          amount: service.price,
          quantity: 1,
        },
      ],
    });

    await supabase
      .from('payments')
      .update({
        session_reference: session.id,
        provider_reference: session.id,
        idempotency_key: session.id,
      })
      .eq('id', payment.id);

    await createAuditLog({
      action: 'booking.reservation_created',
      entityType: 'booking_reservation',
      entityId: reservation.id,
      payload: { paymentId: payment.id, availabilityId: input.availabilityId },
    });

    return {
      checkoutUrl: session.url!,
      reservationId: reservation.id,
      paymentId: payment.id,
    };
  } catch (error) {
    await supabase.from('payments').update({ status: 'failed', failure_reason: error instanceof Error ? error.message : 'Unable to start secure checkout.' }).eq('id', payment.id);
    await supabase.from('booking_reservations').update({ reservation_status: 'cancelled' }).eq('id', reservation.id);
    throw error;
  }
}

export async function finalizePaidBooking(paymentId: string, providerReference?: string | null): Promise<BookingConfirmation | null> {
  const supabase = createSupabaseAdminClient();
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, booking_id, reservation_id, status, paid_at')
    .eq('id', paymentId)
    .maybeSingle();

  if (paymentError) throw paymentError;
  if (!payment?.reservation_id) return null;

  if (payment.booking_id) {
    const existing = await getBookingConfirmation(payment.booking_id);
    return existing;
  }

  const { data: reservation, error: reservationError } = await supabase
    .from('booking_reservations')
    .select('*, booking_availability(starts_at, ends_at), booking_services(name), stylists(name)')
    .eq('id', payment.reservation_id)
    .maybeSingle();

  if (reservationError) throw reservationError;
  if (!reservation) return null;
  const reservationAvailability = relationFirst(reservation.booking_availability);

  const { data: customer } = await supabase
    .from('customers')
    .upsert(
      {
        email: reservation.email,
        full_name: reservation.full_name,
        phone: reservation.phone,
      },
      { onConflict: 'email' }
    )
    .select('id')
    .single();

  const bookingReference = `BKG-${Math.floor(Date.now() / 1000)}`;

  const reservationIntake = normalizeIntakePayload(reservation.intake_payload);

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      booking_reference: bookingReference,
      customer_id: customer?.id ?? null,
      stylist_id: reservation.stylist_id,
      service_id: reservation.service_id,
      availability_id: reservation.availability_id,
      full_name: reservation.full_name,
      email: reservation.email,
      phone: reservation.phone,
      notes: reservation.notes ?? null,
      intake_payload: reservationIntake ?? {},
      starts_at: reservationAvailability?.starts_at,
      ends_at: reservationAvailability?.ends_at,
      status: 'confirmed',
      payment_status: 'paid',
    })
    .select('id')
    .single();

  if (bookingError) {
    if ((bookingError as { code?: string }).code !== '23505') throw bookingError;
    const { data: existing } = await supabase.from('bookings').select('id').eq('availability_id', reservation.availability_id).maybeSingle();
    if (!existing) throw bookingError;
    const existingConfirmation = await getBookingConfirmation(existing.id);
    return existingConfirmation;
  }

  await supabase
    .from('booking_availability')
    .update({ is_available: false })
    .eq('id', reservation.availability_id);

  await supabase.from('booking_reservations').update({ reservation_status: 'confirmed' }).eq('id', reservation.id);

  await supabase
    .from('payments')
    .update({
      booking_id: booking.id,
      status: 'paid',
      paid_at: payment.paid_at ?? nowIso(),
      provider_reference: providerReference ?? payment.id,
      reconciliation_state: 'captured',
    })
    .eq('id', payment.id);

  await createAuditLog({
    action: 'booking.confirmed',
    entityType: 'booking',
    entityId: booking.id,
    payload: { paymentId: payment.id, reservationId: reservation.id },
  });

  try {
    const store = await getPublicStoreSettings();
    await sendBookingConfirmationEmails({
      storeName: store.storeName,
      supportEmail: store.supportEmail,
      bookingContactEmail: store.bookingContactEmail,
      fullName: reservation.full_name,
      email: reservation.email,
      bookingReference,
      serviceName: relationFirst(reservation.booking_services)?.name ?? 'Selected service',
      stylistName: relationFirst(reservation.stylists)?.name ?? 'Lead Artist',
      startsAt: reservationAvailability?.starts_at ?? nowIso(),
      phone: reservation.phone,
      notes: reservation.notes ?? null,
      makeupIntake: reservationIntake,
    });
  } catch (notificationError) {
    console.error('Booking confirmation email failed', notificationError);
  }

  return getBookingConfirmation(booking.id);
}

export async function getBookingConfirmation(bookingId: string): Promise<BookingConfirmation | null> {
  const supabase = createSupabaseAdminClient();
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      `
        id,
        booking_reference,
        starts_at,
        status,
        payment_status,
        stylists(name),
        booking_services(name)
      `
    )
    .eq('id', bookingId)
    .maybeSingle();

  if (error) throw error;
  if (!booking) return null;

  return {
    id: booking.id,
    bookingReference: booking.booking_reference,
    stylistName: relationFirst(booking.stylists)?.name ?? 'Lead Artist',
    serviceName: relationFirst(booking.booking_services)?.name ?? 'Selected service',
    startsAt: booking.starts_at,
    status: booking.status,
    paymentStatus: booking.payment_status,
  };
}

export async function getReservationById(reservationId: string): Promise<BookingReservation | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('booking_reservations').select('*').eq('id', reservationId).maybeSingle();
  if (error) throw error;
  return data ? mapReservation(data) : null;
}

export async function markReservationCancelled(reservationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: reservation, error } = await supabase
    .from('booking_reservations')
    .select('id, reservation_status')
    .eq('id', reservationId)
    .maybeSingle();

  if (error) throw error;
  if (!reservation || reservation.reservation_status === 'confirmed') return;

  await supabase.from('booking_reservations').update({ reservation_status: 'cancelled' }).eq('id', reservationId);
  await supabase
    .from('payments')
    .update({ status: 'cancelled', cancelled_at: nowIso() })
    .eq('reservation_id', reservationId)
    .in('status', ['created', 'pending', 'authorized']);
}

export async function expireStaleBookingReservations() {
  const supabase = createSupabaseAdminClient();
  const { data: staleReservations, error } = await supabase
    .from('booking_reservations')
    .select('id')
    .eq('reservation_status', 'pending_payment')
    .lt('expires_at', nowIso());

  if (error) throw error;

  for (const reservation of staleReservations ?? []) {
    await supabase.from('booking_reservations').update({ reservation_status: 'expired' }).eq('id', reservation.id);
    await supabase.from('payments').update({ status: 'expired' }).eq('reservation_id', reservation.id).in('status', ['created', 'pending', 'authorized']);
  }
}

export async function getPublicStoreSettings() {
  const fallback = {
    storeName: 'itzlolabeauty',
    supportEmail: 'hello@itzlolabeauty.com',
    supportPhone: '+1 (555) 123-4567',
    bookingContactEmail: 'ogunjobiniyiola906@gmail.com',
    announcementBar: null,
  };

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('store_settings')
      .select('store_name, support_email, support_phone, booking_contact_email, announcement_bar')
      .order('created_at')
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return {
      storeName: data?.store_name?.trim() || fallback.storeName,
      supportEmail: data?.support_email?.trim() || fallback.supportEmail,
      supportPhone: data?.support_phone?.trim() || fallback.supportPhone,
      bookingContactEmail: data?.booking_contact_email?.trim() || fallback.bookingContactEmail,
      announcementBar: data?.announcement_bar?.trim() || fallback.announcementBar,
    };
  } catch {
    return fallback;
  }
}
