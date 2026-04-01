insert into public.product_categories (name, slug, description)
values
  ('Hair Extensions', 'wigs-extensions', 'Premium raw hair bundles, closures, wigs, and extension essentials.'),
  ('Hair Care', 'natural-care', 'Hydration, styling, and repair essentials for healthy hair.'),
  ('Beauty Tools', 'beauty-tools', 'Professional styling tools, brushes, and vanity accessories.'),
  ('Makeup Essentials', 'makeup-essentials', 'Complexion, lip, and glow staples for polished everyday beauty.')
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description;

insert into public.products (slug, name, description, category_id, featured, active, rating, review_count, default_image_url, details, care_instructions, shipping_notes)
select
  'raw-cambodian-wavy-bundle',
  'Raw Cambodian Wavy Bundle',
  'Unprocessed, ethically sourced raw Cambodian hair with soft waves and long-lasting volume.',
  c.id,
  true,
  true,
  4.9,
  128,
  'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800&h=1000',
  array['100% raw Cambodian hair', 'Can be colored and heat styled', 'Double wefted to reduce shedding'],
  array['Wash with sulfate-free shampoo', 'Deep condition bi-weekly', 'Use heat protectant before styling'],
  array['Free shipping on orders over $400', 'Returns within 14 days on unaltered bundles']
from public.product_categories c
where c.slug = 'wigs-extensions'
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  category_id = excluded.category_id,
  featured = excluded.featured,
  active = excluded.active,
  rating = excluded.rating,
  review_count = excluded.review_count,
  default_image_url = excluded.default_image_url,
  details = excluded.details,
  care_instructions = excluded.care_instructions,
  shipping_notes = excluded.shipping_notes;

insert into public.product_variants (product_id, sku, title, shade, length, price, compare_at_price, stock_quantity, active)
select p.id, 'LUM-RCW-18-NB', '18in / Natural Black', 'Natural Black', '18"', 145, 165, 18, true
from public.products p
where p.slug = 'raw-cambodian-wavy-bundle'
on conflict (sku) do update
set
  title = excluded.title,
  shade = excluded.shade,
  length = excluded.length,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  stock_quantity = excluded.stock_quantity,
  active = excluded.active;

insert into public.product_variants (product_id, sku, title, shade, length, price, compare_at_price, stock_quantity, active)
select p.id, 'LUM-RCW-22-NB', '22in / Natural Black', 'Natural Black', '22"', 185, 210, 10, true
from public.products p
where p.slug = 'raw-cambodian-wavy-bundle'
on conflict (sku) do update
set
  title = excluded.title,
  shade = excluded.shade,
  length = excluded.length,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  stock_quantity = excluded.stock_quantity,
  active = excluded.active;

insert into public.product_images (product_id, url, alt, sort_order)
select p.id, 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800&h=1000', 'Raw Cambodian Wavy Bundle', 0
from public.products p
where p.slug = 'raw-cambodian-wavy-bundle'
on conflict do nothing;

insert into public.products (slug, name, description, category_id, featured, active, rating, review_count, default_image_url, details, care_instructions, shipping_notes)
select
  'silk-press-heat-protectant',
  'Silk Press Heat Protectant',
  'Weightless thermal protection that shields strands and boosts shine.',
  c.id,
  false,
  true,
  4.8,
  76,
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=800&h=1000',
  array['Heat protection up to 450Â°F', 'Adds shine without heaviness', 'Works well for silk presses and blowouts'],
  array['Apply lightly to damp or dry hair', 'Focus on mid-lengths and ends', 'Layer before heat styling'],
  array['Ships in 1-2 business days', 'Final sale if opened']
from public.product_categories c
where c.slug = 'natural-care'
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  category_id = excluded.category_id,
  featured = excluded.featured,
  active = excluded.active,
  rating = excluded.rating,
  review_count = excluded.review_count,
  default_image_url = excluded.default_image_url,
  details = excluded.details,
  care_instructions = excluded.care_instructions,
  shipping_notes = excluded.shipping_notes;

insert into public.product_variants (product_id, sku, title, size, price, stock_quantity, active)
select p.id, 'LUM-SHP-8OZ', '8 oz', '8 oz', 38, 42, true
from public.products p
where p.slug = 'silk-press-heat-protectant'
on conflict (sku) do update
set
  title = excluded.title,
  size = excluded.size,
  price = excluded.price,
  stock_quantity = excluded.stock_quantity,
  active = excluded.active;

insert into public.products (slug, name, description, category_id, featured, active, rating, review_count, default_image_url, details, care_instructions, shipping_notes)
select
  'radiant-skin-foundation',
  'Radiant Skin Foundation',
  'A breathable complexion formula that smooths, brightens, and wears beautifully from day to night.',
  c.id,
  true,
  true,
  4.9,
  91,
  'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800&h=1000',
  array['Natural radiant finish', 'Medium, buildable coverage', 'Comfortable long-wear formula'],
  array['Apply with brush, sponge, or fingertips', 'Build coverage in thin layers', 'Pair with primer for extended wear'],
  array['Ships in 1-2 business days', 'Shade-matched products are exchange eligible within 14 days']
from public.product_categories c
where c.slug = 'makeup-essentials'
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  category_id = excluded.category_id,
  featured = excluded.featured,
  active = excluded.active,
  rating = excluded.rating,
  review_count = excluded.review_count,
  default_image_url = excluded.default_image_url,
  details = excluded.details,
  care_instructions = excluded.care_instructions,
  shipping_notes = excluded.shipping_notes;

