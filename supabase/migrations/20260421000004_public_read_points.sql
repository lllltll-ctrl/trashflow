-- 004_public_read_points.sql — allow anonymous residents to browse collection points
-- Collection points are public reference data: residents need to see them before signing in.
-- Communities metadata (slug, name) also becomes public so the app can match a slug -> UUID.
-- Complaints, profiles, cv_classifications remain tenant-locked via previous policies.
--
-- UP

-- Replace the existing "read own community" policy with a public-read for active points.
drop policy if exists "collection_points: read own community" on public.collection_points;

create policy "collection_points: public read active"
    on public.collection_points for select
    using (is_active);

-- Same for communities: the public app needs to resolve a slug to a community_id.
drop policy if exists "communities: read own" on public.communities;

create policy "communities: public read"
    on public.communities for select
    using (true);

-- Update points_nearby so it works without an authenticated profile.
-- Callers pass a slug explicitly; if omitted we fall back to the caller's community.
create or replace function public.points_nearby(
    p_lat           double precision,
    p_lng           double precision,
    p_category      text default null,
    p_radius_m      integer default 2000,
    p_limit         integer default 20,
    p_community_slug text default null
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
$$;

/*
-- DOWN
create or replace function public.points_nearby(
    p_lat        double precision,
    p_lng        double precision,
    p_category   text default null,
    p_radius_m   integer default 2000,
    p_limit      integer default 20
)
returns table (id uuid, name text, address text, accepts text[], schedule jsonb,
               lat double precision, lng double precision, distance_m double precision)
language sql stable security invoker set search_path = public
as $$
    select cp.id, cp.name, cp.address, cp.accepts, cp.schedule,
        st_y(cp.location::geometry), st_x(cp.location::geometry),
        st_distance(cp.location, st_makepoint(p_lng, p_lat)::geography)
    from public.collection_points cp
    where cp.is_active and cp.community_id = public.current_community_id()
      and (p_category is null or p_category = any(cp.accepts))
      and st_dwithin(cp.location, st_makepoint(p_lng, p_lat)::geography, p_radius_m)
    order by cp.location <-> st_makepoint(p_lng, p_lat)::geography
    limit p_limit;
$$;
drop policy if exists "communities: public read"                on public.communities;
drop policy if exists "collection_points: public read active"   on public.collection_points;
create policy "communities: read own" on public.communities for select using (id = public.current_community_id());
create policy "collection_points: read own community" on public.collection_points for select
    using (community_id = public.current_community_id());
*/
