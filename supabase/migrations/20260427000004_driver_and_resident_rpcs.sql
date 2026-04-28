-- 018_driver_and_resident_rpcs.sql
-- Public RPCs (anon-callable) that wire the driver and resident apps to the
-- routes/pickup_events tables without exposing the underlying RLS surface.
--
-- - route_by_driver_token: driver opens /crew/<token> on their phone, gets
--   today's stop list + bin metadata.
-- - record_pickup: driver scans QR on a bin → fires a pickup_event (which
--   resets fill via trigger). Bypasses dispatcher-write RLS via SECURITY
--   DEFINER but checks the token matches a real route.
-- - flag_bin_full: resident scans QR on their household bin → registers
--   fill_pct=100 in bin_readings. Pure additive insert, also DEFINER.
--
-- UP

create or replace function public.route_by_driver_token(p_token text)
returns table (
    id            uuid,
    vehicle_label text,
    plate         text,
    planned_for   date,
    status        text,
    distance_m    numeric,
    duration_s    int,
    stops         jsonb,
    completed_bin_ids uuid[]
)
language sql
stable
security definer
set search_path = public
as $fn$
    select
        r.id,
        v.label,
        v.plate,
        r.planned_for,
        r.status,
        r.distance_m,
        r.duration_s,
        r.stops,
        coalesce((
            select array_agg(pe.bin_id)
            from public.pickup_events pe
            where pe.route_id = r.id
        ), array[]::uuid[]) as completed_bin_ids
    from public.routes r
    left join public.vehicles v on v.id = r.vehicle_id
    where r.driver_token = p_token
    limit 1;
$fn$;

grant execute on function public.route_by_driver_token(text) to anon, authenticated;

create or replace function public.record_pickup(
    p_driver_token text,
    p_bin_id uuid,
    p_sorted boolean default null,
    p_notes text default null
)
returns table (
    pickup_id uuid,
    bin_id    uuid,
    fill_pct  int
)
language plpgsql
security definer
set search_path = public
as $fn$
declare
    v_route record;
    v_bin   record;
    v_pickup_id uuid;
begin
    select id, community_id, vehicle_id, status into v_route
    from public.routes
    where driver_token = p_driver_token
    limit 1;
    if not found then
        raise exception 'Маршрут не знайдено для цього токена';
    end if;

    select id, kind, household_id, community_id into v_bin
    from public.bins
    where id = p_bin_id and is_active;
    if not found then
        raise exception 'Бак не знайдено або вимкнено';
    end if;
    if v_bin.community_id <> v_route.community_id then
        raise exception 'Бак належить іншій громаді';
    end if;

    if exists (select 1 from public.pickup_events where route_id = v_route.id and bin_id = p_bin_id) then
        -- idempotent: same scan twice doesn't double-record.
        select id into v_pickup_id
        from public.pickup_events
        where route_id = v_route.id and bin_id = p_bin_id
        limit 1;
        return query select v_pickup_id, p_bin_id, 0;
        return;
    end if;

    if v_route.status = 'planned' then
        update public.routes set status = 'in_progress', started_at = now() where id = v_route.id;
    end if;

    insert into public.pickup_events
        (community_id, route_id, bin_id, vehicle_id, household_id, sorted, notes)
    values (
        v_route.community_id,
        v_route.id,
        p_bin_id,
        v_route.vehicle_id,
        v_bin.household_id,
        p_sorted,
        p_notes
    )
    returning id into v_pickup_id;

    -- bin_fill_reset_on_pickup trigger has already inserted fill=0.
    return query select v_pickup_id, p_bin_id, 0;
end;
$fn$;

grant execute on function public.record_pickup(text, uuid, boolean, text) to anon, authenticated;

create or replace function public.flag_bin_full(p_qr_token text)
returns table (
    household_id  uuid,
    bin_id        uuid,
    fill_pct      int
)
language plpgsql
security definer
set search_path = public
as $fn$
declare
    v_household record;
    v_bin       record;
begin
    select id, community_id into v_household
    from public.households
    where qr_token = p_qr_token
    limit 1;
    if not found then
        raise exception 'QR-код не зв''язано з домогосподарством';
    end if;

    select id into v_bin
    from public.bins
    where household_id = v_household.id and kind = 'household' and is_active
    limit 1;
    if not found then
        raise exception 'У цього домогосподарства немає активного баку';
    end if;

    insert into public.bin_readings (bin_id, fill_pct, source, ts)
    values (v_bin.id, 100, 'qr', now());

    return query select v_household.id, v_bin.id, 100;
end;
$fn$;

grant execute on function public.flag_bin_full(text) to anon, authenticated;
