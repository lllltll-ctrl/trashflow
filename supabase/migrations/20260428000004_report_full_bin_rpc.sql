-- 022_report_full_bin_rpc.sql
-- Allows residents to flag a public bin as full from the /report flow.
-- Finds the nearest active public bin (up to 500 m) and inserts a
-- bin_reading with fill_pct=100 and source='manual'.
-- Does NOT create a complaint — this feeds only the routing engine.
--
-- UP

set local search_path = public, extensions;

create or replace function public.report_full_bin(
    p_lat           double precision,
    p_lng           double precision,
    p_description   text    default null,
    p_community_slug text   default 'pryluky'
)
returns table (bin_id uuid, distance_m double precision)
language plpgsql
security definer
set search_path = public
as $fn$
declare
    v_community uuid;
    v_bin_id    uuid;
    v_dist_m    double precision;
    v_point     geography := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
begin
    select id into v_community
    from public.communities
    where slug = p_community_slug
    limit 1;

    if v_community is null then
        raise exception 'Громаду % не знайдено', p_community_slug;
    end if;

    -- Nearest public bin within 500 m; fall back to nearest bin in the community
    -- if nothing is within 500 m (edge case for far-from-city reports).
    select b.id,
           ST_Distance(b.location, v_point) as dist
    into v_bin_id, v_dist_m
    from public.bins b
    where b.community_id = v_community
      and b.kind = 'public'
      and b.is_active
    order by b.location <-> v_point
    limit 1;

    if v_bin_id is null then
        raise exception 'У системі немає жодного публічного баку';
    end if;

    insert into public.bin_readings (bin_id, fill_pct, source)
    values (v_bin_id, 100, 'manual');

    return query select v_bin_id, v_dist_m;
end;
$fn$;

grant execute on function public.report_full_bin(double precision, double precision, text, text)
    to anon, authenticated;
