-- Limited-time specials on a booking service, e.g. "October Soft Glam" at a
-- discounted price. The special price applies only when the appointment date
-- (Arizona time) falls between special_starts_on and special_ends_on, inclusive.
-- Appointments outside that window are charged the regular price.

alter table public.booking_services
  add column if not exists special_price numeric(10,2),
  add column if not exists special_label text,
  add column if not exists special_starts_on date,
  add column if not exists special_ends_on date;

alter table public.booking_services
  drop constraint if exists booking_services_special_valid;

alter table public.booking_services
  add constraint booking_services_special_valid check (
    special_price is null
    or (
      special_price >= 0
      and special_starts_on is not null
      and special_ends_on is not null
      and special_ends_on >= special_starts_on
    )
  );
