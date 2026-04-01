import { z } from 'zod';

export const cartLineInputSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(20),
});

export const checkoutSessionSchema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(30).optional(),
  shippingAddress: z.object({
    line1: z.string().trim().min(1).max(120),
    line2: z.string().trim().max(120).optional(),
    city: z.string().trim().min(1).max(80),
    state: z.string().trim().max(80).optional(),
    postalCode: z.string().trim().min(2).max(20),
    country: z.string().trim().length(2),
  }),
  lines: z.array(cartLineInputSchema).min(1).max(20),
});

export const createBookingSchema = z.object({
  stylistId: z.string().uuid(),
  serviceId: z.string().uuid(),
  availabilityId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  phone: z.string().trim().min(7).max(30),
  notes: z.string().trim().max(500).optional(),
});

export const adminProductUpdateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180),
  description: z.string().trim().max(4000).nullable(),
  categoryId: z.string().uuid().nullable(),
  featured: z.boolean(),
  active: z.boolean(),
});

export const adminOrderStatusSchema = z.object({
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'cancelled']).optional(),
  fulfillmentStatus: z.enum(['unfulfilled', 'processing', 'shipped', 'delivered']).optional(),
});

export const adminBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled']),
});

export const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(2).max(160),
  supportEmail: z.string().email(),
  supportPhone: z.string().trim().max(40).optional().or(z.literal('')),
  bookingContactEmail: z.string().email().optional().or(z.literal('')),
  announcementBar: z.string().trim().max(280).optional().or(z.literal('')),
});
