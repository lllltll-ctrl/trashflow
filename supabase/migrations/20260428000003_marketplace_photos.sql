-- 021_marketplace_photos.sql
-- Adds photo support to the community marketplace:
--   1. photo_url column on marketplace_items
--   2. public 'marketplace-photos' storage bucket (anon-writable so unsigned
--      residents can post; 5MB cap so we don't accidentally host a video)
--   3. updated marketplace_post / list / get_one RPCs that round-trip the URL
--
-- Anonymous write into public bucket is the same trust model as the post
-- RPC itself — anyone can post, dispatcher moderates if abuse appears.
--
-- UP

set local search_path = public, extensions;

alter table public.marketplace_items
    add column if not exists photo_url text;

-- ──────────────────────────────────────────────────────────────────────────
-- Storage bucket — public read, anon write, JPEG/PNG/WebP only, 5 MB cap.
-- ──────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
    (
        'marketplace-photos',
        'marketplace-photos',
        true,
        5 * 1024 * 1024,
        array['image/jpeg', 'image/png', 'image/webp']
    )
on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

create policy "marketplace-photos: public read"
    on storage.objects for select
    using (bucket_id = 'marketplace-photos');

create policy "marketplace-photos: anon write"
    on storage.objects for insert
    with check (bucket_id = 'marketplace-photos');

-- ──────────────────────────────────────────────────────────────────────────
-- Updated RPCs. We keep the old signatures alive (Postgres allows function
-- overloading by signature) but drop them explicitly so PostgREST doesn't
-- get confused which to call from the JSON body.
-- ──────────────────────────────────────────────────────────────────────────

drop function if exists public.marketplace_post(text, text, text, text, text, text);
drop function if exists public.marketplace_list(text, text, int);
drop function if exists public.marketplace_get_one(uuid);

create or replace function public.marketplace_post(
    p_title         text,
    p_description   text,
    p_category      text,
    p_contact_name  text,
    p_contact_phone text,
    p_photo_url     text default null,
    p_community_slug text default 'pryluky'
)
returns table (id uuid, edit_token text)
language plpgsql
security definer
set search_path = public
as $fn$
declare
    v_community uuid;
    v_id        uuid;
    v_token     text := encode(extensions.gen_random_bytes(12), 'hex');
begin
    if length(coalesce(trim(p_title), '')) < 3 then
        raise exception 'Назва товару — обовʼязкова (мінімум 3 символи)';
    end if;
    if length(coalesce(trim(p_contact_name), '')) < 2 then
        raise exception 'Імʼя — обовʼязкове';
    end if;
    if length(coalesce(trim(p_contact_phone), '')) < 6 then
        raise exception 'Телефон — обовʼязковий';
    end if;
    if p_category not in ('electronics','furniture','clothes','books','toys','other') then
        raise exception 'Невідома категорія: %', p_category;
    end if;

    select id into v_community from public.communities where slug = p_community_slug limit 1;
    if v_community is null then
        raise exception 'Громаду % не знайдено', p_community_slug;
    end if;

    insert into public.marketplace_items
        (community_id, title, description, category, contact_name, contact_phone, edit_token, photo_url)
    values (
        v_community, trim(p_title),
        nullif(trim(coalesce(p_description, '')), ''),
        p_category, trim(p_contact_name), trim(p_contact_phone), v_token,
        nullif(trim(coalesce(p_photo_url, '')), '')
    )
    returning marketplace_items.id into v_id;

    return query select v_id, v_token;
end;
$fn$;

grant execute on function public.marketplace_post(text, text, text, text, text, text, text) to anon, authenticated;

create or replace function public.marketplace_list(
    p_community_slug text default 'pryluky',
    p_category       text default null,
    p_limit          int  default 50
)
returns table (
    id            uuid,
    title         text,
    description   text,
    category      text,
    contact_name  text,
    photo_url     text,
    created_at    timestamptz,
    expires_at    timestamptz
)
language sql stable security definer set search_path = public
as $fn$
    with c as (select id from public.communities where slug = p_community_slug limit 1)
    select m.id, m.title, m.description, m.category, m.contact_name, m.photo_url, m.created_at, m.expires_at
    from public.marketplace_items m, c
    where m.community_id = c.id and m.status = 'available' and m.expires_at > now()
      and (p_category is null or m.category = p_category)
    order by m.created_at desc
    limit greatest(1, least(p_limit, 200));
$fn$;
grant execute on function public.marketplace_list(text, text, int) to anon, authenticated;

create or replace function public.marketplace_get_one(p_id uuid)
returns table (
    id uuid, title text, description text, category text,
    contact_name text, contact_phone text, photo_url text, status text,
    created_at timestamptz, expires_at timestamptz
)
language sql stable security definer set search_path = public
as $fn$
    select id, title, description, category, contact_name, contact_phone, photo_url, status, created_at, expires_at
    from public.marketplace_items where id = p_id limit 1;
$fn$;
grant execute on function public.marketplace_get_one(uuid) to anon, authenticated;
