import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createHostedCheckoutSession } from "@/lib/payments";
import { sendBookingConfirmationEmails } from "@/lib/notifications";
import { createAuditLog } from "@/lib/data/audit";
import {
  claimOpenTime,
  listOpenTimes,
  parseOpenTimeId,
} from "@/lib/data/availability";
import { logEvent } from "@/lib/observability";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";
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
  GalleryItem,
  StylistSummary,
  ValidatedCartLine,
} from "@/lib/types";

function normalizeMoney(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
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
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return Object.keys(value as Record<string, unknown>).length > 0
    ? (value as MakeupBookingIntake)
    : null;
}

function isMissingColumnError(error: unknown, columnName: string) {
  const message =
    error &&
    typeof error === "object" &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  return (
    message.includes(`Could not find the '${columnName}' column`) ||
    message.includes(`column "${columnName}" does not exist`)
  );
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
  const { data, error } = await supabase
    .from("product_categories")
    .select("id, name, slug, description")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getProducts(
  category?: string,
): Promise<ProductListItem[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("products")
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
      `,
    )
    .eq("active", true)
    .eq("lifecycle_status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    const { data: categoryRecord } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();
    if (categoryRecord) query = query.eq("category_id", categoryRecord.id);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((product) => {
    const activeVariants = (product.product_variants ?? []).filter(
      (variant) => variant.active,
    );
    const cheapestVariant = activeVariants.sort(
      (a, b) => normalizeMoney(a.price) - normalizeMoney(b.price),
    )[0];
    const totalStock = activeVariants.reduce(
      (sum, variant) => sum + variant.stock_quantity,
      0,
    );

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
      compareAtPrice: cheapestVariant?.compare_at_price
        ? normalizeMoney(cheapestVariant.compare_at_price)
        : null,
      available: totalStock > 0,
    };
  });
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
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
      `,
    )
    .eq("slug", slug)
    .eq("active", true)
    .eq("lifecycle_status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const activeVariants = (data.product_variants ?? []).filter(
    (variant) => variant.active,
  );
  const cheapestVariant = activeVariants.sort(
    (a, b) => normalizeMoney(a.price) - normalizeMoney(b.price),
  )[0];

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
    compareAtPrice: cheapestVariant?.compare_at_price
      ? normalizeMoney(cheapestVariant.compare_at_price)
      : null,
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
      compareAtPrice: variant.compare_at_price
        ? normalizeMoney(variant.compare_at_price)
        : null,
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
    .from("booking_services")
    .select("id, slug, name, description, duration_minutes, price, service_type")
    .eq("active", true)
    .eq("service_type", "makeup")
    .order("price");

  if (error) throw error;
  // We import SERVICES dynamically to avoid circular dependencies if any,
  // though here it's fine. We'll use the slug to match.
  const { SERVICES } = require("./services");

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
      bestFor: seoData?.bestFor ?? "",
    } as BookingService;
  });
}

export async function getPublicGallery(): Promise<GalleryItem[]> {
  const fallback: GalleryItem[] = [
    { id: 'soft-glam', title: 'Soft Glam', alt: 'Soft glam makeup look by Itz Lola Beauty', category: 'Soft Glam', imageUrl: '/images/makeup.jpeg', sortOrder: 1, active: true, mediaAssetId: null },
    { id: 'luxury-glam', title: 'Luxury Glam', alt: 'Luxury makeup portrait by Itz Lola Beauty', category: 'Full Glam', imageUrl: '/images/home.jpeg', sortOrder: 2, active: true, mediaAssetId: null },
    { id: 'artist-detail', title: 'Artist Detail', alt: 'Makeup artist Lola of Itz Lola Beauty', category: 'Behind the Scenes', imageUrl: '/images/founder.jpeg', sortOrder: 3, active: true, mediaAssetId: null },
  ];

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("gallery_items")
      .select("id, title, alt, category, image_url, sort_order, active, media_asset_id")
      .eq("active", true)
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return (data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      alt: item.alt,
      category: item.category,
      imageUrl: item.image_url,
      sortOrder: item.sort_order,
      active: item.active,
      mediaAssetId: item.media_asset_id,
    }));
  } catch {
    return fallback;
  }
}

