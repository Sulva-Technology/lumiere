update public.booking_services
set
  name = 'Soft Glam',
  slug = 'soft-glam',
  description = 'A natural, radiant look that enhances your features while keeping your skin looking like skin. Perfect for everyday glam, events, or photos. Travel Fee: A $20 travel fee applies for locations beyond a 6-mile radius.',
  duration_minutes = 90,
  price = 120.00,
  active = true,
  service_type = 'makeup'
where slug = 'soft-glam' or lower(name) = 'soft glam';

insert into public.booking_services (name, slug, description, duration_minutes, price, active, service_type)
select
  'Soft Glam',
  'soft-glam',
  'A natural, radiant look that enhances your features while keeping your skin looking like skin. Perfect for everyday glam, events, or photos. Travel Fee: A $20 travel fee applies for locations beyond a 6-mile radius.',
  90,
  120.00,
  true,
  'makeup'
where not exists (
  select 1
  from public.booking_services
  where slug = 'soft-glam'
);

update public.booking_services
set
  name = 'Full Glam',
  slug = 'full-glam',
  description = 'A more defined, elevated look with fuller coverage, detailed eye makeup, and a flawless finish. Ideal for special occasions and photoshoots. Travel Fee: A $20 travel fee applies for locations beyond an 8-mile radius.',
  duration_minutes = 120,
  price = 170.00,
  active = true,
  service_type = 'makeup'
where slug = 'full-glam' or lower(name) = 'full glam';

insert into public.booking_services (name, slug, description, duration_minutes, price, active, service_type)
select
  'Full Glam',
  'full-glam',
  'A more defined, elevated look with fuller coverage, detailed eye makeup, and a flawless finish. Ideal for special occasions and photoshoots. Travel Fee: A $20 travel fee applies for locations beyond an 8-mile radius.',
  120,
  170.00,
  true,
  'makeup'
where not exists (
  select 1
  from public.booking_services
  where slug = 'full-glam'
);

insert into public.booking_services (name, slug, description, duration_minutes, price, active, service_type)
values
  (
    'Social Media Video Content (30 Minutes)',
    'social-media-video-content-30-minutes',
    'Perfect for capturing quick, meaningful moments like birthdays, girls'' dinners, and family content. Deliverables: 2 edited videos (1 to 2 minutes each), raw video footage included, up to 2 revision rounds. Travel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.',
    30,
    70.00,
    true,
    'content'
  ),
  (
    'Video Content Session (1 Hour)',
    'video-content-session-1-hour',
    'Ideal for event coverage and personal branding content with more depth and variety. Deliverables: 3 edited videos (1 to 2 minutes each), raw video footage included, up to 2 revision rounds. Travel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.',
    60,
    150.00,
    true,
    'content'
  ),
  (
    'Premium Video Content Session (2 Hours)',
    'premium-video-content-session-2-hours',
    'Best for brands, events, and creators who need a higher volume of content from one session. Deliverables: 6 edited videos (1 to 2 minutes each), raw video footage included, up to 4 revision rounds. Travel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.',
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

update public.booking_services
set active = false
where service_type = 'makeup'
  and slug not in ('soft-glam', 'full-glam');

update public.booking_services
set active = false
where service_type = 'content'
  and slug not in (
    'social-media-video-content-30-minutes',
    'video-content-session-1-hour',
    'premium-video-content-session-2-hours'
  );
