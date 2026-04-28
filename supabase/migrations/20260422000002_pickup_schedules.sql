-- 010_pickup_schedules.sql
-- Tracks recurring waste-collection rounds for each district: when the truck
-- arrives and what it accepts. Brief explicitly asks for "графіки вивезення" —
-- before this migration we only had `schedule jsonb` on collection_points,
-- which is a point's *opening hours*, not a pickup schedule.
--
-- UP

create table if not exists public.pickup_schedules (
    id            uuid primary key default uuid_generate_v4(),
    community_id  uuid not null references public.communities(id) on delete cascade,
    district      text not null,                                       -- "мікрорайон Дружби"
    day_of_week   int  not null check (day_of_week between 0 and 6),   -- 0 = Sunday
    time_window   text not null,                                        -- "07:00–09:00"
    waste_kinds   text[] not null default array[]::text[],              -- ['plastic','paper']
    notes         text,
    is_active     boolean not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index pickup_schedules_community_idx
    on public.pickup_schedules (community_id, district, day_of_week)
    where is_active;

create trigger pickup_schedules_set_updated_at
    before update on public.pickup_schedules
    for each row execute function public.set_updated_at();

alter table public.pickup_schedules enable row level security;

create policy "pickup_schedules: public read active"
    on public.pickup_schedules for select
    using (is_active);

create policy "pickup_schedules: dispatcher write"
    on public.pickup_schedules for all
    using (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'))
    with check (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'));

-- Realistic seed for Pryluky (verify with КП 'Прилуки-Чисто' before live pilot).
insert into public.pickup_schedules (community_id, district, day_of_week, time_window, waste_kinds, notes) values
    ('00000000-0000-0000-0000-000000000001', 'Центр',                   1, '07:00–09:00', array['plastic','paper'],          'Контейнер біля під''їзду'),
    ('00000000-0000-0000-0000-000000000001', 'Центр',                   4, '07:00–09:00', array['glass','metal','hazardous'], null),
    ('00000000-0000-0000-0000-000000000001', 'мікрорайон Дружби',       2, '07:30–10:00', array['plastic','paper'],          null),
    ('00000000-0000-0000-0000-000000000001', 'мікрорайон Дружби',       5, '07:30–10:00', array['glass','metal'],            null),
    ('00000000-0000-0000-0000-000000000001', 'Промзона',                3, '08:00–11:00', array['metal','plastic','paper'],  'Лише для ФОП за договором'),
    ('00000000-0000-0000-0000-000000000001', 'вул. Соборна / Шевченка', 1, '06:30–08:30', array['plastic','paper'],          null),
    ('00000000-0000-0000-0000-000000000001', 'вул. Соборна / Шевченка', 4, '06:30–08:30', array['glass','metal'],            null),
    ('00000000-0000-0000-0000-000000000001', 'Артема / Садова',         2, '08:30–11:00', array['plastic','paper','glass'],  null),
    ('00000000-0000-0000-0000-000000000001', 'Артема / Садова',         6, '09:00–12:00', array['hazardous'],                'Раз на тиждень');

/*
-- DOWN
drop policy if exists "pickup_schedules: dispatcher write" on public.pickup_schedules;
drop policy if exists "pickup_schedules: public read active" on public.pickup_schedules;
drop trigger if exists pickup_schedules_set_updated_at on public.pickup_schedules;
drop index if exists pickup_schedules_community_idx;
drop table if exists public.pickup_schedules;
*/
