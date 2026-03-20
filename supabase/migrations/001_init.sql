create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  email text unique,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  role text not null check (role in ('admin', 'manager', 'staff')),
  created_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category_id uuid references public.product_categories(id) on delete set null,
  featured boolean not null default false,
  active boolean not null default true,
  rating numeric(3,2) not null default 5,
  review_count integer not null default 0,
  default_image_url text,
  details text[] not null default '{}',
  care_instructions text[] not null default '{}',
  shipping_notes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  title text not null,
  shade text,
  length text,
  size text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  stock_quantity integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  email text not null unique,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  type text not null check (type in ('shipping', 'billing')),
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  email text not null,
  subtotal numeric(10,2) not null,
  shipping_total numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  currency text not null default 'usd',
  payment_status text not null default 'pending',
  fulfillment_status text not null default 'unfulfilled',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  shipping_address_id uuid references public.addresses(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_title text not null,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  duration_minutes integer not null,
  price numeric(10,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stylists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  bio text,
  specialties text[] not null default '{}',
  rating numeric(3,2) not null default 5,
  avatar_url text,
  available boolean not null default true,
  base_price numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_availability (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid not null references public.stylists(id) on delete cascade,
  service_id uuid references public.booking_services(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  stylist_id uuid not null references public.stylists(id) on delete restrict,
  service_id uuid not null references public.booking_services(id) on delete restrict,
  availability_id uuid unique references public.booking_availability(id) on delete restrict,
  full_name text not null,
  email text not null,
  phone text not null,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null,
  support_email text not null,
  support_phone text,
  booking_contact_email text,
  announcement_bar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_active on public.products(active);
create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_product_variants_active on public.product_variants(active);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_bookings_starts_at on public.bookings(starts_at desc);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_booking_availability_starts_at on public.booking_availability(starts_at);
create index if not exists idx_customers_email on public.customers(email);

alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.booking_services enable row level security;
alter table public.stylists enable row level security;
alter table public.booking_availability enable row level security;

drop policy if exists "public read product categories" on public.product_categories;
create policy "public read product categories" on public.product_categories for select using (true);

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (active = true);

drop policy if exists "public read active variants" on public.product_variants;
create policy "public read active variants" on public.product_variants for select using (active = true);

drop policy if exists "public read product images" on public.product_images;
create policy "public read product images" on public.product_images for select using (true);

drop policy if exists "public read booking services" on public.booking_services;
create policy "public read booking services" on public.booking_services for select using (active = true);

drop policy if exists "public read stylists" on public.stylists;
create policy "public read stylists" on public.stylists for select using (true);

drop policy if exists "public read booking availability" on public.booking_availability;
create policy "public read booking availability" on public.booking_availability for select using (is_available = true);
