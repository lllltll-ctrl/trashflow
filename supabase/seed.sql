-- seed.sql — development-time fixture data
-- Pryluky hromada + waste categories + sample collection points.
-- Real collection points are populated via packages/db/src/seed-pryluky.ts
-- after scraping from OSM + city website (Day 5 per plan).

insert into public.waste_categories (id, name_ua, description, hazard_level) values
    ('plastic',   'Пластик',           'ПЕТ, поліетилен, упаковка',                 0),
    ('paper',     'Папір і картон',    'Газети, картонні коробки, офісний папір',   0),
    ('glass',     'Скло',              'Пляшки, банки скляні',                       0),
    ('metal',     'Метал',             'Алюмінієві банки, дріт, метал',              0),
    ('hazardous', 'Небезпечні',        'Батарейки, лампи, електроніка, хімікати',   3)
on conflict (id) do update
    set name_ua = excluded.name_ua,
        description = excluded.description,
        hazard_level = excluded.hazard_level;

insert into public.communities (id, slug, name, region)
values (
    '00000000-0000-0000-0000-000000000001',
    'pryluky',
    'Прилуцька міська територіальна громада',
    'Чернігівська область'
)
on conflict (slug) do nothing;

-- Placeholder: 3 sample collection points near Pryluky center (50.5942, 32.3874).
-- Real data comes in migration 004 on Day 5.
insert into public.collection_points (community_id, name, location, address, accepts, schedule)
values
    (
        '00000000-0000-0000-0000-000000000001',
        'Пункт прийому ПЕТ — вул. Київська',
        st_makepoint(32.3874, 50.5942)::geography,
        'вул. Київська, 78',
        array['plastic', 'metal']::text[],
        '{"mon":"9-17","tue":"9-17","wed":"9-17","thu":"9-17","fri":"9-17"}'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Контейнер для скла — ринок',
        st_makepoint(32.3910, 50.5950)::geography,
        'Центральний ринок, вхід з вул. Шевченка',
        array['glass']::text[],
        '{"mon-sun":"24/7"}'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Пункт прийому батарейок — гімназія №1',
        st_makepoint(32.3830, 50.5960)::geography,
        'Прилуцька гімназія №1',
        array['hazardous']::text[],
        '{"mon":"8-18","tue":"8-18","wed":"8-18","thu":"8-18","fri":"8-18"}'::jsonb
    )
on conflict do nothing;
