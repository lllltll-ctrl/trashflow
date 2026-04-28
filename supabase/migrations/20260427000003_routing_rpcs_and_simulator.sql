-- 017_routing_rpcs_and_simulator.sql
-- RPCs the admin /routes page calls + a server-side tick simulator that
-- moves the demo forward when nobody's watching. The simulator and pg_cron
-- schedule give us a "looks alive" demo for the pitch video without anyone
-- needing to keep an admin page open.
--
-- UP

-- ──────────────────────────────────────────────────────────────────────────
-- RPC: ripe_bins_for_routing — bins that are ≥ 70% full and ready for pickup.
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.ripe_bins_for_routing(p_threshold int default 70)
returns table (
    id        uuid,
    address   text,
    kind      text,
    fill_pct  int,
    lat       double precision,
    lng       double precision
)
language sql
stable
security invoker
set search_path = public
as $fn$
    select
        b.id,
        b.address,
        b.kind,
        coalesce(r.fill_pct, 0) as fill_pct,
        st_y(b.location::geometry) as lat,
        st_x(b.location::geometry) as lng
    from public.bins b
    left join lateral (
        select fill_pct, ts
        from public.bin_readings br
        where br.bin_id = b.id
        order by ts desc
        limit 1
    ) r on true
    where b.is_active
      and coalesce(r.fill_pct, 0) >= p_threshold
      and b.community_id = coalesce(public.current_community_id(),
                                    '00000000-0000-0000-0000-000000000001'::uuid);
$fn$;

grant execute on function public.ripe_bins_for_routing(int) to authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- RPC: vehicles_with_latest_position — vehicle metadata + last GPS fix.
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.vehicles_with_latest_position()
returns table (
    id            uuid,
    label         text,
    plate         text,
    capacity_kg   int,
    crew_id       uuid,
    lat           double precision,
    lng           double precision,
    speed_kmh     numeric,
    heading       smallint,
    position_ts   timestamptz
)
language sql
stable
security invoker
set search_path = public
as $fn$
    select
        v.id,
        v.label,
        v.plate,
        v.capacity_kg,
        v.crew_id,
        st_y(p.location::geometry) as lat,
        st_x(p.location::geometry) as lng,
        p.speed_kmh,
        p.heading,
        p.ts as position_ts
    from public.vehicles v
    left join lateral (
        select location, speed_kmh, heading, ts
        from public.vehicle_positions vp
        where vp.vehicle_id = v.id
        order by ts desc
        limit 1
    ) p on true
    where v.is_active
      and v.community_id = coalesce(public.current_community_id(),
                                    '00000000-0000-0000-0000-000000000001'::uuid);
$fn$;

