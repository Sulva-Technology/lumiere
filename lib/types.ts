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
  active: boolean;
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
  paymentId: string;
}

export type PaymentStatus = 'created' | 'pending' | 'authorized' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded';
export type PaymentProvider = 'hosted_checkout';
export type PaymentMethodFamily = 'hosted_checkout';
export type OrderLifecycleState = 'draft' | 'pending_payment' | 'paid' | 'payment_failed' | 'cancelled' | 'refunded';
export type BookingLifecycleState = 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'expired' | 'refunded';
export type MakeupLookType = 'Soft glam' | 'Full glam' | 'Natural' | 'Not sure';
export type MakeupSkinType = 'Oily' | 'Dry' | 'Combination' | 'Normal' | 'Not sure';
export type MakeupLashesPreference = 'Yes' | 'No' | "I'll bring my own";
export type MakeupHistoryAnswer = 'Yes' | 'No';
export type BookingServiceType = 'makeup' | 'content';

export interface MakeupBookingIntake {
  appointmentDateTimeNeeded: string;
  occasion: string;
  referenceDescription: string;
  referenceImageUrl?: string | null;
  referenceImageAssetId?: string | null;
  lookType: MakeupLookType;
  skinType: MakeupSkinType;
  skinConditionsOrAllergies: string;
  lashesPreference: MakeupLashesPreference;
  hadProfessionalMakeupBefore: MakeupHistoryAnswer;
  priorExperienceNotes?: string | null;
  productPreferencesOrRestrictions?: string | null;
}

export interface PaymentRecord {
  id: string;
  orderId: string | null;
  bookingId: string | null;
  reservationId: string | null;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  methodFamily: PaymentMethodFamily;
  providerReference: string | null;
  sessionReference: string | null;
  failureReason: string | null;
  reconciliationState: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  expiresAt: string | null;
}

export interface MediaAsset {
  id: string;
  bucket: string;
  objectPath: string;
  publicUrl: string;
  alt: string | null;
  ownerType: 'product' | 'product_image' | 'variant' | 'general';
  ownerId: string | null;
  lifecycleStatus: 'active' | 'archived' | 'deleted' | 'orphaned';
  sortOrder: number;
}

export interface BookingService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  serviceType: BookingServiceType;
  active?: boolean;
  bestFor?: string;
  included?: string[];
  prepNotes?: string[];
}

export interface AvailabilityRule {
  id: string;
  stylistId: string;
  serviceId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  active: boolean;
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
  makeupIntake?: MakeupBookingIntake | null;
}

export interface BookingReservation {
  id: string;
  availabilityId: string;
  stylistId: string;
  serviceId: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string | null;
  makeupIntake: MakeupBookingIntake | null;
  reservationStatus: 'pending_payment' | 'confirmed' | 'cancelled' | 'expired';
  expiresAt: string;
}

export interface CreateBookingCheckoutResult {
  checkoutUrl: string;
  reservationId: string;
  paymentId: string;
}

export interface BookingConfirmation {
  id: string;
  bookingReference: string;
  stylistName: string;
  serviceName: string;
  startsAt: string;
  status: BookingLifecycleState;
  paymentStatus: PaymentStatus;
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
  paymentProvider: string | null;
  paymentReference: string | null;
}

export interface AdminBookingRow {
  id: string;
  bookingReference: string | null;
  reservationId: string | null;
  clientName: string;
  stylistName: string;
  serviceName: string;
  startsAt: string;
  status: string;
  paymentStatus: string;
  paymentProvider: string | null;
  paymentReference: string | null;
  notes: string | null;
  entryType: 'booking' | 'reservation';
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
  pendingPayments: number;
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

export interface HomeShopSectionItem {
  title: string;
  description: string;
}

export interface StoreSettings {
  id?: string;
  store_name: string;
  support_email: string;
  support_phone: string | null;
  booking_contact_email: string | null;
  announcement_bar: string | null;
  home_favorites_enabled: boolean;
  home_shop_section_title: string | null;
  home_shop_section_link_label: string | null;
  home_shop_section_link_href: string | null;
  home_shop_section_items: HomeShopSectionItem[];
}
