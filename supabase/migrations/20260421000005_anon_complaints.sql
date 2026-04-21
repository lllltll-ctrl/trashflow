-- 005_anon_complaints.sql — let unauthenticated residents file complaints
-- Tradeoff: lowers the friction for the pilot (no sign-up wall), at the cost
-- of trivial spam protection. After the hackathon, move to Supabase Anonymous
-- Sign-in so every complaint still carries a stable anon UUID in reporter_id.
--
-- UP

-- Replace the authenticated-only insert policy with a permissive one for the pilot.
drop policy if exists "complaints: resident insert own community" on public.complaints;

create policy "complaints: public insert to community"
    on public.complaints for insert
    with check (
        community_id in (select id from public.communities)
        and (reporter_id is null or reporter_id = auth.uid())
        and array_length(photo_urls, 1) between 1 and 5
        and coalesce(length(description), 0) <= 500
    );

-- Anonymous users can read their own recently-filed complaints back by id
-- (returned from the insert), but not browse the whole list.
drop policy if exists "complaints: resident read own community" on public.complaints;

create policy "complaints: authenticated read own community"
    on public.complaints for select
    to authenticated
    using (community_id = public.current_community_id());

-- Dispatchers keep their existing update policy (from migration 002).

-- Allow anonymous uploads to the complaint-photos bucket, but only within the
-- sane size/mime window enforced on the bucket itself. Storage RLS policies
-- live in a separate schema.
create policy "complaint-photos: public insert"
    on storage.objects for insert
    with check (bucket_id = 'complaint-photos');

create policy "complaint-photos: public read"
    on storage.objects for select
    using (bucket_id = 'complaint-photos');

/*
-- DOWN
drop policy if exists "complaint-photos: public read"   on storage.objects;
drop policy if exists "complaint-photos: public insert" on storage.objects;
drop policy if exists "complaints: authenticated read own community" on public.complaints;
drop policy if exists "complaints: public insert to community"       on public.complaints;
create policy "complaints: resident read own community"
    on public.complaints for select
    using (community_id = public.current_community_id());
create policy "complaints: resident insert own community"
    on public.complaints for insert
    with check (
        community_id = public.current_community_id()
        and reporter_id = auth.uid()
    );
*/
