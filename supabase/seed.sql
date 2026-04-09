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
  announcement_bar = 'Shop luxury hair and makeup essentials with a polished, elevated experience.',
  home_shop_section_title = 'Shop',
  home_shop_section_link_label = 'Shop Collection',
  home_shop_section_link_href = '/shop',
  home_shop_section_items = '[
    {"title":"Beauty Led by Vision","description":"Every product and appointment is curated to help clients feel confident, seen, and ready for the moment in front of them."},
    {"title":"Founder Guided Experience","description":"Move from booking to confirmation through a refined studio flow shaped by the creative direction behind itzlolabeauty."}
  ]'::jsonb;

insert into public.store_settings (store_name, support_email, support_phone, booking_contact_email, announcement_bar, home_shop_section_title, home_shop_section_link_label, home_shop_section_link_href, home_shop_section_items)
select 'Dee''s luxury', 'support@deesluxury.com', '+1 (555) 123-4567', 'bookings@deesluxury.com', 'Shop luxury hair and makeup essentials with a polished, elevated experience.', 'Shop', 'Shop Collection', '/shop', '[
  {"title":"Beauty Led by Vision","description":"Every product and appointment is curated to help clients feel confident, seen, and ready for the moment in front of them."},
  {"title":"Founder Guided Experience","description":"Move from booking to confirmation through a refined studio flow shaped by the creative direction behind itzlolabeauty."}
]'::jsonb
where not exists (select 1 from public.store_settings);