export async function getStylists(): Promise<StylistSummary[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("stylists")
    .select(
      "id, slug, name, bio, specialties, rating, avatar_url, available, base_price",
    )
    .eq("available", true)
    .order("name");

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

export async function getAvailability(
  stylistId?: string,
  serviceId?: string,
): Promise<AvailableSlot[]> {
  // Open times are worked out from her weekly hours and changed dates, minus
  // anything already booked or held, so every month shows without stored slots.
  if (!stylistId || !serviceId) return [];
  return listOpenTimes(stylistId, serviceId);
}

export async function validateCartLines(
  lines: CartLineInput[],
): Promise<ValidatedCartLine[]> {
  const supabase = createSupabaseAdminClient();
  const variantIds = lines.map((line) => line.variantId);

  const { data, error } = await supabase
    .from("product_variants")
    .select(
      `
        id,
        product_id,
        title,
        price,
        stock_quantity,
        active,
        products!inner(id, slug, name, default_image_url, active, lifecycle_status)
      `,
    )
    .in("id", variantIds);

  if (error) throw error;

  const variantMap = new Map(data.map((variant) => [variant.id, variant]));

  return lines.map((line) => {
    const variant = variantMap.get(line.variantId);
    const product = relationFirst(variant?.products);

    if (
      !variant ||
      !variant.active ||
      !product?.active ||
      product.lifecycle_status !== "active"
    ) {
      throw new Error("One or more selected items are no longer available.");
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

async function getAvailableSlot(
  input: Pick<CreateBookingInput, "availabilityId" | "serviceId" | "stylistId">,
) {
  const supabase = createSupabaseAdminClient();
  const { data: service, error: serviceError } = await supabase
    .from("booking_services")
    .select("duration_minutes")
    .eq("id", input.serviceId)
    .eq("active", true)
    .maybeSingle();

  if (serviceError) throw serviceError;
  if (!service) throw new Error("Selected service is unavailable.");

  // 1. Resolve the requested time to a stored slot
  const openTimeStart = parseOpenTimeId(input.availabilityId);
  let slot;
  if (openTimeStart) {
    slot = await claimOpenTime({
      stylistId: input.stylistId,
      serviceId: input.serviceId,
      startsAt: openTimeStart,
    });
  } else {
    const { data, error: slotError } = await supabase
      .from("booking_availability")
      .select("id, starts_at, ends_at, is_available, stylist_id, service_id")
      .eq("id", input.availabilityId)
      .eq("is_available", true)
      .maybeSingle();

    if (slotError) throw slotError;
    slot = data;
  }
  if (
    !slot ||
    slot.stylist_id !== input.stylistId ||
    new Date(slot.ends_at).getTime() - new Date(slot.starts_at).getTime() <
      service.duration_minutes * 60_000
  ) {
    throw new Error("That appointment time is no longer available.");
  }

  const slotStart = new Date(slot.starts_at).getTime();
  const slotEnd = new Date(slot.ends_at).getTime();
  // 2. Double check for a real overlap with a confirmed booking.
  const { data: confirmedBookings } = await supabase
    .from("bookings")
    .select("id, starts_at, ends_at")
    .eq("stylist_id", input.stylistId)
    .in("status", ["confirmed", "completed"])
    .lt("starts_at", new Date(slotEnd).toISOString())
    .gt("ends_at", new Date(slotStart).toISOString());

  if (confirmedBookings && confirmedBookings.length > 0) {
    throw new Error(
      "This time is no longer available due to a recent booking overlap.",
    );
  }

  // 3. Check for active reservations
  const { data: activeReservations } = await supabase
    .from("booking_reservations")
    .select(
      "id, availability_id, booking_availability(starts_at, ends_at, stylist_id)",
    )
    .eq("reservation_status", "pending_payment")
    .gt("expires_at", nowIso());

  const hasOverlappingReservation = (activeReservations ?? []).some(
    (reservation) => {
      const reservedSlot = relationFirst(reservation.booking_availability);
      if (!reservedSlot || reservedSlot.stylist_id !== input.stylistId)
        return false;
      const reservedStart = new Date(reservedSlot.starts_at).getTime();
      const reservedEnd = new Date(reservedSlot.ends_at).getTime();
      return slotStart < reservedEnd && slotEnd > reservedStart;
    },
  );

  if (hasOverlappingReservation) {
    throw new Error("That appointment time is being held for another guest.");
  }

  return slot;
}

export async function createBookingCheckout(
  input: CreateBookingInput,
): Promise<CreateBookingCheckoutResult> {
  const supabase = createSupabaseAdminClient();
  const [slot, services, store] = await Promise.all([
    getAvailableSlot(input),
    getBookingServices(),
    getPublicStoreSettings(),
  ]);
  const service = services.find((item) => item.id === input.serviceId);
  if (!service) throw new Error("Selected service is unavailable.");
  // Travel is quoted directly by the artist and is never added automatically.
  const travelFee = 0;
  const sameDayFee = input.sameDayAppointment ? 50 : 0;
  const appointmentTotal = service.price + travelFee + sameDayFee;
  const retainerAmount = 35 + sameDayFee;
  const remainingBalance = Math.max(appointmentTotal - retainerAmount, 0);
  const isInPersonPayment = input.paymentMethod === "in_person";
  const isMakeupService = service.serviceType === "makeup";

  const normalizedIntake =
    isMakeupService && input.makeupIntake ? input.makeupIntake : null;

  const reservationPayload = {
    availability_id: slot.id,
    stylist_id: input.stylistId,
    service_id: input.serviceId,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    notes:
      [
        input.notes?.trim(),
        input.sameDayAppointment
          ? "Same-day appointment add-on selected."
          : null,
      ]
        .filter(Boolean)
        .join("\n") || null,
    intake_payload: normalizedIntake,
    reservation_status: "pending_payment",
    expires_at: expiresIn(15),
  };

  let reservationResult = await supabase
    .from("booking_reservations")
    .insert(reservationPayload)
    .select("*")
    .single();

  if (
    reservationResult.error &&
    isMissingColumnError(reservationResult.error, "intake_payload")
  ) {
    const { intake_payload: _intakePayload, ...fallbackReservationPayload } =
      reservationPayload;
    reservationResult = await supabase
      .from("booking_reservations")
      .insert(fallbackReservationPayload)
      .select("*")
      .single();
  }

  const { data: reservation, error: reservationError } = reservationResult;

  if (reservationError) throw reservationError;

  logEvent("info", "booking.reservation_created", {
    reservationId: reservation.id,
    availabilityId: slot.id,
    stylistId: input.stylistId,
    serviceId: input.serviceId,
    email: input.email,
  });

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      reservation_id: reservation.id,
      provider: isInPersonPayment ? "in_person" : "hosted_checkout",
      status: "pending",
      amount: retainerAmount,
      currency: "usd",
      method_family: isInPersonPayment ? "in_person" : "hosted_checkout",
      expires_at: isInPersonPayment ? null : reservation.expires_at,
      metadata: {
        kind: "booking",
        serviceName: service.name,
        appointmentTotal,
        retainerAmount,
        remainingBalance,
        travelFee,
        sameDayFee,
        makeupIntake: normalizedIntake,
      },
    })
    .select("id")
    .single();

  if (paymentError) throw paymentError;

  logEvent("info", "booking.payment_created", {
    paymentId: payment.id,
    reservationId: reservation.id,
    amount: retainerAmount,
  });

  if (isInPersonPayment) {
    await finalizePaidBooking({ paymentId: payment.id, inPerson: true });
    return {
      checkoutUrl: null,
      reservationId: reservation.id,
      paymentId: payment.id,
    };
  }

  try {
    const session = await createHostedCheckoutSession({
      email: input.email,
      successPath: `/book?success=1&reservation=${reservation.id}`,
      cancelPath: `/book?canceled=1&reservation=${reservation.id}`,
      metadata: {
        kind: "booking",
        reservationId: reservation.id,
        paymentId: payment.id,
        availabilityId: slot.id,
      },
      lines: [{
        name: "Appointment deposit",
        description: `${service.name} - ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: BUSINESS_TIME_ZONE }).format(new Date(slot.starts_at))}. Remaining balance due at appointment: $${remainingBalance.toFixed(2)}.`,
        amount: retainerAmount,
        quantity: 1,
      }],
    });

    await supabase
      .from("payments")
      .update({
        session_reference: session.id,
        provider_reference: session.id,
        idempotency_key: session.id,
      })
      .eq("id", payment.id);

    logEvent("info", "booking.session_created", {
      reservationId: reservation.id,
      paymentId: payment.id,
      sessionId: session.id,
      livemode: session.livemode,
    });

    await createAuditLog({
      action: "booking.reservation_created",
      entityType: "booking_reservation",
      entityId: reservation.id,
      payload: { paymentId: payment.id, availabilityId: slot.id },
    });

    return {
      checkoutUrl: session.url!,
      reservationId: reservation.id,
      paymentId: payment.id,
    };
  } catch (error) {
    logEvent("error", "booking.session_create_failed", {
      reservationId: reservation.id,
      paymentId: payment.id,
      reason:
        error instanceof Error
          ? error.message
          : "Unable to start secure checkout.",
    });
    await supabase
      .from("payments")
      .update({
        status: "failed",
        failure_reason:
          error instanceof Error
            ? error.message
            : "Unable to start secure checkout.",
      })
      .eq("id", payment.id);
    await supabase
      .from("booking_reservations")
      .update({ reservation_status: "cancelled" })
      .eq("id", reservation.id);
    throw error;
  }
}

export async function finalizePaidBooking(input: {
  paymentId?: string | null;
  providerReference?: string | null;
  sessionReference?: string | null;
  reservationId?: string | null;
  inPerson?: boolean;
}): Promise<BookingConfirmation | null> {
  const supabase = createSupabaseAdminClient();
  const payment = await findBookingPaymentRecord(supabase, input);

  if (!payment?.reservation_id) {
    logEvent("warn", "booking.payment_not_found", {
      paymentId: input.paymentId ?? null,
      sessionReference: input.sessionReference ?? null,
      providerReference: input.providerReference ?? null,
      reservationId: input.reservationId ?? null,
    });
    return null;
  }

  const resolvedSessionReference =
    input.sessionReference ?? payment.session_reference ?? null;
  const resolvedProviderReference =
    input.providerReference ?? payment.provider_reference ?? payment.id;
  const paymentStatus = input.inPerson ? "pending" : "paid";
  const bookingPaymentStatus = input.inPerson ? "pending_payment" : "paid";
  const reconciliationState = input.inPerson
    ? "awaiting_in_person_payment"
    : "captured";

  if (payment.booking_id) {
    await supabase
      .from("payments")
      .update({
        status: paymentStatus,
        paid_at: input.inPerson ? null : (payment.paid_at ?? nowIso()),
        session_reference: resolvedSessionReference,
        provider_reference: resolvedProviderReference,
        reconciliation_state: reconciliationState,
      })
      .eq("id", payment.id);

    logEvent("info", "booking.payment_already_captured", {
      bookingId: payment.booking_id,
      paymentId: payment.id,
      sessionReference: resolvedSessionReference,
      providerReference: resolvedProviderReference,
    });
    const existing = await getBookingConfirmation(payment.booking_id);
    return existing;
  }

  let reservationResult = await supabase
    .from("booking_reservations")
    .select(
      "*, booking_availability(starts_at, ends_at), booking_services(name), stylists(name, email)",
    )
    .eq("id", payment.reservation_id)
    .maybeSingle();

  if (
    reservationResult.error &&
    isMissingColumnError(reservationResult.error, "email")
  ) {
    reservationResult = await supabase
      .from("booking_reservations")
      .select(
        "*, booking_availability(starts_at, ends_at), booking_services(name), stylists(name)",
      )
      .eq("id", payment.reservation_id)
      .maybeSingle();
  }

  const { data: reservation, error: reservationError } = reservationResult;

  if (reservationError) throw reservationError;
  if (!reservation) return null;
  let reservationAvailability = relationFirst(reservation.booking_availability);

  if (!reservationAvailability && reservation.availability_id) {
    const { data: availability, error: availabilityError } = await supabase
      .from("booking_availability")
      .select("starts_at, ends_at")
      .eq("id", reservation.availability_id)
      .maybeSingle();

    if (availabilityError) throw availabilityError;
    reservationAvailability = availability;
  }

  let customerId: string | null = null;

  try {
    const { data: customer } = await supabase
      .from("customers")
      .upsert(
        {
          email: reservation.email,
          full_name: reservation.full_name,
          phone: reservation.phone,
        },
        { onConflict: "email" },
      )
      .select("id")
      .single();

    customerId = customer?.id ?? null;
  } catch (customerError) {
    logEvent("warn", "booking.customer_upsert_failed", {
      reservationId: reservation.id,
      paymentId: payment.id,
      reason:
        customerError instanceof Error
          ? customerError.message
          : "customer_upsert_failed",
    });

    if (reservation.email) {
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", reservation.email)
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
    status: "confirmed",
    payment_status: bookingPaymentStatus,
  };

  let bookingResult = await supabase
    .from("bookings")
    .insert(bookingPayload)
    .select("id")
    .single();

  if (
    bookingResult.error &&
    isMissingColumnError(bookingResult.error, "intake_payload")
  ) {
    const { intake_payload: _intakePayload, ...fallbackBookingPayload } =
      bookingPayload;
    bookingResult = await supabase
      .from("bookings")
      .insert(fallbackBookingPayload)
      .select("id")
      .single();
  }

  const { data: booking, error: bookingError } = bookingResult;

  if (bookingError) {
    if ((bookingError as { code?: string }).code !== "23505")
      throw bookingError;
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("availability_id", reservation.availability_id)
      .maybeSingle();
    if (!existing) throw bookingError;
    await supabase
      .from("booking_availability")
      .update({ is_available: false })
      .eq("id", reservation.availability_id);

    await supabase
      .from("booking_reservations")
      .update({ reservation_status: "confirmed" })
      .eq("id", reservation.id);

    await supabase
      .from("payments")
      .update({
        booking_id: existing.id,
        status: paymentStatus,
        paid_at: input.inPerson ? null : (payment.paid_at ?? nowIso()),
        session_reference: resolvedSessionReference,
        provider_reference: resolvedProviderReference,
        reconciliation_state: reconciliationState,
      })
      .eq("id", payment.id);

    logEvent("warn", "booking.payment_attached_existing_booking", {
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
    .from("booking_availability")
    .update({ is_available: false })
    .eq("id", reservation.availability_id);

  await supabase
    .from("booking_reservations")
    .update({ reservation_status: "confirmed" })
    .eq("id", reservation.id);

  await supabase
    .from("payments")
    .update({
      booking_id: booking.id,
      status: paymentStatus,
      paid_at: input.inPerson ? null : (payment.paid_at ?? nowIso()),
      session_reference: resolvedSessionReference,
      provider_reference: resolvedProviderReference,
      reconciliation_state: reconciliationState,
    })
    .eq("id", payment.id);

  await createAuditLog({
    action: "booking.confirmed",
    entityType: "booking",
    entityId: booking.id,
    payload: { paymentId: payment.id, reservationId: reservation.id },
  });

  logEvent("info", "booking.payment_captured", {
    bookingId: booking.id,
    reservationId: reservation.id,
    paymentId: payment.id,
    sessionReference: resolvedSessionReference,
    providerReference: resolvedProviderReference,
  });

  try {
    const store = await getPublicStoreSettings();
    const stylist = relationFirst(reservation.stylists) as {
      name?: string | null;
      email?: string | null;
    } | null;
    await sendBookingConfirmationEmails({
      storeName: store.storeName,
      supportEmail: store.supportEmail,
      bookingContactEmail: store.bookingContactEmail,
      stylistEmail: stylist?.email ?? null,
      fullName: reservation.full_name,
      email: reservation.email,
      bookingReference,
      serviceName:
        relationFirst(reservation.booking_services)?.name ?? "Selected service",
      stylistName: stylist?.name ?? "Lead Artist",
      startsAt: reservationAvailability?.starts_at ?? nowIso(),
      phone: reservation.phone,
      notes: reservation.notes ?? null,
      makeupIntake: reservationIntake,
    });
  } catch (notificationError) {
    logEvent("error", "booking.confirmation_email_failed", {
      bookingId: booking.id,
      reservationId: reservation.id,
      paymentId: payment.id,
      reason:
        notificationError instanceof Error
          ? notificationError.message
          : "Unable to send booking email.",
    });
    console.error("Booking confirmation email failed", notificationError);
  }

  return getBookingConfirmation(booking.id);
}

export async function getBookingConfirmation(
  bookingId: string,
): Promise<BookingConfirmation | null> {
  const supabase = createSupabaseAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        booking_reference,
        starts_at,
        status,
        payment_status,
        stylists(name),
        booking_services(name)
      `,
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (error) throw error;
  if (!booking) return null;

  return {
    id: booking.id,
    bookingReference: booking.booking_reference,
    stylistName: relationFirst(booking.stylists)?.name ?? "Lead Artist",
    serviceName:
      relationFirst(booking.booking_services)?.name ?? "Selected service",
    startsAt: booking.starts_at,
    status: booking.status,
    paymentStatus: booking.payment_status,
  };
}

export async function getReservationById(
  reservationId: string,
): Promise<BookingReservation | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_reservations")
    .select("*")
    .eq("id", reservationId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapReservation(data) : null;
}

export async function markReservationCancelled(reservationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: reservation, error } = await supabase
    .from("booking_reservations")
    .select("id, reservation_status")
    .eq("id", reservationId)
    .maybeSingle();

  if (error) throw error;
  if (!reservation || reservation.reservation_status === "confirmed") return;

  await supabase
    .from("booking_reservations")
    .update({ reservation_status: "cancelled" })
    .eq("id", reservationId);
  await supabase
    .from("payments")
    .update({ status: "cancelled", cancelled_at: nowIso() })
    .eq("reservation_id", reservationId)
    .in("status", ["created", "pending", "authorized"]);
}

export async function expireStaleBookingReservations() {
  const supabase = createSupabaseAdminClient();
  const { data: staleReservations, error } = await supabase
    .from("booking_reservations")
    .select("id")
    .eq("reservation_status", "pending_payment")
    .lt("expires_at", nowIso());

  if (error) throw error;

  for (const reservation of staleReservations ?? []) {
    await supabase
      .from("booking_reservations")
      .update({ reservation_status: "expired" })
      .eq("id", reservation.id);
    await supabase
      .from("payments")
      .update({ status: "expired" })
      .eq("reservation_id", reservation.id)
      .in("status", ["created", "pending", "authorized"]);
  }
}

export async function getPublicStoreSettings() {
  const fallback = {
    storeName: "itzlolabeauty",
    supportEmail: "hello@itzlolabeauty.com",
    supportPhone: "+1 (555) 123-4567",
    bookingContactEmail: "ogunjobiniyiola906@gmail.com",
    announcementBar: null,
    travelFee: 0,
    homeFavoritesEnabled: true,
    homeShopSectionTitle: "Shop",
    homeShopSectionLinkLabel: "Shop Collection",
    homeShopSectionLinkHref: "/shop",
    homeShopSectionItems: [],
    homeSectionVisibility: { hero: true, gallery: true, policies: true },
  };

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select(
        "store_name, support_email, support_phone, booking_contact_email, announcement_bar, travel_fee, home_favorites_enabled, home_shop_section_title, home_shop_section_link_label, home_shop_section_link_href, home_shop_section_items, home_section_visibility",
      )
      .order("created_at")
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return {
      storeName: data?.store_name?.trim() || fallback.storeName,
      supportEmail: data?.support_email?.trim() || fallback.supportEmail,
      supportPhone: data?.support_phone?.trim() || fallback.supportPhone,
      bookingContactEmail:
        data?.booking_contact_email?.trim() || fallback.bookingContactEmail,
      announcementBar:
        data?.announcement_bar?.trim() || fallback.announcementBar,
      travelFee:
        Number.isFinite(Number(data?.travel_fee)) &&
        Number(data?.travel_fee) >= 0
          ? Number(data?.travel_fee)
          : fallback.travelFee,
      homeFavoritesEnabled:
        data?.home_favorites_enabled ?? fallback.homeFavoritesEnabled,
      homeShopSectionTitle:
        data?.home_shop_section_title?.trim() || fallback.homeShopSectionTitle,
      homeShopSectionLinkLabel:
        data?.home_shop_section_link_label?.trim() ||
        fallback.homeShopSectionLinkLabel,
      homeShopSectionLinkHref:
        data?.home_shop_section_link_href?.trim() ||
        fallback.homeShopSectionLinkHref,
      homeShopSectionItems: Array.isArray(data?.home_shop_section_items)
        ? data.home_shop_section_items
        : fallback.homeShopSectionItems,
      homeSectionVisibility: {
        ...fallback.homeSectionVisibility,
        ...(data?.home_section_visibility ?? {}),
      },
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

async function findBookingPaymentRecord(
  supabase: AdminClient,
  lookup: BookingPaymentLookup,
) {
  const attempts: Array<{
    column:
      "id" | "session_reference" | "provider_reference" | "reservation_id";
    value?: string | null;
  }> = [
    { column: "id", value: lookup.paymentId },
    { column: "session_reference", value: lookup.sessionReference },
    { column: "provider_reference", value: lookup.providerReference },
    { column: "reservation_id", value: lookup.reservationId },
  ];

  for (const attempt of attempts) {
    if (!attempt.value) continue;

    const { data, error } = await supabase
      .from("payments")
      .select(
        "id, booking_id, reservation_id, status, paid_at, session_reference, provider_reference",
      )
      .eq(attempt.column, attempt.value)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  return null;
}
