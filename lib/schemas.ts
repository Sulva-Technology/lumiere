import { z } from 'zod';

const makeupLookTypes = ['Soft glam', 'Full glam', 'Natural', 'Not sure'] as const;
const makeupSkinTypes = ['Oily', 'Dry', 'Combination', 'Normal', 'Not sure'] as const;
const makeupLashesPreferences = ['Yes', 'No', "I'll bring my own"] as const;
const makeupHistoryAnswers = ['Yes', 'No'] as const;
const bookingServiceTypes = ['makeup', 'content'] as const;
const homeShopSectionItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
});
const homeTestimonialItemSchema = z.object({
  quote: z.string().trim().min(8).max(600),
  name: z.string().trim().min(2).max(120),
  context: z.string().trim().min(2).max(160),
});

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
  makeupIntake: z
    .object({
      appointmentDateTimeNeeded: z.string().trim().min(2).max(160),
      occasion: z.string().trim().min(2).max(160),
      referenceDescription: z.string().trim().min(2).max(1500),
      referenceImageUrl: z.string().trim().url().nullable().optional(),
      referenceImageAssetId: z.string().uuid().nullable().optional(),
      lookType: z.enum(makeupLookTypes),
      skinType: z.enum(makeupSkinTypes),
      skinConditionsOrAllergies: z.string().trim().min(2).max(1000),
      lashesPreference: z.enum(makeupLashesPreferences),
      hadProfessionalMakeupBefore: z.enum(makeupHistoryAnswers),
      priorExperienceNotes: z.string().trim().max(1000).nullable().optional(),
      productPreferencesOrRestrictions: z.string().trim().max(1000).nullable().optional(),
    })
    .optional(),
});

export const cancelReservationSchema = z.object({
  reservationId: z.string().uuid(),
});

export const contactInquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  phone: z.string().trim().min(7).max(30),
  eventDate: z.string().trim().min(4).max(40).nullable().optional(),
  serviceInterest: z.string().trim().min(2).max(160),
  location: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(4000),
});

export const adminProductUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180),
  description: z.string().trim().max(4000).nullable(),
  categoryId: z.string().uuid().nullable(),
  featured: z.boolean(),
  active: z.boolean(),
  lifecycleStatus: z.enum(['active', 'archived']).optional(),
  defaultImageUrl: z.union([z.string().trim().url(), z.literal(''), z.null()]).optional(),
  mediaAssetId: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
});

export const adminProductCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only.'),
  description: z.string().trim().max(4000).optional().or(z.literal('')),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  defaultImageUrl: z.string().trim().url().optional().or(z.literal('')),
  mediaAssetId: z.string().uuid().optional().or(z.literal('')),
  variantTitle: z.string().trim().min(1).max(160),
  sku: z.string().trim().min(2).max(120),
  price: z.coerce.number().min(0),
  compareAtPrice: z.union([z.coerce.number().min(0), z.null()]).optional(),
  stockQuantity: z.coerce.number().int().min(0),
  shade: z.string().trim().max(120).optional().or(z.literal('')),
  length: z.string().trim().max(120).optional().or(z.literal('')),
  size: z.string().trim().max(120).optional().or(z.literal('')),
});

export const adminOrderStatusSchema = z.object({
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'cancelled']).optional(),
  fulfillmentStatus: z.enum(['unfulfilled', 'processing', 'shipped', 'delivered']).optional(),
});

export const adminBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled', 'expired', 'refunded']),
});

export const adminAvailabilityCreateSchema = z.object({
  stylistId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(12 * 60),
});

export const adminAvailabilityDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const adminBookingServiceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only.'),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  durationMinutes: z.coerce.number().int().min(15).max(12 * 60),
  price: z.coerce.number().min(0),
  serviceType: z.enum(bookingServiceTypes),
  active: z.boolean().optional().default(true),
});

export const adminAvailabilityRuleSchema = z.object({
  id: z.string().uuid().optional(),
  stylistId: z.string().uuid(),
  serviceId: z.string().uuid(),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  active: z.boolean().optional().default(true),
});

export const adminMediaLifecycleSchema = z.object({
  assetId: z.string().uuid(),
  lifecycleStatus: z.enum(['active', 'archived', 'deleted', 'orphaned']),
});

export const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(2).max(160),
  supportEmail: z.string().email(),
  supportPhone: z.string().trim().max(40).optional().or(z.literal('')),
  bookingContactEmail: z.string().email().optional().or(z.literal('')),
  announcementBar: z.string().trim().max(280).optional().or(z.literal('')),
  homeFavoritesEnabled: z.boolean().optional(),
  homeShopSectionTitle: z.string().trim().max(160).optional().or(z.literal('')),
  homeShopSectionLinkLabel: z.string().trim().max(120).optional().or(z.literal('')),
  homeShopSectionLinkHref: z.string().trim().max(240).optional().or(z.literal('')),
  homeShopSectionItems: z.array(homeShopSectionItemSchema).max(12).optional().default([]),
  homepageTestimonials: z.array(homeTestimonialItemSchema).max(12).optional().default([]),
});

export const adminEmailSchema = z.object({
  to: z.string().trim().min(3).max(1000),
  subject: z.string().trim().min(1).max(180),
  message: z.string().trim().min(1).max(10000),
  replyTo: z.string().email().optional().or(z.literal('')),
});
