-- Availability becomes one general weekly schedule instead of one rule per service.
-- A rule with service_id = null applies to every active service, so a new service
-- added later is picked up automatically without the artist setting anything again.

alter table public.booking_availability_rules
  alter column service_id drop not null;

-- A partial unique index covers the general rules; the original index treats NULLs
-- as distinct, so it cannot enforce uniqueness for them.
create unique index if not exists idx_booking_availability_rules_general_unique
  on public.booking_availability_rules(stylist_id, weekday, start_time, end_time)
  where service_id is null;

-- Collapse the existing per-service rules into one general rule per window.
insert into public.booking_availability_rules (stylist_id, service_id, weekday, start_time, end_time, active)
select distinct on (stylist_id, weekday, start_time, end_time)
  stylist_id, null, weekday, start_time, end_time, true
from public.booking_availability_rules
where active
order by stylist_id, weekday, start_time, end_time, created_at
on conflict do nothing;

delete from public.booking_availability_rules where service_id is not null;

-- Per-date changes: a whole day off, or different hours for that one date.
-- These must be stored as data because the weekly sync regenerates slots; without a
-- row here a per-date change would be overwritten on the next admin page load.
create table if not exists public.booking_availability_day_overrides (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid not null references public.stylists(id) on delete cascade,
  day date not null,
  is_off boolean not null default true,
  start_time time,
  end_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_availability_day_overrides_unique unique (stylist_id, day),
  constraint booking_availability_day_overrides_window_check
    check (is_off or (start_time is not null and end_time is not null and end_time > start_time))
);

create index if not exists idx_booking_availability_day_overrides_day
  on public.booking_availability_day_overrides(stylist_id, day);

drop trigger if exists trg_booking_availability_day_overrides_updated_at on public.booking_availability_day_overrides;
create trigger trg_booking_availability_day_overrides_updated_at before update on public.booking_availability_day_overrides
for each row execute function public.touch_updated_at();
