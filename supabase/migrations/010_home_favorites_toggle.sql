alter table public.store_settings
  add column if not exists home_favorites_enabled boolean not null default true;

update public.store_settings
set home_favorites_enabled = true
where home_favorites_enabled is null;
