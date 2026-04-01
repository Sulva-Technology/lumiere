import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AdminBookingRow, AdminCustomerRow, AdminOrderRow, Category, DashboardMetrics, ProductDetail } from '@/lib/types';

function money(value: number | string | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

function relationFirst<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createSupabaseAdminClient();

  const [
    { data: orders },
    { count: bookingsCount },
    { count: customersCount },
    { data: variants },
    revenueResult,
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, email, total, payment_status, fulfillment_status, created_at, customers(full_name), order_items(id)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('product_variants')
      .select('id, title, stock_quantity, products(name)')
      .order('stock_quantity')
      .limit(3),
    supabase.from('orders').select('total, payment_status'),
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
  }));

  return {
    totalRevenue,
    totalOrders: revenueResult.data?.length ?? 0,
    activeBookings: bookingsCount ?? 0,
    newCustomers: customersCount ?? 0,
    recentOrders,
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
    .select('id, order_number, email, total, payment_status, fulfillment_status, created_at, customers(full_name), order_items(id)')
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
  }));
}

export async function getAdminBookings(): Promise<AdminBookingRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('id, booking_reference, full_name, starts_at, status, stylists(name), booking_services(name)')
    .order('starts_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((booking) => ({
    id: booking.id,
    bookingReference: booking.booking_reference,
    clientName: booking.full_name,
    stylistName: relationFirst(booking.stylists)?.name ?? 'Unknown stylist',
    serviceName: relationFirst(booking.booking_services)?.name ?? 'Unknown service',
    startsAt: booking.starts_at,
    status: booking.status,
  }));
}

export async function getAdminCustomers(): Promise<AdminCustomerRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, email, phone, created_at, orders(total, created_at), bookings(id, created_at)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((customer) => {
    const orders = customer.orders ?? [];
    const bookings = customer.bookings ?? [];
    const lastOrder = orders.map((order) => order.created_at).sort().at(-1);
    const lastBooking = bookings.map((booking) => booking.created_at).sort().at(-1);

    return {
      id: customer.id,
      name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      ordersCount: orders.length,
      bookingsCount: bookings.length,
      totalSpent: orders.reduce((sum, order) => sum + money(order.total), 0),
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
        details,
        care_instructions,
        shipping_notes,
        product_categories(name),
        product_variants(id, product_id, sku, title, shade, length, size, price, compare_at_price, stock_quantity, active),
        product_images(id, url, alt, sort_order)
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
  variantTitle: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  shade?: string | null;
  length?: string | null;
  size?: string | null;
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

  if (variantError) {
    await supabase.from('products').delete().eq('id', product.id);
    throw variantError;
  }

  if (input.defaultImageUrl?.trim()) {
    const { error: imageError } = await supabase.from('product_images').insert({
      product_id: product.id,
      url: input.defaultImageUrl.trim(),
      alt: input.name,
      sort_order: 0,
    });

    if (imageError) {
      await supabase.from('products').delete().eq('id', product.id);
      throw imageError;
    }
  }

  const products = await getAdminProducts();
  return products.find((item) => item.id === product.id) ?? null;
}

export async function deleteAdminProduct(productId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
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
  return data;
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('bookings').update({ status }).eq('id', bookingId).select().single();
  if (error) throw error;
  return data;
}
