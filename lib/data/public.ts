import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createHostedCheckoutSession } from '@/lib/payments';
import { sendBookingConfirmationEmails } from '@/lib/notifications';
import { createAuditLog } from '@/lib/data/audit';
import { syncRecurringAvailabilityRules } from '@/lib/data/availability';
import { logEvent } from '@/lib/observability';
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
import { SERVICES } from './services';

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

function isMissingColumnError(error: unknown, columnName: string) {
  const message =
    error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string'
      ? (error as { message: string }).message
      : '';

  return message.includes(`Could not find the '${columnName}' column`) || message.includes(`column "${columnName}" does not exist`);
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
    .select('id, slug, name, description, duration_minutes, price, service_type')
    .eq('active', true)
    .order('price');

  if (error) throw error;

  return (data ?? []).map((service) => {
    const seoData = SERVICES.find((s: any) => s.slug === service.slug);
    
    return {
      id: service.id,
      slug: service.slug,
      name: service.name,
      description: service.description,
      durationMinutes: service.duration_minutes,
      price: normalizeMoney(service.price),
      serviceType: service.service_type,
      // Pass through SEO specific fields if they exist
      included: seoData?.included ?? [],
      prepNotes: seoData?.prepNotes ?? [],
      bestFor: seoData?.bestFor ?? ''
    } as BookingService;
  });
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
  await syncRecurringAvailabilityRules();
  const supabase = createSupabaseAdminClient();
  
  // 1. Fetch candidate slots
  let query = supabase
    .from('booking_availability')
    .select('id, stylist_id, service_id, starts_at, ends_at, is_available')
    .eq('is_available', true)
    .gte('starts_at', nowIso())
    .order('starts_at')
    .limit(80); // Increased limit to ensure we find enough buffered slots

  if (stylistId) query = query.eq('stylist_id', stylistId);
  if (serviceId) query = query.eq('service_id', serviceId);

  // 2. Fetch all confirmed bookings and pending reservations to check for buffers
  const [
    { data: slots, error: slotsError },
    { data: confirmedBookings, error: bookingsError },
    { data: reservations, error: reservationError }
  ] = await Promise.all([
    query,
    supabase
      .from('bookings')
      .select('starts_at, ends_at, status')
      .in('status', ['confirmed', 'completed'])
      .gte('ends_at', nowIso()),
    supabase
      .from('booking_reservations')
      .select('availability_id, expires_at, reservation_status')
      .eq('reservation_status', 'pending_payment')
      .gt('expires_at', nowIso()),
  ]);

  if (slotsError) throw slotsError;
  if (bookingsError) throw bookingsError;
  if (reservationError) throw reservationError;

  const blockedIds = new Set((reservations ?? []).map((item) => item.availability_id));
  const BUFFER_MS = 60 * 60_000; // 60 minutes

  return (slots ?? [])
    .filter((slot) => {
      // Check for direct reservation block
      if (blockedIds.has(slot.id)) return false;

      const slotStart = new Date(slot.starts_at).getTime();
      const slotEnd = new Date(slot.ends_at).getTime();

      // Check for overlap with any confirmed booking + 60min buffer
      const isBlockedByBooking = (confirmedBookings ?? []).some((booking) => {
        const bStart = new Date(booking.starts_at).getTime();
        const bEnd = new Date(booking.ends_at).getTime();
        
        // Expanded booking window: [start - buffer, end + buffer]
        const expandedStart = bStart - BUFFER_MS;
        const expandedEnd = bEnd + BUFFER_MS;

        // Overlap check: slot starts before booking ends AND slot ends after booking starts
        return slotStart < expandedEnd && slotEnd > expandedStart;
      });

      return !isBlockedByBooking;
    })
    .slice(0, 40) // Return top 40 available slots after buffering
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
  
  // 1. Fetch the requested slot
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

  const slotStart = new Date(slot.starts_at).getTime();
  const slotEnd = new Date(slot.ends_at).getTime();
  const BUFFER_MS = 60 * 60_000;

  // 2. Double check for ANY overlapping confirmed bookings for this stylist (including buffers)
  const { data: confirmedBookings } = await supabase
    .from('bookings')
    .select('id, starts_at, ends_at')
    .eq('stylist_id', input.stylistId)
    .in('status', ['confirmed', 'completed'])
    .lt('starts_at', new Date(slotEnd + BUFFER_MS).toISOString())
    .gt('ends_at', new Date(slotStart - BUFFER_MS).toISOString());

  if (confirmedBookings && confirmedBookings.length > 0) {
    throw new Error('This time is no longer available due to a recent booking overlap.');
  }

  // 3. Check for active reservations
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
  const isMakeupService = service.serviceType === 'makeup';

  if (isMakeupService && !input.makeupIntake) {
    throw new Error('Complete the makeup booking form before continuing.');
  }

  const normalizedIntake = isMakeupService && input.makeupIntake ? input.makeupIntake : null;

  const reservationPayload = {
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
  };

  let reservationResult = await supabase
    .from('booking_reservations')
    .insert(reservationPayload)
    .select('*')
    .single();

  if (reservationResult.error && isMissingColumnError(reservationResult.error, 'intake_payload')) {
    const { intake_payload: _intakePayload, ...fallbackReservationPayload } = reservationPayload;
    reservationResult = await supabase
      .from('booking_reservations')
      .insert(fallbackReservationPayload)
      .select('*')
      .single();
  }

  const { data: reservation, error: reservationError } = reservationResult;

  if (reservationError) throw reservationError;

  logEvent('info', 'booking.reservation_created', {
    reservationId: reservation.id,
    availabilityId: input.availabilityId,
    stylistId: input.stylistId,
    serviceId: input.serviceId,
    email: input.email,
  });

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

  logEvent('info', 'booking.payment_created', {
    paymentId: payment.id,
    reservationId: reservation.id,
    amount: service.price,
  });

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

    logEvent('info', 'booking.session_created', {
      reservationId: reservation.id,
      paymentId: payment.id,
      sessionId: session.id,
      livemode: session.livemode,
    });

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
    logEvent('error', 'booking.session_create_failed', {
      reservationId: reservation.id,
      paymentId: payment.id,
      reason: error instanceof Error ? error.message : 'Unable to start secure checkout.',
    });
    await supabase.from('payments').update({ status: 'failed', failure_reason: error instanceof Error ? error.message : 'Unable to start secure checkout.' }).eq('id', payment.id);
    await supabase.from('booking_reservations').update({ reservation_status: 'cancelled' }).eq('id', reservation.id);
    throw error;
  }
}

