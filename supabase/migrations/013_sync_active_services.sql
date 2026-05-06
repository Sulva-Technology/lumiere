-- ============================================================
-- 013 – Sync Active Booking Services (Definitive)
-- Run this in your Supabase SQL Editor.
-- Only these 5 services will exist after this runs.
-- ============================================================

-- 1. Hard-delete any service NOT in the confirmed list
--    (safe if there are no bookings referencing them;
--     if a booking exists the FK will prevent deletion and
--     it will just stay deactivated — no data loss)
DELETE FROM public.booking_services
WHERE slug NOT IN (
  'soft-glam',
  'full-glam',
  'social-media-video-content-30-minutes',
  'video-content-session-1-hour',
  'premium-video-content-session-2-hours'
);

-- 2. Upsert the 5 confirmed services
INSERT INTO public.booking_services (name, slug, description, duration_minutes, price, active, service_type)
VALUES
  (
    'Soft Glam',
    'soft-glam',
    'A natural, radiant look that enhances your features while keeping your skin looking like skin. Perfect for everyday glam, events, or photos.

Travel Fee: A $20 travel fee applies for locations beyond a 6-mile radius.',
    90,
    120.00,
    true,
    'makeup'
  ),
  (
    'Full Glam',
    'full-glam',
    'A more defined, elevated look with fuller coverage, detailed eye makeup, and a flawless finish. Ideal for special occasions and photoshoots.

Travel Fee: A $20 travel fee applies for locations beyond a 8-mile radius.',
    120,
    170.00,
    true,
    'makeup'
  ),
  (
    'Social Media Video Content (30 Minutes)',
    'social-media-video-content-30-minutes',
    'Perfect for capturing quick, meaningful moments like birthdays, girls'' dinners, and family content.

Deliverables:
• 2 edited videos (1–2 minutes each)
• Raw video footage included
• Up to 2 revision rounds

Travel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.',
    30,
    70.00,
    true,
    'content'
  ),
  (
    'Video Content Session (1 Hour)',
    'video-content-session-1-hour',
    'Ideal for event coverage and personal branding content with more depth and variety.

Deliverables:
• 3 edited videos (1–2 minutes each)
• Raw video footage included
• Up to 2 revision rounds

Travel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.',
    60,
    150.00,
    true,
    'content'
  ),
  (
    'Premium Video Content Session (2 Hours)',
    'premium-video-content-session-2-hours',
    'Best for brands, events, and creators who need a higher volume of content from one session.

Deliverables:
• 6 edited videos (1–2 minutes each)
• Raw video footage included
• Up to 4 revision rounds

Travel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.',
    120,
    250.00,
    true,
    'content'
  )
ON CONFLICT (slug) DO UPDATE
SET
  name             = EXCLUDED.name,
  description      = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  price            = EXCLUDED.price,
  active           = EXCLUDED.active,
  service_type     = EXCLUDED.service_type;

-- 3. Confirm result — should show exactly 5 rows, all active = true
SELECT id, name, price, duration_minutes, service_type, active
FROM public.booking_services
ORDER BY service_type, price;
