-- 024_real_collection_points.sql
-- Replace mock seed data with 20 real collection points from
-- "ТЗ_Прилуки_КМ_на_тендер_остаточний_варіант" (Expertise France / Egis, May 2025).
-- Also adds `containers` jsonb column and updates points_nearby to return it.

set local search_path = public, extensions;

-- 1. Add containers column (bin counts per type)
alter table public.collection_points
  add column if not exists containers jsonb not null default '{}';

-- 2. Wipe old mock points for Pryluky
delete from public.collection_points
where community_id = (select id from public.communities where slug = 'pryluky');

-- 3. Insert 20 real points from the TZ document (survey date 17 Apr 2025)
do $$
declare
  v_community_id uuid;
begin
  select id into v_community_id from public.communities where slug = 'pryluky';

  insert into public.collection_points
    (community_id, name, address, location, accepts, is_active, containers)
  values
    -- 1 · вул. Київська, 419 (3-й магазин) · Priority 1
    (v_community_id,
     'вул. Київська, 419',
     'вул. Київська, 419 (3-й магазин)',
     st_makepoint(32.42096, 50.58946)::geography,
     array['glass','plastic'],
     true,
     '{"mixed":5,"glass":1,"plastic":1,"paper":0,"organic":0}'::jsonb),

    -- 2 · вул. Незалежності (центральний пляж) · Priority 2
    (v_community_id,
     'вул. Незалежності (пляж)',
     'вул. Незалежності (центральний пляж)',
     st_makepoint(32.38530, 50.60240)::geography,
     array['glass','plastic'],
     true,
     '{"mixed":3,"glass":1,"plastic":1,"paper":0,"organic":0}'::jsonb),

    -- 3 · вул. Київська (кінцева зупинка Юрія Мірюти) · Priority 3
    (v_community_id,
     'вул. Київська (зупинка Мірюти)',
     'вул. Київська (кінцева зупинка Юрія Мірюти)',
     st_makepoint(32.32877, 50.60202)::geography,
     array['glass','plastic'],
     true,
     '{"mixed":2,"glass":1,"plastic":1,"paper":0,"organic":0}'::jsonb),

    -- 4 · вул. Київська, 56 · Priority 4
    (v_community_id,
     'вул. Київська, 56',
     'вул. Київська, 56',
     st_makepoint(32.35073, 50.59866)::geography,
     array['glass','plastic'],
     true,
     '{"mixed":3,"glass":1,"plastic":1,"paper":0,"organic":0}'::jsonb),

    -- 5 · вул. Пирятинська (автовокзал) · Priority 5
    (v_community_id,
     'вул. Пирятинська (автовокзал)',
     'вул. Пирятинська (автовокзал)',
     st_makepoint(32.39378, 50.58256)::geography,
     array['glass','plastic'],
     true,
     '{"mixed":3,"glass":1,"plastic":1,"paper":0,"organic":0}'::jsonb),

    -- 6 · вул. Саксаганського, 32 · Priority 6
    (v_community_id,
     'вул. Саксаганського, 32',
     'вул. Саксаганського, 32',
     st_makepoint(32.36786, 50.58164)::geography,
     array['glass','plastic'],
     true,
     '{"mixed":6,"glass":1,"plastic":1,"paper":0,"organic":0}'::jsonb),

    -- 7 · вул. Садова, 73 · Priority 7
    (v_community_id,
     'вул. Садова, 73',
     'вул. Садова, 73',
     st_makepoint(32.38962, 50.59283)::geography,
     array['glass','plastic'],
     true,
     '{"mixed":4,"glass":1,"plastic":1,"paper":0,"organic":0}'::jsonb),

    -- 8 · вул. Гімназична, 102 (кладовище) · Priority 8
    (v_community_id,
     'вул. Гімназична, 102',
     'вул. Гімназична, 102 (кладовище)',
     st_makepoint(32.39157, 50.58829)::geography,
     array['glass','plastic','organic'],
     true,
     '{"mixed":6,"glass":1,"plastic":1,"paper":0,"organic":2}'::jsonb),

    -- 9 · вул. Ярмаркова, 114 (іжбат) · Priority 9
    (v_community_id,
     'вул. Ярмаркова, 114',
     'вул. Ярмаркова, 114 (іжбат)',
     st_makepoint(32.40118, 50.58629)::geography,
     array['glass','plastic'],
     true,
     '{"mixed":5,"glass":1,"plastic":1,"paper":0,"organic":0}'::jsonb),

    -- 10 · вул. Архиповича (лижна база) · Priority 10
    (v_community_id,
     'вул. Архиповича (лижна база)',
     'вул. Архиповича (лижна база)',
     st_makepoint(32.38303, 50.61517)::geography,
     array['glass','plastic'],
     true,
     '{"mixed":6,"glass":1,"plastic":1,"paper":0,"organic":0}'::jsonb),

    -- 11 · В/м 12, школа №12 · Priority 11
    (v_community_id,
     'Мікрорайон 12, школа №12',
     'В/м 12, школа №12',
     st_makepoint(32.35659, 50.58627)::geography,
     array['glass','plastic','paper','organic'],
     true,
     '{"mixed":4,"glass":1,"plastic":1,"paper":1,"organic":2}'::jsonb),

    -- 12 · вул. Європейська – вул. Ветеранська · Priority 12
    (v_community_id,
     'вул. Європейська / Ветеранська',
     'перехрестя вул. Європейська – вул. Ветеранська',
     st_makepoint(32.37217, 50.59217)::geography,
     array['glass','plastic'],
     true,
     '{"mixed":5,"glass":1,"plastic":1,"paper":0,"organic":0}'::jsonb),

    -- 13 · вул. Гімназична, 85 (карамельний цех) · Priority 13
    (v_community_id,
     'вул. Гімназична, 85',
     'вул. Гімназична, 85 (карамельний цех)',
     st_makepoint(32.39201, 50.58979)::geography,
     array['glass','plastic','organic'],
     true,
     '{"mixed":4,"glass":1,"plastic":1,"paper":0,"organic":2}'::jsonb),

    -- 14 · вул. Леонтовича, 66 (СПТУ 34) · Priority 14
    (v_community_id,
     'вул. Леонтовича, 66',
     'вул. Леонтовича, 66 (СПТУ 34)',
     st_makepoint(32.39992, 50.59328)::geography,
     array['glass','plastic','paper'],
     true,
     '{"mixed":5,"glass":1,"plastic":1,"paper":1,"organic":0}'::jsonb),

    -- 15 · вул. Польова, 100 · Priority 15
    (v_community_id,
     'вул. Польова, 100',
     'вул. Польова, 100',
     st_makepoint(32.41315, 50.57275)::geography,
     array['glass','plastic','paper','organic'],
     true,
     '{"mixed":5,"glass":1,"plastic":1,"paper":1,"organic":2}'::jsonb),

    -- 16 · вул. Вокзальна, 10 · Priority 16
    (v_community_id,
     'вул. Вокзальна, 10',
     'вул. Вокзальна, 10',
     st_makepoint(32.38582, 50.59305)::geography,
     array['glass','plastic','organic'],
     true,
     '{"mixed":2,"glass":1,"plastic":1,"paper":0,"organic":2}'::jsonb),

    -- 17 · вул. Ярмаркова, 41/1 · Priority 17
    (v_community_id,
     'вул. Ярмаркова, 41/1',
     'вул. Ярмаркова, 41/1',
     st_makepoint(32.40403, 50.59143)::geography,
     array['glass','plastic','paper','organic'],
     true,
     '{"mixed":5,"glass":1,"plastic":1,"paper":1,"organic":2}'::jsonb),

    -- 18 · вул. Садова, 64 · Priority 18
    (v_community_id,
     'вул. Садова, 64',
     'вул. Садова, 64',
     st_makepoint(32.38789, 50.59118)::geography,
     array['glass','plastic','organic'],
     true,
     '{"mixed":3,"glass":1,"plastic":1,"paper":0,"organic":2}'::jsonb),

    -- 19 · вул. Леонтовича, 76 · Priority 19
    (v_community_id,
     'вул. Леонтовича, 76',
     'вул. Леонтовича, 76',
     st_makepoint(32.39929, 50.59178)::geography,
     array['glass','plastic','paper'],
     true,
     '{"mixed":4,"glass":1,"plastic":1,"paper":1,"organic":0}'::jsonb),

    -- 20 · В/М 12, буд. 151 · Priority 20
    (v_community_id,
     'Мікрорайон 12, буд. 151',
     'В/М 12, буд. 151',
     st_makepoint(32.35811, 50.58888)::geography,
     array['glass','plastic','paper','organic'],
     true,
     '{"mixed":5,"glass":1,"plastic":1,"paper":1,"organic":2}'::jsonb);
end $$;

-- 4. Replace points_nearby to also return containers
create or replace function public.points_nearby(
    p_lat            double precision,
    p_lng            double precision,
    p_category       text default null,
    p_radius_m       integer default 5000,
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
    containers    jsonb,
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
        cp.containers,
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

grant execute on function public.points_nearby(double precision, double precision, text, integer, integer, text)
  to anon, authenticated;
