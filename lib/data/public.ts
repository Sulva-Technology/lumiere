import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type {
  AvailableSlot,
  BookingConfirmation,
  BookingService,
  CartLineInput,
  Category,
  CreateBookingInput,
  ProductDetail,
  ProductListItem,
  StylistSummary,
  ValidatedCartLine,
} from '@/lib/types';
import { sendBookingConfirmationEmails } from '@/lib/notifications';

function normalizeMoney(value: number | string | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

function relationFirst<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
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
        product_categories(name),
        product_variants(price, compare_at_price, stock_quantity, active)
      `
    )
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    const { data: categoryRecord } = await supabase
      .from('product_categories')
      .select('id')
      .eq('slug', category)
      .maybeSingle();

    if (categoryRecord) {
      query = query.eq('category_id', categoryRecord.id);
    }
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
        product_categories(name),
        product_variants(id, product_id, sku, title, shade, length, size, price, compare_at_price, stock_quantity, active),
        product_images(id, url, alt, sort_order)
      `
    )
    .eq('slug', slug)
    .eq('active', true)
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

  return (data ?? []).map((service) => ({
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
    .order('available', { ascending: false })
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
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
    .limit(40);

  if (stylistId) query = query.eq('stylist_id', stylistId);
  if (serviceId) query = query.eq('service_id', serviceId);

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((slot) => ({
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
        products!inner(id, slug, name, default_image_url, active)
      `
    )
    .in('id', variantIds);

  if (error) throw error;

  const variantMap = new Map(data.map((variant) => [variant.id, variant]));

  return lines.map((line) => {
    const variant = variantMap.get(line.variantId);
    const product = relationFirst(variant?.products);

    if (!variant || !variant.active || !product?.active) {
      throw new Error('One or more cart items are no longer available.');
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

export async function createBooking(input: CreateBookingInput): Promise<BookingConfirmation> {
  const supabase = createSupabaseAdminClient();

  const { data: slot, error: slotError } = await supabase
    .from('booking_availability')
    .select('id, starts_at, ends_at, is_available, stylist_id, service_id')
    .eq('id', input.availabilityId)
    .eq('is_available', true)
    .maybeSingle();

  if (slotError) throw slotError;
  if (!slot || slot.stylist_id !== input.stylistId || slot.service_id !== input.serviceId) {
    throw new Error('Selected booking slot is no longer available.');
  }

  const { data: customer } = await supabase
    .from('customers')
    .upsert(
      {
        email: input.email,
        full_name: input.fullName,
        phone: input.phone,
      },
      {
        onConflict: 'email',
      }
    )
    .select('id')
    .single();

  const bookingReference = `BKG-${Math.floor(Date.now() / 1000)}`;

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      booking_reference: bookingReference,
      customer_id: customer?.id ?? null,
      stylist_id: input.stylistId,
      service_id: input.serviceId,
      availability_id: input.availabilityId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      notes: input.notes ?? null,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      status: 'confirmed',
    })
    .select(
      `
        id,
        booking_reference,
        starts_at,
        status,
        stylists(name),
        booking_services(name)
      `
    )
    .single();

  if (bookingError) throw bookingError;

  const { error: updateAvailabilityError } = await supabase
    .from('booking_availability')
    .update({ is_available: false })
    .eq('id', input.availabilityId);

  if (updateAvailabilityError) throw updateAvailabilityError;

  try {
    const store = await getPublicStoreSettings();
    await sendBookingConfirmationEmails({
      storeName: store.storeName,
      supportEmail: store.supportEmail,
      bookingContactEmail: store.bookingContactEmail,
      fullName: input.fullName,
      email: input.email,
      bookingReference: booking.booking_reference,
      serviceName: relationFirst(booking.booking_services)?.name ?? 'Selected service',
      stylistName: relationFirst(booking.stylists)?.name ?? 'Assigned stylist',
      startsAt: booking.starts_at,
      phone: input.phone,
      notes: input.notes ?? null,
    });
  } catch (notificationError) {
    console.error('Booking confirmation email failed', notificationError);
  }

  return {
    id: booking.id,
    bookingReference: booking.booking_reference,
    stylistName: relationFirst(booking.stylists)?.name ?? 'Assigned stylist',
    serviceName: relationFirst(booking.booking_services)?.name ?? 'Selected service',
    startsAt: booking.starts_at,
    status: booking.status,
  };
}

export async function getPublicStoreSettings() {
  const fallback = {
    storeName: "thedmashop",
    supportEmail: 'support@thedmashop.com',
    supportPhone: '+1 (555) 123-4567',
    bookingContactEmail: 'bookings@thedmashop.com',

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

