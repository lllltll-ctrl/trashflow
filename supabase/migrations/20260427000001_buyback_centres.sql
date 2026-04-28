-- 015_buyback_centres.sql
-- Adds the "сортувальний центр" concept: collection points that pay residents
-- for sorted recyclables (skло, метал, ПЕТ). The brief asks for an incentive
-- layer beyond drop-off: residents see which point gives them money back, and
-- for what. We model it as two new columns rather than a separate table —
-- buy-back centres are just collection points with a pricing tag attached.
--
-- UP

alter table public.collection_points
    add column if not exists is_buyback   boolean not null default false,
    add column if not exists buyback_info text;

create index if not exists collection_points_buyback_idx
    on public.collection_points (community_id)
    where is_buyback and is_active;

-- Seed 4 sorting centres around Pryluky centre. Coordinates are realistic
-- (within 1.5 km of the city centre) but the addresses/prices are placeholders
-- until the КП «Прилуки-Чисто» dispatcher confirms the live partners.
insert into public.collection_points
    (community_id, name, location, address, accepts, is_buyback, buyback_info)
values
    (
        '00000000-0000-0000-0000-000000000001',
        'Сортувальний центр «Зелений Дім»',
        st_makepoint(32.3920, 50.5985)::geography,
        'вул. Київська 25',
        array['plastic','glass','paper','metal'],
        true,
        'Скло — 1.20 ₴/кг · ПЕТ — 5 ₴/кг · Папір — 2.50 ₴/кг · Алюміній — 25 ₴/кг'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Скло-приймач «Чисте Скло»',
        st_makepoint(32.3850, 50.5910)::geography,
        'вул. Котляревського 8',
        array['glass'],
        true,
        'Прозоре — 1.50 ₴/кг · Зелене — 1.20 ₴/кг · Коричневе — 1.00 ₴/кг'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Пункт «ВторРесурс»',
        st_makepoint(32.3995, 50.6005)::geography,
        'пр. Миру 67',
        array['plastic','paper','metal'],
        true,
        'ПЕТ — 6 ₴/кг · Картон — 3 ₴/кг · Алюмінієві банки — 30 ₴/кг'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Металобаза «Прилуки-Метал»',
        st_makepoint(32.4080, 50.5870)::geography,
        'вул. Промислова 12',
        array['metal'],
        true,
        'Чорний метал — 8 ₴/кг · Мідь — 250 ₴/кг · Алюміній — 35 ₴/кг'
    );

-- Replace points_nearby so the new fields surface to the public PWA.
create or replace function public.points_nearby(
    p_lat            double precision,
    p_lng            double precision,
    p_category       text default null,
    p_radius_m       integer default 2000,
    p_limit          integer default 20,
    p_community_slug text default null
)
returns table (
    id            uuid,
    name          text,
    address       text,
    accepts       text[],
    schedule      jsonb,
    is_buyback    boolean,
    buyback_info  text,
    lat           double precision,
    lng           double precision,
    distance_m    double precision
)
language sql
stable
security invoker
set search_path = public
as $fn$
    with target_community as (
        select coalesce(
            (select id from public.communities where slug = p_community_slug),
            public.current_community_id()
        ) as id
    )
    select
        cp.id,
        cp.name,
        cp.address,
        cp.accepts,
        cp.schedule,
        cp.is_buyback,
        cp.buyback_info,
        st_y(cp.location::geometry) as lat,
        st_x(cp.location::geometry) as lng,
        st_distance(cp.location, st_makepoint(p_lng, p_lat)::geography) as distance_m
    from public.collection_points cp, target_community tc
    where cp.is_active
      and cp.community_id = tc.id
      and (p_category is null or p_category = any(cp.accepts))
      and st_dwithin(cp.location, st_makepoint(p_lng, p_lat)::geography, p_radius_m)
    order by cp.location <-> st_makepoint(p_lng, p_lat)::geography
    limit p_limit;
$fn$;

/*
-- DOWN
-- Restore prior signature (without is_buyback/buyback_info), drop columns + seed.
create or replace function public.points_nearby(
    p_lat            double precision,
    p_lng            double precision,
    p_category       text default null,
    p_radius_m       integer default 2000,
    p_limit          integer default 20,
    p_community_slug text default null
)
returns table (id uuid, name text, address text, accepts text[], schedule jsonb,
               lat double precision, lng double precision, distance_m double precision)
language sql stable security invoker set search_path = public
as $fn$
    with target_community as (
        select coalesce((select id from public.communities where slug = p_community_slug),
                       public.current_community_id()) as id
    )
    select cp.id, cp.name, cp.address, cp.accepts, cp.schedule,
        st_y(cp.location::geometry), st_x(cp.location::geometry),
        st_distance(cp.location, st_makepoint(p_lng, p_lat)::geography)
    from public.collection_points cp, target_community tc
    where cp.is_active and cp.community_id = tc.id
      and (p_category is null or p_category = any(cp.accepts))
      and st_dwithin(cp.location, st_makepoint(p_lng, p_lat)::geography, p_radius_m)
    order by cp.location <-> st_makepoint(p_lng, p_lat)::geography
    limit p_limit;
$fn$;
delete from public.collection_points where is_buyback;
drop index if exists collection_points_buyback_idx;
alter table public.collection_points drop column if exists buyback_info;
alter table public.collection_points drop column if exists is_buyback;
*/
