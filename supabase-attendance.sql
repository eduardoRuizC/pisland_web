create table if not exists public.event_attendance (
  event_id text primary key,
  attendees integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.event_attendance enable row level security;

drop policy if exists "Public can read attendance" on public.event_attendance;

create policy "Public can read attendance"
on public.event_attendance
for select
to anon
using (true);

create or replace function public.increment_attendees(p_event_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.event_attendance (event_id, attendees)
  values (p_event_id, 1)
  on conflict (event_id)
  do update set
    attendees = public.event_attendance.attendees + 1,
    updated_at = now()
  returning attendees into new_count;

  return new_count;
end;
$$;

grant execute on function public.increment_attendees(text) to anon;
