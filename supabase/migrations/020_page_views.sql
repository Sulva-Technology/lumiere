-- First-party website analytics. One row per page a visitor opens on the public
-- site. No IP addresses or personal details are stored: visitors are counted by a
-- random ID kept in their own browser, and location comes from the hosting
-- provider's city/country lookup.

create table if not exists public.page_views (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  visitor_id text not null,
  session_id text not null,
  path text not null,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device text,
  browser text,
  os text,
  country text,
  region text,
  city text
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);

-- Only the server (service role) reads and writes this table.
alter table public.page_views enable row level security;
