export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  featured: boolean;
  rating: number;
  reviewCount: number;
  defaultImage: string | null;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  title: string;
  shade: string | null;
  length: string | null;
  size: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  active: boolean;
}

export interface ProductDetail extends ProductListItem {
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }>;
  variants: ProductVariant[];
  details: string[];
  careInstructions: string[];
  shippingNotes: string[];
}

export interface CartLineInput {
  variantId: string;
  quantity: number;
}

export interface ValidatedCartLine {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantTitle: string;
  unitAmount: number;
  quantity: number;
  imageUrl: string | null;
}

export interface CheckoutSummary {
  currency: 'usd';
  subtotal: number;
  shipping: number;
  total: number;
  lines: ValidatedCartLine[];
}

export interface CreateCheckoutSessionInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  lines: CartLineInput[];
}

export interface CreateCheckoutSessionResult {
  checkoutUrl: string;
  orderId: string;
}

export interface BookingService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  price: number;
}

export interface StylistSummary {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  specialties: string[];
  rating: number;
  avatarUrl: string | null;
  available: boolean;
  basePrice: number | null;
}

export interface AvailableSlot {
  id: string;
  stylistId: string;
  serviceId: string | null;
  startsAt: string;
  endsAt: string;
  isAvailable: boolean;
}

export interface CreateBookingInput {
  stylistId: string;
  serviceId: string;
  availabilityId: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface BookingConfirmation {
  id: string;
  bookingReference: string;
  stylistName: string;
  serviceName: string;
  startsAt: string;
  status: string;
}

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  createdAt: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  itemsCount: number;
}

export interface AdminBookingRow {
  id: string;
  bookingReference: string;
  clientName: string;
  stylistName: string;
  serviceName: string;
  startsAt: string;
  status: string;
}

export interface AdminCustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  ordersCount: number;
  bookingsCount: number;
  totalSpent: number;
  lastActiveAt: string | null;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeBookings: number;
  newCustomers: number;
  recentOrders: AdminOrderRow[];
  lowStockProducts: Array<{
    variantId: string;
    label: string;
    stockQuantity: number;
  }>;
}

export interface AuthenticatedAdminUser {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

