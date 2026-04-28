-- 012_create_collection_point_rpc.sql
-- Replaces the client-side WKT-string-concat pattern in apps/admin (where
-- `SRID=4326;POINT(${lng} ${lat})` was assembled in JS) with a server-side
-- RPC that:
--   1. Validates lat/lng ranges,
--   2. Constructs the geography from numeric inputs (no WKT round-trip),
--   3. Resolves community_id from the caller's profile (dropping the
--      hardcoded PRYLUKY_COMMUNITY_ID literal in the admin UI),
--   4. Enforces dispatcher/admin role at the function level even if RLS is
--      ever loosened on the underlying table.
--
-- UP

create or replace function public.create_collection_point(
    p_lng        double precision,
    p_lat        double precision,
    p_name       text,
    p_address    text default null,
    p_accepts    text[] default array[]::text[],
    p_schedule   jsonb default null
)
returns table (
    id          uuid,
    name        text,
    address     text,
    accepts     text[],
    schedule    jsonb,
    is_active   boolean,
    lat         double precision,
    lng         double precision,
    created_at  timestamptz
)
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
    v_community_id uuid := public.current_community_id();
    v_id           uuid;
begin
    if v_community_id is null then
        raise exception 'no community context — caller must be an authenticated dispatcher';
    end if;
    if public.current_role() not in ('dispatcher', 'admin') then
        raise exception 'only dispatcher or admin can create collection points';
    end if;
    if p_lat is null or p_lat < -90 or p_lat > 90 then
        raise exception 'latitude out of range (-90..90): %', p_lat;
    end if;
    if p_lng is null or p_lng < -180 or p_lng > 180 then
        raise exception 'longitude out of range (-180..180): %', p_lng;
    end if;
    if coalesce(length(trim(p_name)), 0) = 0 then
        raise exception 'name is required';
    end if;

    insert into public.collection_points
        (community_id, name, location, address, accepts, schedule)
    values (
        v_community_id,
        trim(p_name),
        st_makepoint(p_lng, p_lat)::geography,
        nullif(trim(coalesce(p_address, '')), ''),
        coalesce(p_accepts, array[]::text[]),
        p_schedule
    )
    returning collection_points.id into v_id;

    return query
    select
        cp.id,
        cp.name,
        cp.address,
        cp.accepts,
        cp.schedule,
        cp.is_active,
        st_y(cp.location::geometry) as lat,
        st_x(cp.location::geometry) as lng,
        cp.created_at
    from public.collection_points cp
    where cp.id = v_id;
end;
$$;

/*
-- DOWN
drop function if exists public.create_collection_point(double precision, double precision, text, text, text[], jsonb);
*/
