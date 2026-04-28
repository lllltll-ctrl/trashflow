-- 011_crews_and_assignment.sql
-- Adds the dispatcher → crew assignment workflow that the brief implies but
-- the original schema didn't have. Without this, dispatcher could only flip
-- complaint status; now they can route a complaint to a specific brigade
-- (and a trigger auto-promotes status from 'new' → 'assigned' to keep state
-- machine clean).
--
-- UP

create table if not exists public.crews (
    id            uuid primary key default uuid_generate_v4(),
    community_id  uuid not null references public.communities(id) on delete cascade,
    name          text not null,
    phone         text,
    is_active     boolean not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index crews_community_idx
    on public.crews (community_id)
    where is_active;

create trigger crews_set_updated_at
    before update on public.crews
    for each row execute function public.set_updated_at();

alter table public.crews enable row level security;

create policy "crews: read own community"
    on public.crews for select
    using (community_id = public.current_community_id());

create policy "crews: dispatcher write"
    on public.crews for all
    using (
        community_id = public.current_community_id()
        and public.current_role() in ('dispatcher', 'admin')
    )
    with check (
        community_id = public.current_community_id()
        and public.current_role() in ('dispatcher', 'admin')
    );

-- Link complaints to a crew. ON DELETE SET NULL so removing a crew never
-- destroys complaint history.
alter table public.complaints
    add column if not exists assigned_crew_id uuid references public.crews(id) on delete set null;

create index if not exists complaints_assigned_crew_idx
    on public.complaints (assigned_crew_id)
    where assigned_crew_id is not null;

-- Auto-promote: when dispatcher picks a crew on a 'new' complaint, the status
-- jumps to 'assigned' so the state machine stays internally consistent without
-- requiring two writes from the client.
create or replace function public.complaint_auto_assign()
returns trigger
language plpgsql
as $$
begin
    if new.assigned_crew_id is not null
       and new.assigned_crew_id is distinct from old.assigned_crew_id
       and new.status = 'new' then
        new.status := 'assigned';
    end if;
    return new;
end;
$$;

create trigger complaints_auto_assign
    before update on public.complaints
    for each row execute function public.complaint_auto_assign();

-- Seed crews for the Pryluky pilot. Phone numbers are placeholders — replace
-- with real КП «Прилуки-Чисто» dispatcher numbers on Day 1.
insert into public.crews (community_id, name, phone) values
    ('00000000-0000-0000-0000-000000000001', 'Бригада №1 — Центр і Дружби',     '+380 (4637) 5-12-34'),
    ('00000000-0000-0000-0000-000000000001', 'Бригада №2 — Промзона і околиці', '+380 (4637) 5-12-35'),
    ('00000000-0000-0000-0000-000000000001', 'Підрядна — небезпечні відходи',   '+380 (4637) 5-12-36');

/*
-- DOWN
drop trigger if exists complaints_auto_assign on public.complaints;
drop function if exists public.complaint_auto_assign();
drop index  if exists complaints_assigned_crew_idx;
alter table public.complaints drop column if exists assigned_crew_id;
drop policy if exists "crews: dispatcher write" on public.crews;
drop policy if exists "crews: read own community" on public.crews;
drop trigger if exists crews_set_updated_at on public.crews;
drop index  if exists crews_community_idx;
drop table  if exists public.crews;
*/
