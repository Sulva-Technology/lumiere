insert into public.product_categories (name, slug, description)
values
  ('Wigs & Extensions', 'wigs-extensions', 'Premium raw hair bundles, closures, and frontals.'),
  ('Natural Care', 'natural-care', 'Hydration, styling, and repair essentials.'),
  ('Tools', 'tools', 'Professional styling tools and accessories.'),
  ('Color', 'color', 'Glosses, toners, and treatment color products.')
on conflict (slug) do nothing;

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
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, title, shade, length, price, compare_at_price, stock_quantity, active)
select p.id, 'LUM-RCW-18-NB', '18in / Natural Black', 'Natural Black', '18"', 145, 165, 18, true
from public.products p
where p.slug = 'raw-cambodian-wavy-bundle'
on conflict (sku) do nothing;

insert into public.product_variants (product_id, sku, title, shade, length, price, compare_at_price, stock_quantity, active)
select p.id, 'LUM-RCW-22-NB', '22in / Natural Black', 'Natural Black', '22"', 185, 210, 10, true
from public.products p
where p.slug = 'raw-cambodian-wavy-bundle'
on conflict (sku) do nothing;

insert into public.product_images (product_id, url, alt, sort_order)
select p.id, 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800&h=1000', 'Raw Cambodian Wavy Bundle', 0
from public.products p
where p.slug = 'raw-cambodian-wavy-bundle'
on conflict do nothing;

insert into public.products (slug, name, description, category_id, featured, active, rating, review_count, default_image_url)
select 'silk-press-heat-protectant', 'Silk Press Heat Protectant', 'Weightless thermal protection that shields strands and boosts shine.', c.id, false, true, 4.8, 76, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=800&h=1000'
from public.product_categories c
where c.slug = 'natural-care'
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, title, size, price, stock_quantity, active)
select p.id, 'LUM-SHP-8OZ', '8 oz', '8 oz', 38, 42, true
from public.products p
where p.slug = 'silk-press-heat-protectant'
on conflict (sku) do nothing;

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

insert into public.store_settings (store_name, support_email, support_phone, booking_contact_email, announcement_bar)
values ('Lumiere', 'support@lumiere.com', '+1 (555) 123-4567', 'bookings@lumiere.com', 'Complimentary shipping on orders over $400.')
on conflict do nothing;
