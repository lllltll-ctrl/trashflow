-- 023_fix_points_nearby_overload.sql
-- PostgREST PGRST203: two overloaded versions of points_nearby exist.
-- Drop the old 5-param version; keep only the 6-param one that includes
-- p_community_slug so PostgREST can resolve it unambiguously.
--
-- UP

set local search_path = public, extensions;

drop function if exists public.points_nearby(
    double precision, double precision, text, integer, integer
);
