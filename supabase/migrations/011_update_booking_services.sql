update public.booking_services
set active = false
where name ilike '%seamless extensions%' or slug ilike '%seamless-extensions%';

insert into public.booking_services (name, slug, description, duration_minutes, price, active, service_type)
values
  ('Content Day Session', 'content-day-session', 'Up to 2 hours of filming with creator guidance and light direction.', 120, 200.00, true, 'content'),
  ('Brand Photo Sprint', 'brand-photo-sprint', 'A 60-minute studio photo sprint with 15 edited selects.', 60, 150.00, true, 'content'),
  ('Creator Reels Pack', 'creator-reels-pack', 'Three polished short-form reels delivered with basic edits.', 90, 180.00, true, 'content')
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  active = excluded.active,
  service_type = excluded.service_type;
