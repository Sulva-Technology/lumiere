-- Refresh Booking Services with EXACT user-provided copy and pricing

-- 1. Deactivate all current services
update public.booking_services set active = false;

-- 2. Upsert Makeup Services
insert into public.booking_services (name, slug, description, duration_minutes, price, active, service_type)
values
  (
    'Soft Glam',
    'soft-glam',
    'A natural, radiant look that enhances your features while keeping your skin looking like skin. Perfect for everyday glam, events, or photos.\n\nTravel Fee: A $20 travel fee applies for locations beyond a 6-mile radius.',
    90,
    120.00,
    true,
    'makeup'
  ),
  (
    'Full Glam',
    'full-glam',
    'A more defined, elevated look with fuller coverage, detailed eye makeup, and a flawless finish. Ideal for special occasions and photoshoots.\n\nTravel Fee: A $20 travel fee applies for locations beyond a 8-mile radius.',
    120,
    170.00,
    true,
    'makeup'
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  active = excluded.active,
  service_type = excluded.service_type;

-- 3. Upsert Content Creation Services
insert into public.booking_services (name, slug, description, duration_minutes, price, active, service_type)
values
  (
    'Social Media Video Content (30 Minutes)',
    'social-media-video-content-30-minutes',
    'Perfect for capturing quick, meaningful moments like birthdays, girls'' dinners, and family content.\n\nDeliverables:\n• 2 edited videos (1–2 minutes each)\n• Raw video footage included\n• Up to 2 revision rounds\n\nTravel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.',
    30,
    70.00,
    true,
    'content'
  ),
  (
    'Video Content Session (1 Hour)',
    'video-content-session-1-hour',
    'Ideal for event coverage and personal branding content with more depth and variety.\n\nDeliverables:\n• 3 edited videos (1–2 minutes each)\n• Raw video footage included\n• Up to 2 revision rounds\n\nTravel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.',
    60,
    150.00,
    true,
    'content'
  ),
  (
    'Premium Video Content Session (2 Hours)',
    'premium-video-content-session-2-hours',
    'Best for brands, events, and creators who need a higher volume of content from one session.\n\nDeliverables:\n• 6 edited videos (1–2 minutes each)\n• Raw video footage included\n• Up to 4 revision rounds\n\nTravel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.',
    120,
    250.00,
    true,
    'content'
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  active = excluded.active,
  service_type = excluded.service_type;

-- 4. Keep other potential services (Bridal, etc.) as INACTIVE for now since they weren't explicitly detailed with copy
-- They are already deactivated by step 1.
