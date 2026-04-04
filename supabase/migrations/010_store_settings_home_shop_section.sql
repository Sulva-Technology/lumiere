alter table public.store_settings
add column if not exists home_shop_section_title text,
add column if not exists home_shop_section_link_label text,
add column if not exists home_shop_section_link_href text,
add column if not exists home_shop_section_items jsonb not null default '[]'::jsonb;
