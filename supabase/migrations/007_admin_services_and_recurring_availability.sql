create table if not exists public.booking_availability_rules (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid not null references public.stylists(id) on delete cascade,
  service_id uuid not null references public.booking_services(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_availability_rules_window_check check (end_time > start_time)
);

create unique index if not exists idx_booking_availability_rules_unique
  on public.booking_availability_rules(stylist_id, service_id, weekday, start_time, end_time);

drop trigger if exists trg_booking_availability_rules_updated_at on public.booking_availability_rules;
create trigger trg_booking_availability_rules_updated_at before update on public.booking_availability_rules
for each row execute function public.touch_updated_at();
