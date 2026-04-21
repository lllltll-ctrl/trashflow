-- 001_init.sql — base schema for TrashFlow
-- Multi-tenant from day 1: every user-data table has community_id FK.
--
-- UP

create extension if not exists postgis;
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- TENANTS
-- ────────────────────────────────────────────────────────────────
create table public.communities (
    id          uuid primary key default uuid_generate_v4(),
    slug        text unique not null,
    name        text not null,
    region      text not null,
    bbox        geography(polygon, 4326),
    created_at  timestamptz not null default now()
);

comment on table public.communities is 'Ukrainian hromadas. Slug is used in URLs and logs.';

-- ────────────────────────────────────────────────────────────────
-- USERS  (extends auth.users)
-- ────────────────────────────────────────────────────────────────
create table public.profiles (
    id            uuid primary key references auth.users(id) on delete cascade,
    community_id  uuid not null references public.communities(id) on delete restrict,
    role          text not null default 'resident'
                    check (role in ('resident', 'dispatcher', 'admin')),
    full_name     text,
    phone         text,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index profiles_community_id_idx on public.profiles (community_id);
create index profiles_role_idx        on public.profiles (role);

-- ────────────────────────────────────────────────────────────────
-- WASTE CATEGORIES (reference data, not tenant-scoped)
-- ────────────────────────────────────────────────────────────────
create table public.waste_categories (
    id            text primary key,        -- 'plastic', 'paper', ...
    name_ua       text not null,
    description   text,
    hazard_level  int  not null default 0
                    check (hazard_level between 0 and 3),
    icon_url      text
);

-- ────────────────────────────────────────────────────────────────
-- COLLECTION POINTS
-- ────────────────────────────────────────────────────────────────
create table public.collection_points (
    id            uuid primary key default uuid_generate_v4(),
    community_id  uuid not null references public.communities(id) on delete cascade,
    name          text not null,
    location      geography(point, 4326) not null,
    address       text,
    accepts       text[] not null,
    schedule      jsonb,
    is_active     boolean not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index collection_points_location_idx   on public.collection_points using gist (location);
create index collection_points_community_idx  on public.collection_points (community_id) where is_active;
create index collection_points_accepts_idx    on public.collection_points using gin (accepts);

-- ────────────────────────────────────────────────────────────────
-- COMPLAINTS
-- ────────────────────────────────────────────────────────────────
create table public.complaints (
    id            uuid primary key default uuid_generate_v4(),
    community_id  uuid not null references public.communities(id) on delete cascade,
    reporter_id   uuid references public.profiles(id) on delete set null,
    location      geography(point, 4326) not null,
    photo_urls    text[] not null check (array_length(photo_urls, 1) >= 1),
    category_id   text references public.waste_categories(id),
    description   text,
    status        text not null default 'new'
                    check (status in ('new','assigned','in_progress','resolved','rejected')),
    assigned_to   uuid references public.profiles(id) on delete set null,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    resolved_at   timestamptz
);

create index complaints_location_idx    on public.complaints using gist (location);
create index complaints_community_feed  on public.complaints (community_id, status, created_at desc);
create index complaints_assigned_idx    on public.complaints (assigned_to) where assigned_to is not null;
create index complaints_reporter_idx    on public.complaints (reporter_id) where reporter_id is not null;

-- ────────────────────────────────────────────────────────────────
-- CV CLASSIFICATIONS (history for continuous training)
-- ────────────────────────────────────────────────────────────────
create table public.cv_classifications (
    id                  uuid primary key default uuid_generate_v4(),
    community_id        uuid references public.communities(id) on delete cascade,
    photo_url           text not null,
    predicted_category  text references public.waste_categories(id),
    confidence          real not null check (confidence between 0 and 1),
    user_corrected_to   text references public.waste_categories(id),
    created_at          timestamptz not null default now()
);

create index cv_classifications_created_idx on public.cv_classifications (created_at desc);

-- ────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

create trigger collection_points_set_updated_at
    before update on public.collection_points
    for each row execute function public.set_updated_at();

create trigger complaints_set_updated_at
    before update on public.complaints
    for each row execute function public.set_updated_at();

-- Auto-stamp resolved_at when status flips to 'resolved'
create or replace function public.stamp_resolved_at()
returns trigger
language plpgsql
as $$
begin
    if new.status = 'resolved' and (old.status is distinct from 'resolved') then
        new.resolved_at = now();
    end if;
    return new;
end;
$$;

create trigger complaints_stamp_resolved
    before update on public.complaints
    for each row execute function public.stamp_resolved_at();

/*
-- DOWN (manual rollback)
drop trigger if exists complaints_stamp_resolved on public.complaints;
drop trigger if exists complaints_set_updated_at on public.complaints;
drop trigger if exists collection_points_set_updated_at on public.collection_points;
drop trigger if exists profiles_set_updated_at on public.profiles;
drop function if exists public.stamp_resolved_at();
drop function if exists public.set_updated_at();
drop table if exists public.cv_classifications;
drop table if exists public.complaints;
drop table if exists public.collection_points;
drop table if exists public.waste_categories;
drop table if exists public.profiles;
drop table if exists public.communities;
*/
