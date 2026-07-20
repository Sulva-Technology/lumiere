alter table public.store_settings
  add column if not exists travel_fee numeric(10, 2) not null default 20;

update public.store_settings
set travel_fee = 20
where travel_fee is null;
