alter table public.booking_services
  add column if not exists service_type text;

update public.booking_services
set service_type = case
  when slug ilike '%content%' or name ilike '%content%' then 'content'
  else 'makeup'
end
where service_type is null;

alter table public.booking_services
  alter column service_type set default 'makeup';

alter table public.booking_services
  alter column service_type set not null;

alter table public.booking_services
  drop constraint if exists booking_services_service_type_check;

alter table public.booking_services
  add constraint booking_services_service_type_check
  check (service_type in ('makeup', 'content'));