grant execute on function public.vehicles_with_latest_position() to authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- SIMULATOR: tf_simulate_tick
-- Two jobs in one function:
--   (a) Bump fill levels on a random subset of public bins (households fill
--       only when the resident scans QR — we don't fake that).
--   (b) Advance each vehicle that has an in_progress route towards its next
--       pending stop. When a vehicle gets within 50m, fire a pickup_event
--       (which trigger-resets the bin's fill to 0). When a route's stops
--       are all done, mark route status='done'.
--
-- Designed to be called every 1–2 minutes by pg_cron OR ad-hoc by the
-- "Симулювати тік" button on the admin map.
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.tf_simulate_tick()
returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
    v_community uuid := '00000000-0000-0000-0000-000000000001'::uuid;
    v_bins_bumped int := 0;
    v_pickups int := 0;
    v_vehicles_moved int := 0;
    v_route record;
    v_stop record;
    v_vehicle_pos record;
    v_step_m numeric := 250; -- vehicle advances ~250m per tick (~30 km/h * 30s)
    v_remaining_m numeric;
    v_bearing numeric;
    v_new_lat numeric;
    v_new_lng numeric;
    v_close boolean;
begin
    -- (a) Bump 8-15% of public bins by a random amount.
    with picked as (
        select b.id from public.bins b
        where b.kind = 'public' and b.is_active and b.community_id = v_community
          and random() < 0.12
    ),
    last_fill as (
        select b.id, coalesce((
            select fill_pct from public.bin_readings br
            where br.bin_id = b.id order by ts desc limit 1
        ), 0) as cur
        from picked b
    )
    insert into public.bin_readings (bin_id, fill_pct, source, ts)
    select
        id,
        least(100, cur + (4 + (random() * 12)::int))::smallint,
        'sensor',
        now()
    from last_fill;
    get diagnostics v_bins_bumped = row_count;

    -- (b) For each in_progress route (or planned route belonging to a vehicle
    --     with no in_progress sibling), advance the vehicle toward next stop.
    for v_route in
        select r.*, v.id as v_id
        from public.routes r
        join public.vehicles v on v.id = r.vehicle_id
        where r.community_id = v_community
          and r.status in ('planned', 'in_progress')
          and r.planned_for >= current_date - 1
        order by r.generated_at desc
    loop
        -- Get latest vehicle position
        select location, ts
        into v_vehicle_pos
        from public.vehicle_positions
        where vehicle_id = v_route.v_id
        order by ts desc
        limit 1;

        if not found then
            continue;
        end if;

        -- Find the next pending stop (where no pickup_event exists yet for that bin within this route).
        select
            (s ->> 'binId')::uuid as bin_id,
            (s ->> 'lat')::numeric as lat,
            (s ->> 'lng')::numeric as lng,
            (s ->> 'seq')::int as seq
        into v_stop
        from jsonb_array_elements(v_route.stops) s
        where not exists (
            select 1 from public.pickup_events pe
            where pe.route_id = v_route.id
              and pe.bin_id = (s ->> 'binId')::uuid
        )
        order by (s ->> 'seq')::int
        limit 1;

        if not found then
            -- All stops done.
            update public.routes set status = 'done', finished_at = now() where id = v_route.id;
            continue;
        end if;

        -- Mark route in_progress on first move.
        if v_route.status = 'planned' then
            update public.routes set status = 'in_progress', started_at = now() where id = v_route.id;
        end if;

        v_remaining_m := st_distance(
            v_vehicle_pos.location,
            st_makepoint(v_stop.lng, v_stop.lat)::geography
        );

        v_close := v_remaining_m <= 60;

        if v_close then
            -- Snap to stop, fire pickup_event, increment counter
            insert into public.vehicle_positions (vehicle_id, location, speed_kmh, heading, ts)
            values (v_route.v_id,
                    st_makepoint(v_stop.lng, v_stop.lat)::geography,
                    0, 0, now());
            insert into public.pickup_events
                (community_id, route_id, bin_id, vehicle_id, household_id, sorted, ts)
            select
                v_community,
                v_route.id,
                v_stop.bin_id,
                v_route.v_id,
                b.household_id,
                case b.kind
                    when 'household' then (
                        select case h.pricing_tier
                            when 'sorted' then true
                            when 'standard' then random() < 0.4
                            when 'unscanned' then random() < 0.15
                        end
                        from public.households h where h.id = b.household_id
                    )
                    else null
                end,
                now()
            from public.bins b where b.id = v_stop.bin_id;
            v_pickups := v_pickups + 1;
            v_vehicles_moved := v_vehicles_moved + 1;
        else
            -- Move v_step_m towards stop along bearing.
            v_bearing := degrees(
                atan2(
                    st_x(st_makepoint(v_stop.lng, v_stop.lat)::geometry)
                        - st_x(v_vehicle_pos.location::geometry),
                    st_y(st_makepoint(v_stop.lng, v_stop.lat)::geometry)
                        - st_y(v_vehicle_pos.location::geometry)
                )
            );
            -- Linear interpolation in lat/lng space — fine for 250m hops in Ukraine.
            v_new_lat := st_y(v_vehicle_pos.location::geometry)
                + (v_stop.lat - st_y(v_vehicle_pos.location::geometry)) * (v_step_m / v_remaining_m);
            v_new_lng := st_x(v_vehicle_pos.location::geometry)
                + (v_stop.lng - st_x(v_vehicle_pos.location::geometry)) * (v_step_m / v_remaining_m);
            insert into public.vehicle_positions (vehicle_id, location, speed_kmh, heading, ts)
            values (v_route.v_id,
                    st_makepoint(v_new_lng, v_new_lat)::geography,
                    30,
                    ((v_bearing + 360)::int % 360)::smallint,
                    now());
            v_vehicles_moved := v_vehicles_moved + 1;
        end if;
    end loop;

    return json_build_object(
        'bins_bumped', v_bins_bumped,
        'vehicles_moved', v_vehicles_moved,
        'pickups', v_pickups
    );
end;
$fn$;

grant execute on function public.tf_simulate_tick() to authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- pg_cron schedule: tick every 1 minute. Smallest pg_cron unit is 1 min,
-- which is plenty for the demo's "things move while you watch the video".
-- ──────────────────────────────────────────────────────────────────────────
do $$
begin
    if exists (select 1 from pg_extension where extname = 'pg_cron') then
        perform cron.unschedule(jobid)
        from cron.job
        where jobname = 'tf-simulate-tick';

        perform cron.schedule(
            'tf-simulate-tick',
            '* * * * *',
            $cron$select public.tf_simulate_tick();$cron$
        );
    end if;
end;
$$;