export async function finalizePaidBooking(input: {
  paymentId?: string | null;
  providerReference?: string | null;
  sessionReference?: string | null;
  reservationId?: string | null;
}): Promise<BookingConfirmation | null> {
  const supabase = createSupabaseAdminClient();
  const payment = await findBookingPaymentRecord(supabase, input);

  if (!payment?.reservation_id) {
    logEvent('warn', 'booking.payment_not_found', {
      paymentId: input.paymentId ?? null,
      sessionReference: input.sessionReference ?? null,
      providerReference: input.providerReference ?? null,
      reservationId: input.reservationId ?? null,
    });
    return null;
  }

  const resolvedSessionReference = input.sessionReference ?? payment.session_reference ?? null;
  const resolvedProviderReference = input.providerReference ?? payment.provider_reference ?? payment.id;

  if (payment.booking_id) {
    await supabase
      .from('payments')
      .update({
        status: 'paid',
        paid_at: payment.paid_at ?? nowIso(),
        session_reference: resolvedSessionReference,
        provider_reference: resolvedProviderReference,
        reconciliation_state: 'captured',
      })
      .eq('id', payment.id);

    logEvent('info', 'booking.payment_already_captured', {
      bookingId: payment.booking_id,
      paymentId: payment.id,
      sessionReference: resolvedSessionReference,
      providerReference: resolvedProviderReference,
    });
    const existing = await getBookingConfirmation(payment.booking_id);
    return existing;
  }

  let reservationResult = await supabase
    .from('booking_reservations')
    .select('*, booking_availability(starts_at, ends_at), booking_services(name), stylists(name, email)')
    .eq('id', payment.reservation_id)
    .maybeSingle();

  if (reservationResult.error && isMissingColumnError(reservationResult.error, 'email')) {
    reservationResult = await supabase
      .from('booking_reservations')
      .select('*, booking_availability(starts_at, ends_at), booking_services(name), stylists(name)')
      .eq('id', payment.reservation_id)
      .maybeSingle();
  }

  const { data: reservation, error: reservationError } = reservationResult;

  if (reservationError) throw reservationError;
  if (!reservation) return null;
  let reservationAvailability = relationFirst(reservation.booking_availability);

  if (!reservationAvailability && reservation.availability_id) {
    const { data: availability, error: availabilityError } = await supabase
      .from('booking_availability')
      .select('starts_at, ends_at')
      .eq('id', reservation.availability_id)
      .maybeSingle();

    if (availabilityError) throw availabilityError;
    reservationAvailability = availability;
  }

  let customerId: string | null = null;

  try {
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

    customerId = customer?.id ?? null;
  } catch (customerError) {
    logEvent('warn', 'booking.customer_upsert_failed', {
      reservationId: reservation.id,
      paymentId: payment.id,
      reason: customerError instanceof Error ? customerError.message : 'customer_upsert_failed',
    });

    if (reservation.email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', reservation.email)
        .maybeSingle();

      customerId = existingCustomer?.id ?? null;
    }
  }

  const bookingReference = `BKG-${Math.floor(Date.now() / 1000)}`;

  const reservationIntake = normalizeIntakePayload(reservation.intake_payload);

  const bookingPayload = {
    booking_reference: bookingReference,
    customer_id: customerId,
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
  };

  let bookingResult = await supabase
    .from('bookings')
    .insert(bookingPayload)
    .select('id')
    .single();

  if (bookingResult.error && isMissingColumnError(bookingResult.error, 'intake_payload')) {
    const { intake_payload: _intakePayload, ...fallbackBookingPayload } = bookingPayload;
    bookingResult = await supabase
      .from('bookings')
      .insert(fallbackBookingPayload)
      .select('id')
      .single();
  }

  const { data: booking, error: bookingError } = bookingResult;

  if (bookingError) {
    if ((bookingError as { code?: string }).code !== '23505') throw bookingError;
    const { data: existing } = await supabase.from('bookings').select('id').eq('availability_id', reservation.availability_id).maybeSingle();
    if (!existing) throw bookingError;
    await supabase
      .from('booking_availability')
      .update({ is_available: false })
      .eq('id', reservation.availability_id);

    await supabase.from('booking_reservations').update({ reservation_status: 'confirmed' }).eq('id', reservation.id);

    await supabase
      .from('payments')
      .update({
        booking_id: existing.id,
        status: 'paid',
        paid_at: payment.paid_at ?? nowIso(),
        session_reference: resolvedSessionReference,
        provider_reference: resolvedProviderReference,
        reconciliation_state: 'captured',
      })
      .eq('id', payment.id);

    logEvent('warn', 'booking.payment_attached_existing_booking', {
      bookingId: existing.id,
      reservationId: reservation.id,
      paymentId: payment.id,
      sessionReference: resolvedSessionReference,
      providerReference: resolvedProviderReference,
    });

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
      session_reference: resolvedSessionReference,
      provider_reference: resolvedProviderReference,
      reconciliation_state: 'captured',
    })
    .eq('id', payment.id);

  await createAuditLog({
    action: 'booking.confirmed',
    entityType: 'booking',
    entityId: booking.id,
    payload: { paymentId: payment.id, reservationId: reservation.id },
  });

  logEvent('info', 'booking.payment_captured', {
    bookingId: booking.id,
    reservationId: reservation.id,
    paymentId: payment.id,
    sessionReference: resolvedSessionReference,
    providerReference: resolvedProviderReference,
  });

  try {
    const store = await getPublicStoreSettings();
    const stylist = relationFirst(reservation.stylists) as { name?: string | null; email?: string | null } | null;
    await sendBookingConfirmationEmails({
      storeName: store.storeName,
      supportEmail: store.supportEmail,
      bookingContactEmail: store.bookingContactEmail,
      stylistEmail: stylist?.email ?? null,
      fullName: reservation.full_name,
      email: reservation.email,
      bookingReference,
      serviceName: relationFirst(reservation.booking_services)?.name ?? 'Selected service',
      stylistName: stylist?.name ?? 'Lead Artist',
      startsAt: reservationAvailability?.starts_at ?? nowIso(),
      phone: reservation.phone,
      notes: reservation.notes ?? null,
      makeupIntake: reservationIntake,
    });
  } catch (notificationError) {
    logEvent('error', 'booking.confirmation_email_failed', {
      bookingId: booking.id,
      reservationId: reservation.id,
      paymentId: payment.id,
      reason: notificationError instanceof Error ? notificationError.message : 'Unable to send booking email.',
    });
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
    homeFavoritesEnabled: true,
    homeShopSectionTitle: 'Shop',
    homeShopSectionLinkLabel: 'Shop Collection',
    homeShopSectionLinkHref: '/shop',
    homeShopSectionItems: [],
  };

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('store_settings')
      .select('store_name, support_email, support_phone, booking_contact_email, announcement_bar, home_favorites_enabled, home_shop_section_title, home_shop_section_link_label, home_shop_section_link_href, home_shop_section_items')
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
      homeFavoritesEnabled: data?.home_favorites_enabled ?? fallback.homeFavoritesEnabled,
      homeShopSectionTitle: data?.home_shop_section_title?.trim() || fallback.homeShopSectionTitle,
      homeShopSectionLinkLabel: data?.home_shop_section_link_label?.trim() || fallback.homeShopSectionLinkLabel,
      homeShopSectionLinkHref: data?.home_shop_section_link_href?.trim() || fallback.homeShopSectionLinkHref,
      homeShopSectionItems: Array.isArray(data?.home_shop_section_items) ? data.home_shop_section_items : fallback.homeShopSectionItems,
    };
  } catch {
    return fallback;
  }
}

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

type BookingPaymentLookup = {
  paymentId?: string | null;
  sessionReference?: string | null;
  providerReference?: string | null;
  reservationId?: string | null;
};

async function findBookingPaymentRecord(supabase: AdminClient, lookup: BookingPaymentLookup) {
  const attempts: Array<{ column: 'id' | 'session_reference' | 'provider_reference' | 'reservation_id'; value?: string | null }> = [
    { column: 'id', value: lookup.paymentId },
    { column: 'session_reference', value: lookup.sessionReference },
    { column: 'provider_reference', value: lookup.providerReference },
    { column: 'reservation_id', value: lookup.reservationId },
  ];

  for (const attempt of attempts) {
    if (!attempt.value) continue;

    const { data, error } = await supabase
      .from('payments')
      .select('id, booking_id, reservation_id, status, paid_at, session_reference, provider_reference')
      .eq(attempt.column, attempt.value)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  return null;
}
