-- 014_update_collection_point_rpc.sql
-- Mirror of create_collection_point but for updates. Eliminates the last
-- client-side `SRID=4326;POINT(${lng} ${lat})` string concatenation in
-- apps/admin/components/points-manager.tsx — coordinates are now numeric
-- parameters validated server-side.
--
-- Conditional UPDATE semantics: NULL on a parameter = "leave unchanged".
-- This lets the UI submit only the fields the dispatcher actually edited
-- without losing untouched columns.
--
-- UP

create or replace function public.update_collection_point(
    p_id         uuid,
    p_lng        double precision default null,
    p_lat        double precision default null,
    p_name       text default null,
    p_address    text default null,
    p_accepts    text[] default null,
    p_schedule   jsonb default null,
    p_is_active  boolean default null
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
    updated_at  timestamptz
)
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
    v_community_id uuid := public.current_community_id();
    v_existing     public.collection_points%rowtype;
begin
    if v_community_id is null then
        raise exception 'no community context — caller must be authenticated';
    end if;
    if public.current_role() not in ('dispatcher', 'admin') then
        raise exception 'only dispatcher or admin can update collection points';
    end if;

    select * into v_existing from public.collection_points where collection_points.id = p_id;
    if not found then
        raise exception 'collection point not found: %', p_id;
    end if;
    if v_existing.community_id <> v_community_id then
        raise exception 'collection point belongs to a different community';
    end if;

    -- Coordinates: both must be supplied together to update geometry.
    if (p_lat is null) <> (p_lng is null) then
        raise exception 'lat and lng must be supplied together (got lat=%, lng=%)', p_lat, p_lng;
    end if;
    if p_lat is not null and (p_lat < -90 or p_lat > 90) then
        raise exception 'latitude out of range (-90..90): %', p_lat;
    end if;
    if p_lng is not null and (p_lng < -180 or p_lng > 180) then
        raise exception 'longitude out of range (-180..180): %', p_lng;
    end if;
    if p_name is not null and length(trim(p_name)) = 0 then
        raise exception 'name cannot be blank';
    end if;

    update public.collection_points cp
    set
        name      = coalesce(nullif(trim(p_name), ''), cp.name),
        location  = case
                        when p_lng is not null and p_lat is not null
                            then st_makepoint(p_lng, p_lat)::geography
                        else cp.location
                    end,
        address   = case
                        when p_address is not null
                            then nullif(trim(p_address), '')
                        else cp.address
                    end,
        accepts   = coalesce(p_accepts, cp.accepts),
        schedule  = case when p_schedule is not null then p_schedule else cp.schedule end,
        is_active = coalesce(p_is_active, cp.is_active)
    where cp.id = p_id;

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
        cp.updated_at
    from public.collection_points cp
    where cp.id = p_id;
end;
$$;

/*
-- DOWN
drop function if exists public.update_collection_point(uuid, double precision, double precision, text, text, text[], jsonb, boolean);
*/
