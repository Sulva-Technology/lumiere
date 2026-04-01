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

update public.store_settings
set
  store_name = 'Lumiere Beauty',
  announcement_bar = 'Shop premium hair, makeup, and beauty essentials with complimentary shipping on orders over $400.';
