create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  alt text not null,
  category text,
  image_url text not null,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gallery_items_public on public.gallery_items(active, sort_order, created_at);

drop trigger if exists trg_gallery_items_updated_at on public.gallery_items;
create trigger trg_gallery_items_updated_at before update on public.gallery_items
for each row execute function public.touch_updated_at();

alter table public.store_settings
  add column if not exists home_section_visibility jsonb not null default '{"hero": true, "gallery": true, "policies": true, "faq": true}'::jsonb;

insert into public.gallery_items (title, alt, category, image_url, sort_order)
select seed.title, seed.alt, seed.category, seed.image_url, seed.sort_order
from (
  values
    ('Soft Glam', 'Soft glam makeup look by Itz Lola Beauty', 'Soft Glam', '/images/makeup.jpeg', 1),
    ('Luxury Glam', 'Luxury makeup portrait by Itz Lola Beauty', 'Full Glam', '/images/home.jpeg', 2),
    ('Artist Detail', 'Makeup artist Lola of Itz Lola Beauty', 'Behind the Scenes', '/images/founder.jpeg', 3)
) as seed(title, alt, category, image_url, sort_order)
where not exists (select 1 from public.gallery_items);
