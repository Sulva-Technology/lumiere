create table if not exists public.rate_limit_windows (
  key text not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (key, window_start)
);

create or replace function public.check_rate_limit(
  p_key text,
  p_max_requests integer,
  p_window_ms bigint
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_window_seconds numeric := greatest(p_window_ms, 1000)::numeric / 1000;
  v_bucket_epoch bigint;
  v_window_start timestamptz;
  v_request_count integer;
begin
  delete from public.rate_limit_windows
  where updated_at < v_now - interval '2 days';

  v_bucket_epoch := floor(extract(epoch from v_now) / v_window_seconds) * v_window_seconds;
  v_window_start := to_timestamp(v_bucket_epoch);

  insert into public.rate_limit_windows as rl (key, window_start, request_count, updated_at)
  values (p_key, v_window_start, 1, v_now)
  on conflict (key, window_start)
  do update set
    request_count = rl.request_count + 1,
    updated_at = v_now
  returning rl.request_count into v_request_count;

  allowed := v_request_count <= p_max_requests;
  remaining := greatest(p_max_requests - v_request_count, 0);
  reset_at := v_window_start + make_interval(secs => ceil(v_window_seconds)::integer);
  return next;
end;
$$;
