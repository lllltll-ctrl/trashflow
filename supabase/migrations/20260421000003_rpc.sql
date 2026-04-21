-- 003_rpc.sql — stored procedures used by public API
--
-- UP

-- Nearby collection points filtered by waste category
create or replace function public.points_nearby(
    p_lat        double precision,
    p_lng        double precision,
    p_category   text default null,
    p_radius_m   integer default 2000,
    p_limit      integer default 20
)
returns table (
    id            uuid,
    name          text,
    address       text,
    accepts       text[],
    schedule      jsonb,
    lat           double precision,
    lng           double precision,
    distance_m    double precision
)
language sql
stable
security invoker
set search_path = public
as $$
    select
        cp.id,
        cp.name,
        cp.address,
        cp.accepts,
        cp.schedule,
        st_y(cp.location::geometry) as lat,
        st_x(cp.location::geometry) as lng,
        st_distance(cp.location, st_makepoint(p_lng, p_lat)::geography) as distance_m
    from public.collection_points cp
    where cp.is_active
      and cp.community_id = public.current_community_id()
      and (p_category is null or p_category = any(cp.accepts))
      and st_dwithin(cp.location, st_makepoint(p_lng, p_lat)::geography, p_radius_m)
    order by cp.location <-> st_makepoint(p_lng, p_lat)::geography
    limit p_limit;
$$;

-- Hexagonal heatmap aggregation of complaints
create or replace function public.complaint_heatmap(
    p_days_back  integer default 30,
    p_hex_size_m integer default 250
)
returns table (
    hex        geography,
    count      bigint,
    last_at    timestamptz
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
    with bbox as (
        select coalesce(
            (select bbox from public.communities where id = public.current_community_id()),
            (select st_buffer(st_collect(location::geometry)::geography, 100)::geography
             from public.complaints
             where community_id = public.current_community_id()
               and created_at > now() - (p_days_back || ' days')::interval)
        ) as g
    ),
    grid as (
        select (h).geom::geography as hex
        from bbox, st_hexagongrid(p_hex_size_m, st_transform((bbox.g)::geometry, 3857)) h
    )
    select
        grid.hex,
        count(c.id) as count,
        max(c.created_at) as last_at
    from grid
    left join public.complaints c
      on c.community_id = public.current_community_id()
     and c.created_at > now() - (p_days_back || ' days')::interval
     and st_within(c.location::geometry, st_transform(grid.hex::geometry, 4326))
    group by grid.hex
    having count(c.id) > 0;
$$;

/*
-- DOWN
drop function if exists public.complaint_heatmap(integer, integer);
drop function if exists public.points_nearby(double precision, double precision, text, integer, integer);
*/
