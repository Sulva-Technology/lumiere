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

update public.store_settings
set
  store_name = 'Dee''s luxury',
  support_email = 'support@deesluxury.com',
  support_phone = '+1 (555) 123-4567',
  booking_contact_email = 'bookings@deesluxury.com',
  announcement_bar = 'Shop luxury hair and makeup essentials with a polished, elevated experience.';

insert into public.store_settings (store_name, support_email, support_phone, booking_contact_email, announcement_bar)
select 'Dee''s luxury', 'support@deesluxury.com', '+1 (555) 123-4567', 'bookings@deesluxury.com', 'Shop luxury hair and makeup essentials with a polished, elevated experience.'
where not exists (select 1 from public.store_settings);
