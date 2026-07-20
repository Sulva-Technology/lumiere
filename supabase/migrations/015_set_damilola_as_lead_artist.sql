-- Itz Lola Beauty currently books one lead artist.
update public.stylists
set
  name = 'Damilola',
  slug = 'damilola',
  bio = 'Damilola is the lead makeup artist and creative behind Itz Lola Beauty.',
  updated_at = now()
where id = (
  select id
  from public.stylists
  where available = true
  order by created_at
  limit 1
);
