alter table public.stylists
add column if not exists email text;

create index if not exists idx_stylists_email on public.stylists(email);
