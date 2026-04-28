-- 009_tighten_cv_classifications_rls.sql
-- Tighten the cv_classifications insert policy: previously any authenticated
-- user could insert with arbitrary community_id. Now writes must either omit
-- community_id (global / pre-association) or match the writer's own community.
--
-- UP

drop policy if exists "cv_classifications: insert authenticated" on public.cv_classifications;

create policy "cv_classifications: insert own community"
    on public.cv_classifications for insert
    to authenticated
    with check (
        auth.uid() is not null
        and (community_id is null or community_id = public.current_community_id())
    );

/*
-- DOWN
drop policy if exists "cv_classifications: insert own community" on public.cv_classifications;
create policy "cv_classifications: insert authenticated"
    on public.cv_classifications for insert
    with check (auth.uid() is not null);
*/
