-- 002_rls.sql — Row Level Security policies
-- Every user-data table is tenant-scoped via community_id.
-- Reference tables (waste_categories) are public read.
--
-- UP

-- Helper: current user's community_id
create or replace function public.current_community_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
    select community_id from public.profiles where id = auth.uid()
$$;

-- Helper: current user's role
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select role from public.profiles where id = auth.uid()
$$;

-- ────────────────────────────────────────────────────────────────
-- communities: read-only to authenticated users of that community
-- ────────────────────────────────────────────────────────────────
alter table public.communities enable row level security;

create policy "communities: read own"
    on public.communities for select
    using (id = public.current_community_id());

-- ────────────────────────────────────────────────────────────────
-- profiles: users see profiles in their community; only admins modify roles
-- ────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "profiles: read own community"
    on public.profiles for select
    using (community_id = public.current_community_id());

create policy "profiles: insert self"
    on public.profiles for insert
    with check (id = auth.uid());

create policy "profiles: update self"
    on public.profiles for update
    using (id = auth.uid())
    with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles: admin manage community"
    on public.profiles for all
    using (
        public.current_role() = 'admin'
        and community_id = public.current_community_id()
    )
    with check (
        public.current_role() = 'admin'
        and community_id = public.current_community_id()
    );

-- ────────────────────────────────────────────────────────────────
-- waste_categories: public read, admin write
-- ────────────────────────────────────────────────────────────────
alter table public.waste_categories enable row level security;

create policy "waste_categories: read all"
    on public.waste_categories for select
    using (true);

create policy "waste_categories: admin write"
    on public.waste_categories for all
    using (public.current_role() = 'admin')
    with check (public.current_role() = 'admin');

-- ────────────────────────────────────────────────────────────────
-- collection_points: read own community, dispatcher/admin write
-- ────────────────────────────────────────────────────────────────
alter table public.collection_points enable row level security;

create policy "collection_points: read own community"
    on public.collection_points for select
    using (community_id = public.current_community_id());

create policy "collection_points: dispatcher write"
    on public.collection_points for all
    using (
        community_id = public.current_community_id()
        and public.current_role() in ('dispatcher', 'admin')
    )
    with check (
        community_id = public.current_community_id()
        and public.current_role() in ('dispatcher', 'admin')
    );

-- ────────────────────────────────────────────────────────────────
-- complaints: residents insert + read own; dispatcher/admin read+update all in community
-- ────────────────────────────────────────────────────────────────
alter table public.complaints enable row level security;

create policy "complaints: resident read own community"
    on public.complaints for select
    using (community_id = public.current_community_id());

create policy "complaints: resident insert own community"
    on public.complaints for insert
    with check (
        community_id = public.current_community_id()
        and reporter_id = auth.uid()
    );

create policy "complaints: dispatcher update"
    on public.complaints for update
    using (
        community_id = public.current_community_id()
        and public.current_role() in ('dispatcher', 'admin')
    )
    with check (
        community_id = public.current_community_id()
        and public.current_role() in ('dispatcher', 'admin')
    );

create policy "complaints: admin delete"
    on public.complaints for delete
    using (
        community_id = public.current_community_id()
        and public.current_role() = 'admin'
    );

-- ────────────────────────────────────────────────────────────────
-- cv_classifications: insert by any authenticated user, read by community
-- ────────────────────────────────────────────────────────────────
alter table public.cv_classifications enable row level security;

create policy "cv_classifications: read own community"
    on public.cv_classifications for select
    using (community_id is null or community_id = public.current_community_id());

create policy "cv_classifications: insert authenticated"
    on public.cv_classifications for insert
    with check (auth.uid() is not null);

/*
-- DOWN
drop policy if exists "cv_classifications: insert authenticated" on public.cv_classifications;
drop policy if exists "cv_classifications: read own community"   on public.cv_classifications;
drop policy if exists "complaints: admin delete"                 on public.complaints;
drop policy if exists "complaints: dispatcher update"            on public.complaints;
drop policy if exists "complaints: resident insert own community" on public.complaints;
drop policy if exists "complaints: resident read own community"  on public.complaints;
drop policy if exists "collection_points: dispatcher write"      on public.collection_points;
drop policy if exists "collection_points: read own community"    on public.collection_points;
drop policy if exists "waste_categories: admin write"            on public.waste_categories;
drop policy if exists "waste_categories: read all"               on public.waste_categories;
drop policy if exists "profiles: admin manage community"         on public.profiles;
drop policy if exists "profiles: update self"                    on public.profiles;
drop policy if exists "profiles: insert self"                    on public.profiles;
drop policy if exists "profiles: read own community"             on public.profiles;
drop policy if exists "communities: read own"                    on public.communities;
alter table public.cv_classifications disable row level security;
alter table public.complaints         disable row level security;
alter table public.collection_points  disable row level security;
alter table public.waste_categories   disable row level security;
alter table public.profiles           disable row level security;
alter table public.communities        disable row level security;
drop function if exists public.current_role();
drop function if exists public.current_community_id();
*/
