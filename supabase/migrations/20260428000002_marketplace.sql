-- 020_marketplace.sql
-- Free-only community marketplace ("Барахолка"): residents post unwanted
-- items (electronics, furniture, clothes, books, toys) and neighbours can
-- pick them up — anti-landfill in spirit, fits the trash-management product.
--
-- Design notes:
-- - Anonymous posting allowed (no auth needed) so adoption is frictionless.
--   Author identity is the (contact_name, contact_phone) pair displayed
--   publicly. Anti-spam is out of scope for v1; relies on community
--   moderation via dispatcher.
-- - Each post returns a one-time edit_token in the response that the user
--   keeps to mark the item "taken" later. Without it they can't change
--   anything (so a stranger can't flip someone else's listing).
-- - Auto-expiry 30 days via expires_at — old items stop appearing in the
--   list. We don't hard-delete (history may be useful).
--
-- UP

-- The CLI session doesn't include `extensions` on its search_path, so unqualified
-- uuid_generate_v4() / gen_random_bytes() fail. Pin the search path explicitly
-- for the duration of this migration.
set local search_path = public, extensions;

create table if not exists public.marketplace_items (
    id            uuid primary key default uuid_generate_v4(),
    community_id  uuid not null references public.communities(id) on delete cascade,
    title         text not null,
    description   text,
    category      text not null default 'other'
        check (category in ('electronics','furniture','clothes','books','toys','other')),
    contact_name  text not null,
    contact_phone text not null,
    edit_token    text unique not null,
    status        text not null default 'available'
        check (status in ('available','taken','expired')),
    posted_by_user_id uuid references auth.users(id) on delete set null,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    expires_at    timestamptz not null default (now() + interval '30 days')
);

create index marketplace_items_feed_idx
    on public.marketplace_items (community_id, status, created_at desc)
    where status = 'available';
create index marketplace_items_category_idx
    on public.marketplace_items (community_id, category, created_at desc)
    where status = 'available';
create index marketplace_items_expiry_idx
    on public.marketplace_items (expires_at)
    where status = 'available';

create trigger marketplace_items_set_updated_at
    before update on public.marketplace_items
    for each row execute function public.set_updated_at();

alter table public.marketplace_items enable row level security;

-- All reads go through the RPC; direct row access is denied for safety.
create policy "marketplace_items: dispatcher full access"
    on public.marketplace_items for all
    using (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'))
    with check (community_id = public.current_community_id() and public.current_role() in ('dispatcher','admin'));

-- ──────────────────────────────────────────────────────────────────────────
-- RPC: marketplace_post — anonymous insert. Returns the new id + edit_token.
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.marketplace_post(
    p_title         text,
    p_description   text,
    p_category      text,
    p_contact_name  text,
    p_contact_phone text,
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
    v_token     text := encode(gen_random_bytes(12), 'hex');
begin
    if length(coalesce(trim(p_title), '')) < 3 then
        raise exception 'Назва товару — обов''язкова (мінімум 3 символи)';
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
        (community_id, title, description, category, contact_name, contact_phone, edit_token)
    values (
        v_community,
        trim(p_title),
        nullif(trim(coalesce(p_description, '')), ''),
        p_category,
        trim(p_contact_name),
        trim(p_contact_phone),
        v_token
    )
    returning marketplace_items.id into v_id;

    return query select v_id, v_token;
end;
$fn$;

grant execute on function public.marketplace_post(text, text, text, text, text, text) to anon, authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- RPC: marketplace_list — public read of available items, optional category
-- filter, paginated by created_at desc. No phone or edit_token returned in
-- the list — those only show up on the detail RPC.
-- ──────────────────────────────────────────────────────────────────────────
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
    created_at    timestamptz,
    expires_at    timestamptz
)
language sql
stable
security definer
set search_path = public
as $fn$
    with c as (select id from public.communities where slug = p_community_slug limit 1)
    select
        m.id, m.title, m.description, m.category,
        m.contact_name, m.created_at, m.expires_at
    from public.marketplace_items m, c
    where m.community_id = c.id
      and m.status = 'available'
      and m.expires_at > now()
      and (p_category is null or m.category = p_category)
    order by m.created_at desc
    limit greatest(1, least(p_limit, 200));
$fn$;

grant execute on function public.marketplace_list(text, text, int) to anon, authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- RPC: marketplace_get_one — full detail incl. phone (which is the whole
-- point of the marketplace — the visitor wants to call the donor).
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.marketplace_get_one(p_id uuid)
returns table (
    id            uuid,
    title         text,
    description   text,
    category      text,
    contact_name  text,
    contact_phone text,
    status        text,
    created_at    timestamptz,
    expires_at    timestamptz
)
language sql
stable
security definer
set search_path = public
as $fn$
    select id, title, description, category, contact_name, contact_phone, status, created_at, expires_at
    from public.marketplace_items
    where id = p_id
    limit 1;
$fn$;

grant execute on function public.marketplace_get_one(uuid) to anon, authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- RPC: marketplace_mark_taken — author flips status='taken' with their token.
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.marketplace_mark_taken(p_id uuid, p_edit_token text)
returns table (id uuid, status text)
language plpgsql
security definer
set search_path = public
as $fn$
declare
    v_status text;
begin
    update public.marketplace_items
       set status = 'taken'
     where id = p_id and edit_token = p_edit_token and status = 'available'
    returning status into v_status;
    if v_status is null then
        raise exception 'Невірний токен або товар уже знятий';
    end if;
    return query select p_id, v_status;
end;
$fn$;

grant execute on function public.marketplace_mark_taken(uuid, text) to anon, authenticated;

-- Seed two sample listings so the page isn't empty on first load.
insert into public.marketplace_items
    (community_id, title, description, category, contact_name, contact_phone, edit_token)
values
    (
        '00000000-0000-0000-0000-000000000001',
        'Старий монітор Samsung 22"',
        'Працює, без подряпин. Кабель VGA в комплекті. Самовивіз з вул. Київська.',
        'electronics',
        'Олена',
        '+380671234567',
        encode(gen_random_bytes(12), 'hex')
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Дитячі книжки 1-4 клас',
        'Підручники + збірки казок. Стан: б/в, кілька — як нові. Близько 30 шт.',
        'books',
        'Ігор',
        '+380502345678',
        encode(gen_random_bytes(12), 'hex')
    );
