-- Clear existing categories that are not makeup
delete from public.product_categories where slug not in ('makeup-essentials');

-- Update or insert the Makeup category
insert into public.product_categories (name, slug, description)
values ('Makeup Artistry', 'makeup-artistry', 'Professional makeup services for events, editorials, and personal glam.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.product_categories (name, slug, description)
values ('Content Studio', 'content-studio', 'Digital content creation services including reels, shorts, and brand photography.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

-- Ensure store settings are updated
update public.store_settings
set
  store_name = 'theDMAshop Makeup & Content Studio',
  announcement_bar = 'Focusing on Makeup Artistry and Premium Content Creation services.';

-- Add the single creator/artist
insert into public.stylists (name, slug, bio, specialties, rating, available, base_price)
values ('theDMAshop Lead Artist', 'theDMAshop-artist', 'Expert makeup artist and content creator specializing in high-end editorial looks and dynamic digital storytelling.', '{Makeup, Editorial, Content Creation}', 5.0, true, 75.00)
on conflict (slug) do nothing;


-- Add Services
insert into public.booking_services (name, slug, description, duration_minutes, price, active)
values 
  ('Bridal Glam', 'bridal-glam', 'Full bridal makeup experience including consultation and trial.', 120, 250.00, true),
  ('Editorial Makeup', 'editorial-makeup', 'High-fashion artistry for photoshoots and events.', 90, 150.00, true),
  ('Social Media Reel (15s)', 'content-reel-15', 'Professional 15-second vertical video reel for Instagram or TikTok.', 45, 85.00, true),
  ('Full Content Package', 'content-package-full', '4 hours of dedicated content creation including makeup and editing.', 240, 500.00, true)
on conflict (slug) do update set name = excluded.name, price = excluded.price, duration_minutes = excluded.duration_minutes;
