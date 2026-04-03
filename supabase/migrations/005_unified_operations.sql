create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  object_path text not null unique,
  public_url text not null,
  alt text,
  owner_type text not null check (owner_type in ('product', 'product_image', 'variant', 'general')),
  owner_id uuid,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'archived', 'deleted', 'orphaned')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_reservations (
  id uuid primary key default gen_random_uuid(),
  availability_id uuid not null references public.booking_availability(id) on delete cascade,
  stylist_id uuid not null references public.stylists(id) on delete restrict,
  service_id uuid not null references public.booking_services(id) on delete restrict,
  full_name text not null,
  email text not null,
  phone text not null,
  notes text,
  reservation_status text not null default 'pending_payment' check (reservation_status in ('pending_payment', 'confirmed', 'cancelled', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  reservation_id uuid references public.booking_reservations(id) on delete cascade,
  provider text not null default 'hosted_checkout',
  status text not null default 'created' check (status in ('created', 'pending', 'authorized', 'paid', 'failed', 'cancelled', 'expired', 'refunded')),
  amount numeric(10,2) not null,
  currency text not null default 'usd',
  method_family text not null default 'hosted_checkout',
  provider_reference text,
  session_reference text unique,
  idempotency_key text unique,
  failure_reason text,
  reconciliation_state text,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  paid_at timestamptz,
  failed_at timestamptz,
  cancelled_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_target_check check (
    ((order_id is not null)::int + (booking_id is not null)::int + (reservation_id is not null)::int) >= 1
  )
);

alter table public.product_images add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null;
alter table public.products add column if not exists lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'archived', 'deleted'));
alter table public.orders add column if not exists checkout_expires_at timestamptz;
alter table public.bookings add column if not exists payment_status text not null default 'pending_payment';
alter table public.bookings alter column status set default 'pending_payment';

create index if not exists idx_media_assets_owner on public.media_assets(owner_type, owner_id);
create index if not exists idx_booking_reservations_availability on public.booking_reservations(availability_id);
create index if not exists idx_booking_reservations_status_expires on public.booking_reservations(reservation_status, expires_at);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_reservation_id on public.payments(reservation_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_provider_reference on public.payments(provider_reference);

drop index if exists idx_booking_reservations_active_slot;
create unique index if not exists idx_booking_reservations_active_slot
  on public.booking_reservations(availability_id)
  where reservation_status in ('pending_payment', 'confirmed');

update public.orders
set payment_status = case
  when payment_status = 'pending' then 'pending_payment'
  when payment_status = 'failed' then 'payment_failed'
  else payment_status
end
where payment_status in ('pending', 'failed');

update public.bookings
set payment_status = case
  when status in ('confirmed', 'completed') then 'paid'
  when status = 'cancelled' then 'cancelled'
  else payment_status
end;

insert into public.payments (
  order_id,
  provider,
  status,
  amount,
  currency,
  method_family,
  provider_reference,
  session_reference,
  paid_at,
  cancelled_at,
  failed_at,
  metadata
)
select
  id,
  'hosted_checkout',
  case
    when payment_status = 'paid' then 'paid'
    when payment_status = 'cancelled' then 'cancelled'
    when payment_status = 'payment_failed' then 'failed'
    else 'pending'
  end,
  total,
  currency,
  'hosted_checkout',
  coalesce(stripe_payment_intent_id, stripe_checkout_session_id),
  stripe_checkout_session_id,
  case when payment_status = 'paid' then updated_at else null end,
  case when payment_status = 'cancelled' then updated_at else null end,
  case when payment_status = 'payment_failed' then updated_at else null end,
  jsonb_build_object('migrated', true)
from public.orders
where not exists (
  select 1 from public.payments where payments.order_id = orders.id
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_media_assets_updated_at on public.media_assets;
create trigger trg_media_assets_updated_at before update on public.media_assets
for each row execute function public.touch_updated_at();

drop trigger if exists trg_booking_reservations_updated_at on public.booking_reservations;
create trigger trg_booking_reservations_updated_at before update on public.booking_reservations
for each row execute function public.touch_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at before update on public.payments
for each row execute function public.touch_updated_at();
