-- 016_smart_waste_layer.sql
-- Foundation for the dynamic-routing pitch: bins with fill sensors, vehicles
-- with live GPS, generated routes, and per-pickup events that feed both the
-- dispatcher map and the PAYT billing on the resident side.
--
-- Why one big migration instead of seven small ones: every table here references
-- something else in the layer (routes -> bins -> households; pickup_events ->
-- routes + bins), so splitting them invites partial rollouts where a foreign
-- key already exists but the target doesn't yet. Keeping it atomic.
--
-- UP

-- ──────────────────────────────────────────────────────────────────────────
-- HOUSEHOLDS — private-sector unit. QR token is the entry point: a sticker
-- on the bin links a phone to a household. PAYT tier is what the dispatcher
-- bills.
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.households (
    id            uuid primary key default uuid_generate_v4(),
    community_id  uuid not null references public.communities(id) on delete cascade,
    qr_token      text unique not null,
    address       text not null,
    location      geography(point, 4326) not null,
    -- pricing_tier flips Phase-2 of PAYT (see plan):
    --   standard  = 1.0x base, scans QR but unsorted
    --   sorted    = 0.5x, scans + AI verifies sorting
    --   unscanned = 1.5x, never linked to the app (penalty tier, Phase 2)
    pricing_tier  text not null default 'standard'
        check (pricing_tier in ('standard', 'sorted', 'unscanned')),
    owner_user_id uuid references auth.users(id) on delete set null,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index households_community_idx
    on public.households (community_id);
create index households_owner_idx
    on public.households (owner_user_id) where owner_user_id is not null;
create index households_location_gix
    on public.households using gist (location);

create trigger households_set_updated_at
    before update on public.households
    for each row execute function public.set_updated_at();

alter table public.households enable row level security;

create policy "households: resident reads own"
    on public.households for select
    using (owner_user_id = auth.uid());

create policy "households: public read by qr_token via RPC only"
    on public.households for select
    to anon
    using (false); -- Anonymous users go through the public RPC, not direct reads.

create policy "households: dispatcher full"
    on public.households for all
    using (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'))
    with check (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'));

-- ──────────────────────────────────────────────────────────────────────────
-- BINS — both public street bins AND household bins are rows here. The kind
-- column splits them; household bins always have household_id and never have
-- a sensor (no €100 ultrasonic on a private trash can — QR scan is the
-- "ready" signal). Public bins may have a sensor_id once the hromada deploys
-- ultrasonic sensors.
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.bins (
    id            uuid primary key default uuid_generate_v4(),
    community_id  uuid not null references public.communities(id) on delete cascade,
    kind          text not null check (kind in ('public', 'household')),
    household_id  uuid references public.households(id) on delete cascade,
    location      geography(point, 4326) not null,
    address       text,
    accepts       text[] not null default array['mixed']::text[],
    capacity_l    integer not null default 240,
    sensor_id     text unique,                       -- ultrasonic device ID, NULL for QR-only
    is_active     boolean not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    -- household bins MUST link to a household; public bins MUST NOT.
    constraint bins_kind_household_xor check (
        (kind = 'household' and household_id is not null) or
        (kind = 'public'    and household_id is null)
    )
);

create index bins_community_idx     on public.bins (community_id) where is_active;
create index bins_kind_idx          on public.bins (community_id, kind) where is_active;
create index bins_household_idx     on public.bins (household_id) where household_id is not null;
create index bins_location_gix      on public.bins using gist (location);

create trigger bins_set_updated_at
    before update on public.bins
    for each row execute function public.set_updated_at();

alter table public.bins enable row level security;

create policy "bins: public read of public bins"
    on public.bins for select
    using (kind = 'public' and is_active);

create policy "bins: resident reads own household bins"
    on public.bins for select
    using (kind = 'household' and household_id in (
        select id from public.households where owner_user_id = auth.uid()
    ));

create policy "bins: dispatcher full"
    on public.bins for all
    using (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'))
    with check (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'));

-- ──────────────────────────────────────────────────────────────────────────
-- BIN_READINGS — append-only time series from sensors (or QR scans for
-- household bins, where fill_pct=100 means "user said it's full").
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.bin_readings (
    id            bigserial primary key,
    bin_id        uuid not null references public.bins(id) on delete cascade,
    fill_pct      smallint not null check (fill_pct between 0 and 100),
    battery_pct   smallint check (battery_pct is null or battery_pct between 0 and 100),
    source        text not null default 'sensor'
        check (source in ('sensor','qr','manual','pickup')),
    ts            timestamptz not null default now()
);

create index bin_readings_bin_idx
    on public.bin_readings (bin_id, ts desc);

alter table public.bin_readings enable row level security;

create policy "bin_readings: dispatcher reads"
    on public.bin_readings for select
    using (public.current_role() in ('dispatcher','admin'));

create policy "bin_readings: dispatcher writes"
    on public.bin_readings for insert
    with check (public.current_role() in ('dispatcher','admin'));

-- A handy view: each bin with its latest reading. The admin heatmap layer
-- queries this directly so we don't repeat the LATERAL join everywhere.
create or replace view public.bins_with_latest_fill as
    select
        b.*,
        coalesce(r.fill_pct, 0)::int    as fill_pct,
        r.battery_pct,
        r.source                         as last_reading_source,
        r.ts                             as last_reading_at,
        st_y(b.location::geometry)       as lat,
        st_x(b.location::geometry)       as lng
    from public.bins b
    left join lateral (
        select fill_pct, battery_pct, source, ts
        from public.bin_readings br
        where br.bin_id = b.id
        order by ts desc
        limit 1
    ) r on true
    where b.is_active;

-- ──────────────────────────────────────────────────────────────────────────
-- VEHICLES — collection trucks. gps_tracker_id is opaque (whatever Wialon /
-- Bitrek / Teltonika gives us); the GpsProvider adapter resolves it.
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.vehicles (
    id              uuid primary key default uuid_generate_v4(),
    community_id    uuid not null references public.communities(id) on delete cascade,
    plate           text not null,
    label           text not null,                       -- "Машина №1"
    crew_id         uuid references public.crews(id) on delete set null,
    gps_tracker_id  text,
    capacity_kg     integer not null default 5000,
    is_active       boolean not null default true,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index vehicles_community_idx on public.vehicles (community_id) where is_active;
create index vehicles_crew_idx      on public.vehicles (crew_id) where crew_id is not null;

create trigger vehicles_set_updated_at
    before update on public.vehicles
    for each row execute function public.set_updated_at();

alter table public.vehicles enable row level security;

create policy "vehicles: dispatcher full"
    on public.vehicles for all
    using (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'))
    with check (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'));

-- Driver token reads via SECURITY DEFINER RPC, no direct policy needed.

-- ──────────────────────────────────────────────────────────────────────────
-- VEHICLE_POSITIONS — append-only GPS track. Fed by SimulatedGpsProvider
-- (demo) or WialonGpsProvider (when API access lands). Realtime channel
-- streams this to the admin map.
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.vehicle_positions (
    id          bigserial primary key,
    vehicle_id  uuid not null references public.vehicles(id) on delete cascade,
    location    geography(point, 4326) not null,
    speed_kmh   numeric(5,2),
    heading     smallint check (heading is null or heading between 0 and 359),
    ts          timestamptz not null default now()
);

create index vehicle_positions_vehicle_idx
    on public.vehicle_positions (vehicle_id, ts desc);
create index vehicle_positions_recent_idx
    on public.vehicle_positions (ts desc);

alter table public.vehicle_positions enable row level security;

create policy "vehicle_positions: dispatcher reads"
    on public.vehicle_positions for select
    using (public.current_role() in ('dispatcher','admin'));

create policy "vehicle_positions: dispatcher writes"
    on public.vehicle_positions for insert
    with check (public.current_role() in ('dispatcher','admin'));

-- ──────────────────────────────────────────────────────────────────────────
-- ROUTES — VROOM-generated daily plan. stops is an ordered jsonb array of
-- { bin_id, seq, eta, status }. geometry stores the encoded line for the
-- map polyline (we re-fetch it from OSRM/ORS via VROOM).
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.routes (
    id            uuid primary key default uuid_generate_v4(),
    community_id  uuid not null references public.communities(id) on delete cascade,
    vehicle_id    uuid references public.vehicles(id) on delete set null,
    planned_for   date not null default current_date,
    stops         jsonb not null default '[]'::jsonb,
    geometry      geography(linestring, 4326),
    distance_m    numeric(10,1),
    duration_s    integer,
    status        text not null default 'planned'
        check (status in ('planned','in_progress','done','cancelled')),
    driver_token  text unique,                          -- short URL token for /crew/[token]
    generated_at  timestamptz not null default now(),
    started_at    timestamptz,
    finished_at   timestamptz,
    updated_at    timestamptz not null default now()
);

create index routes_community_date_idx
    on public.routes (community_id, planned_for desc);
create index routes_vehicle_idx
    on public.routes (vehicle_id, planned_for desc) where vehicle_id is not null;

create trigger routes_set_updated_at
    before update on public.routes
    for each row execute function public.set_updated_at();

alter table public.routes enable row level security;

create policy "routes: dispatcher full"
    on public.routes for all
    using (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'))
    with check (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'));

-- ──────────────────────────────────────────────────────────────────────────
-- PICKUP_EVENTS — what actually happened. Fed by the driver app QR scan.
-- This is the source of truth for PAYT billing (sorted=true → 0.5x rate).
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.pickup_events (
    id              uuid primary key default uuid_generate_v4(),
    community_id    uuid not null references public.communities(id) on delete cascade,
    route_id        uuid references public.routes(id) on delete set null,
    bin_id          uuid not null references public.bins(id) on delete cascade,
    vehicle_id      uuid references public.vehicles(id) on delete set null,
    household_id    uuid references public.households(id) on delete set null,
    sorted          boolean,                            -- null = unknown, t/f = inspected
    waste_categories text[] not null default array[]::text[],
    weight_kg       numeric(6,2),
    ts              timestamptz not null default now(),
    notes           text
);

create index pickup_events_bin_ts_idx
    on public.pickup_events (bin_id, ts desc);
create index pickup_events_household_ts_idx
    on public.pickup_events (household_id, ts desc) where household_id is not null;
create index pickup_events_route_idx
    on public.pickup_events (route_id) where route_id is not null;
create index pickup_events_recent_idx
    on public.pickup_events (community_id, ts desc);

alter table public.pickup_events enable row level security;

create policy "pickup_events: dispatcher reads"
    on public.pickup_events for select
    using (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'));

create policy "pickup_events: resident reads own"
    on public.pickup_events for select
    using (household_id in (
        select id from public.households where owner_user_id = auth.uid()
    ));

create policy "pickup_events: dispatcher writes"
    on public.pickup_events for insert
    with check (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'));

-- After insert, drop the bin's fill back to zero. Real sensors do this on
-- their next reading; for QR/manual pickups we synthesise the reset so the
-- heatmap stays consistent.
create or replace function public.bin_fill_reset_on_pickup()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
    insert into public.bin_readings (bin_id, fill_pct, source, ts)
    values (new.bin_id, 0, 'pickup', new.ts);
    return new;
end;
$fn$;

create trigger pickup_events_reset_fill
    after insert on public.pickup_events
    for each row execute function public.bin_fill_reset_on_pickup();

-- ──────────────────────────────────────────────────────────────────────────
-- claim_household_by_qr: anonymous-friendly RPC the resident PWA calls when
-- a user lands on /my-bin/<qr>. Returns the household by token without
-- exposing the bypass-RLS read everywhere.
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.claim_household_by_qr(p_qr_token text)
returns table (
    id            uuid,
    community_id  uuid,
    qr_token      text,
    address       text,
    pricing_tier  text,
    lat           double precision,
    lng           double precision,
    has_owner     boolean
)
language sql
stable
security definer
set search_path = public
as $fn$
    select
        h.id, h.community_id, h.qr_token, h.address, h.pricing_tier,
        st_y(h.location::geometry) as lat,
        st_x(h.location::geometry) as lng,
        h.owner_user_id is not null as has_owner
    from public.households h
    where h.qr_token = p_qr_token
    limit 1;
$fn$;

grant execute on function public.claim_household_by_qr(text) to anon, authenticated;
