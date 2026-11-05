-- Inclusive appointment dates in America/Phoenix. Customers may reserve before
-- the start date, but only appointment slots inside this range are offered.
alter table public.booking_services
  add column if not exists available_from date,
  add column if not exists available_until date;

alter table public.booking_services
  drop constraint if exists booking_services_window_valid;

alter table public.booking_services
  add constraint booking_services_window_valid check (
    (available_from is null and available_until is null)
    or (available_from is not null and available_until is not null
        and available_until >= available_from)
  );
