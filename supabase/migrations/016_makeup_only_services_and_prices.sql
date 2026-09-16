-- Keep the public booking catalog limited to approved makeup services.
-- Existing content-service records are retained for historical reporting, but retired.

UPDATE public.booking_services
SET active = false
WHERE service_type = 'content';

UPDATE public.booking_services
SET
  name = 'Soft Glam',
  description = 'A natural, radiant look that enhances your features while keeping your skin looking like skin. Perfect for everyday glam, events, and photos.',
  duration_minutes = 90,
  price = 100.00,
  active = true,
  service_type = 'makeup'
WHERE slug = 'soft-glam';

UPDATE public.booking_services
SET
  name = 'Full Glam',
  description = 'A more defined, elevated look with fuller coverage, detailed eye makeup, and a flawless finish. Ideal for special occasions and photoshoots.',
  duration_minutes = 120,
  price = 150.00,
  active = true,
  service_type = 'makeup'
WHERE slug = 'full-glam';

-- Ensure both approved services exist in a fresh environment.
INSERT INTO public.booking_services (name, slug, description, duration_minutes, price, active, service_type)
VALUES
  ('Soft Glam', 'soft-glam', 'A natural, radiant look that enhances your features while keeping your skin looking like skin. Perfect for everyday glam, events, and photos.', 90, 100.00, true, 'makeup'),
  ('Full Glam', 'full-glam', 'A more defined, elevated look with fuller coverage, detailed eye makeup, and a flawless finish. Ideal for special occasions and photoshoots.', 120, 150.00, true, 'makeup')
ON CONFLICT (slug) DO NOTHING;