insert into public.product_variants (product_id, sku, title, shade, size, price, compare_at_price, stock_quantity, active)
select p.id, 'LUM-RSF-120', 'Shade 120 / 30 ml', '120', '30 ml', 46, 52, 24, true
from public.products p
where p.slug = 'radiant-skin-foundation'
on conflict (sku) do update
set
  title = excluded.title,
  shade = excluded.shade,
  size = excluded.size,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  stock_quantity = excluded.stock_quantity,
  active = excluded.active;

insert into public.product_variants (product_id, sku, title, shade, size, price, compare_at_price, stock_quantity, active)
select p.id, 'LUM-RSF-340', 'Shade 340 / 30 ml', '340', '30 ml', 46, 52, 19, true
from public.products p
where p.slug = 'radiant-skin-foundation'
on conflict (sku) do update
set
  title = excluded.title,
  shade = excluded.shade,
  size = excluded.size,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  stock_quantity = excluded.stock_quantity,
  active = excluded.active;

insert into public.product_images (product_id, url, alt, sort_order)
select p.id, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800&h=1000', 'Radiant Skin Foundation', 0
from public.products p
where p.slug = 'radiant-skin-foundation'
on conflict do nothing;

insert into public.products (slug, name, description, category_id, featured, active, rating, review_count, default_image_url, details, care_instructions, shipping_notes)
select
  'signature-brush-set',
  'Signature Brush Set',
  'A curated face-and-eye brush kit designed for seamless blending, buffing, and soft definition.',
  c.id,
  false,
  true,
  4.7,
  54,
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800&h=1000',
  array['Includes 6 everyday brushes', 'Soft synthetic bristles', 'Travel-ready brush roll included'],
  array['Wash weekly with gentle brush soap', 'Lay flat to dry', 'Store in a dry kit or vanity case'],
  array['Ships in 1-2 business days', 'Returns accepted within 14 days if unused']
from public.product_categories c
where c.slug = 'beauty-tools'
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  category_id = excluded.category_id,
  featured = excluded.featured,
  active = excluded.active,
  rating = excluded.rating,
  review_count = excluded.review_count,
  default_image_url = excluded.default_image_url,
  details = excluded.details,
  care_instructions = excluded.care_instructions,
  shipping_notes = excluded.shipping_notes;

insert into public.product_variants (product_id, sku, title, size, price, stock_quantity, active)
select p.id, 'LUM-SBS-SET', '6-piece set', '6-piece set', 58, 27, true
from public.products p
where p.slug = 'signature-brush-set'
on conflict (sku) do update
set
  title = excluded.title,
  size = excluded.size,
  price = excluded.price,
  stock_quantity = excluded.stock_quantity,
  active = excluded.active;

insert into public.booking_services (slug, name, description, duration_minutes, price, active)
values
  ('luxury-silk-press', 'Luxury Silk Press', 'Signature smoothing service with trim and finish.', 90, 150, true),
  ('extensions-install', 'Seamless Extensions Install', 'Luxury install for premium bundles and closures.', 180, 350, true),
  ('bespoke-color-gloss', 'Bespoke Color & Gloss', 'Dimensional glossing and color refinement.', 120, 200, true),
  ('deep-hydration-treatment', 'Deep Hydration Treatment', 'Repair-focused moisture service for dry hair.', 60, 85, true)
on conflict (slug) do nothing;

insert into public.stylists (slug, name, bio, specialties, rating, avatar_url, available, base_price)
values
  ('elena-rostova', 'Elena Rostova', 'Specialist in silk presses and dimensional color with a polished editorial finish.', array['Silk Press', 'Color'], 4.9, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200', true, 150),
  ('sarah-jenkins', 'Sarah Jenkins', 'Natural hair care and braid styling with a healthy-hair-first approach.', array['Natural Care', 'Braids'], 4.8, 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=200&h=200', true, 120),
  ('david-omari', 'David Omari', 'Luxury cuts, glosses, and balayage tailored to texture and tone.', array['Balayage', 'Cut'], 4.9, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200', true, 180)
on conflict (slug) do nothing;

insert into public.booking_availability (stylist_id, service_id, starts_at, ends_at, is_available)
select s.id, bs.id, ts.starts_at, ts.starts_at + make_interval(mins => bs.duration_minutes), true
from public.stylists s
cross join public.booking_services bs
cross join (
  values
    ((now() + interval '1 day')::date + time '09:00'),
    ((now() + interval '1 day')::date + time '11:30'),
    ((now() + interval '2 day')::date + time '14:00'),
    ((now() + interval '3 day')::date + time '16:30')
) as ts(starts_at)
where s.available = true
on conflict do nothing;

update public.store_settings
set
  store_name = 'Dee''s luxury',
  support_email = 'support@deesluxury.com',
  support_phone = '+1 (555) 123-4567',
  booking_contact_email = 'bookings@deesluxury.com',
  announcement_bar = 'Shop premium hair, makeup, and beauty essentials with complimentary shipping on orders over $400.';

insert into public.store_settings (store_name, support_email, support_phone, booking_contact_email, announcement_bar)
select 'Dee''s luxury', 'support@deesluxury.com', '+1 (555) 123-4567', 'bookings@deesluxury.com', 'Shop premium hair, makeup, and beauty essentials with complimentary shipping on orders over $400.'
where not exists (select 1 from public.store_settings);

