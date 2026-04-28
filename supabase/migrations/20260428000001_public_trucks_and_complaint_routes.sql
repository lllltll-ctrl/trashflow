-- 019_public_trucks_and_complaint_routes.sql
-- Two adjacent features that share a migration:
--
-- (a) public_active_trucks — anon-readable RPC the resident PWA polls so people
--     can see the truck approaching their street in real time. Returns label
--     and position only (no plate, no driver identity) so it's privacy-safe.
--
-- (b) tf_generate_complaint_route — generates a rapid-response route from
--     unresolved complaints (illegal dumps), separate from the regular bin
--     pickups. Every complaint becomes a "stop" with kind='complaint' so the
--     existing driver page already renders them. Status auto-flips
--     'new'/'assigned' → 'in_progress' when the route starts.
--
-- UP

create or replace function public.public_active_trucks(p_community_slug text default 'pryluky')
returns table (
    id          uuid,
    label       text,
    lat         double precision,
    lng         double precision,
    speed_kmh   numeric,
    heading     smallint,
    on_route    boolean,
    last_seen   timestamptz
)
language sql
stable
security definer
set search_path = public
as $fn$
    with target as (
        select id from public.communities where slug = p_community_slug limit 1
    ),
    last_pos as (
        select distinct on (vp.vehicle_id)
            vp.vehicle_id, vp.location, vp.speed_kmh, vp.heading, vp.ts
        from public.vehicle_positions vp
        join public.vehicles v on v.id = vp.vehicle_id
        where v.community_id = (select id from target)
          and v.is_active
        order by vp.vehicle_id, vp.ts desc
    )
    select
        v.id,
        v.label,
        st_y(p.location::geometry) as lat,
        st_x(p.location::geometry) as lng,
        p.speed_kmh,
        p.heading,
        exists (
            select 1 from public.routes r
            where r.vehicle_id = v.id
              and r.status = 'in_progress'
              and r.planned_for >= current_date - 1
        ) as on_route,
        p.ts as last_seen
    from public.vehicles v
    join target t on v.community_id = t.id
    left join last_pos p on p.vehicle_id = v.id
    where v.is_active and p.ts is not null
      and p.ts > now() - interval '12 hours';
$fn$;

grant execute on function public.public_active_trucks(text) to anon, authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- Rapid-response route from open complaints. The optimizer takes complaints
-- as "stops" with kind='complaint' so the driver app's QR-pickup buttons
-- still work (they call record_pickup which only needs a bin_id; complaint
-- stops use a synthetic bin per complaint).
--
-- Strategy: create one synthetic 'public' bin per complaint at the complaint
-- coordinates (kind='public', sensor_id NULL, accepts=['mixed','complaint'])
-- inside this function. That way the entire downstream flow — VROOM, driver
-- map, pickup_events — works without special-casing.
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.tf_generate_complaint_route(
    p_vehicle_id uuid default null
)
returns table (
    route_id   uuid,
    stop_count int
)
language plpgsql
security definer
set search_path = public
as $fn$
declare
    v_community uuid := '00000000-0000-0000-0000-000000000001'::uuid;
    v_vehicle uuid;
    v_route uuid;
    v_token text;
    v_complaint record;
    v_bin_id uuid;
    v_synthetic_bins jsonb := '[]'::jsonb;
    v_count int := 0;
begin
    -- Pick the vehicle: caller can specify, otherwise any active vehicle
    -- without an in_progress route gets it.
    if p_vehicle_id is not null then
        v_vehicle := p_vehicle_id;
    else
        select v.id into v_vehicle
        from public.vehicles v
        where v.is_active
          and v.community_id = v_community
          and not exists (
              select 1 from public.routes r
              where r.vehicle_id = v.id and r.status = 'in_progress'
          )
        order by random()
        limit 1;
    end if;

    if v_vehicle is null then
        raise exception 'Немає вільної машини для маршруту скарг';
    end if;

    v_token := encode(gen_random_bytes(8), 'hex');

    insert into public.routes
        (community_id, vehicle_id, planned_for, status, driver_token, stops)
    values
        (v_community, v_vehicle, current_date, 'planned', v_token, '[]'::jsonb)
    returning id into v_route;

    -- Each open complaint with coords becomes a synthetic public bin + stop.
    for v_complaint in
        select c.id, c.description, c.category_id, c.location,
               st_y(c.location::geometry) as lat,
               st_x(c.location::geometry) as lng
        from public.complaints c
        where c.community_id = v_community
          and c.status in ('new', 'assigned')
          and c.location is not null
        order by c.created_at asc
        limit 12
    loop
        insert into public.bins
            (community_id, kind, location, address, accepts, capacity_l, is_active)
        values (
            v_community, 'public', v_complaint.location,
            'Скарга: ' || coalesce(left(v_complaint.description, 60), '—'),
            array['complaint','mixed'], 1100, true
        )
        returning id into v_bin_id;

        v_synthetic_bins := v_synthetic_bins || jsonb_build_object(
            'seq', v_count + 1,
            'binId', v_bin_id,
            'address', 'Скарга: ' || coalesce(left(v_complaint.description, 60), '—'),
            'lat', v_complaint.lat,
            'lng', v_complaint.lng,
            'fillPct', 100,
            'kind', 'public'
        );
        v_count := v_count + 1;

        -- Mark complaint as assigned (auto-promotion via existing trigger if
        -- crew is set; here we set status directly).
        update public.complaints
        set status = 'assigned'
        where id = v_complaint.id and status = 'new';
    end loop;

    if v_count = 0 then
        delete from public.routes where id = v_route;
        raise exception 'Немає відкритих скарг із координатами';
    end if;

    update public.routes
    set stops = v_synthetic_bins
    where id = v_route;

    return query select v_route, v_count;
end;
$fn$;

grant execute on function public.tf_generate_complaint_route(uuid) to authenticated;
