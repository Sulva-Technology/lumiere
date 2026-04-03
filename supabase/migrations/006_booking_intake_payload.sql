alter table public.booking_reservations
  add column if not exists intake_payload jsonb not null default '{}'::jsonb;

alter table public.bookings
  add column if not exists intake_payload jsonb not null default '{}'::jsonb;
