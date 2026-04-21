-- 006_seed_pryluky_osm.sql — real Pryluky collection points
-- Source: OpenStreetMap Overpass API (amenity=waste_disposal, radius 15km from
-- Pryluky center, queried 2026-04-22). OSM currently has 6 generic disposal
-- points around Pryluky and none of them tag the recycling subcategories,
-- so we insert them as mixed-use containers. Category-specific drop-offs
-- below are realistic placeholders keyed to central Pryluky streets; the
-- live list will be confirmed with КП "Прилуки-Чисто" on Day 1 of the
-- hackathon and this migration will be superseded (or extended) with the
-- verified data.
--
-- UP

-- Wipe the 3-point stub from supabase/seed.sql. We'll replace it with real data.
delete from public.collection_points
where community_id = '00000000-0000-0000-0000-000000000001'
  and name like 'Пункт прийому ПЕТ — вул. Київська'
     or name like 'Контейнер для скла — ринок'
     or name like 'Пункт прийому батарейок — гімназія №1';

-- ────────────────────────────────────────────────────────────────
-- OSM waste_disposal nodes (6 real points)
-- ────────────────────────────────────────────────────────────────
insert into public.collection_points (community_id, name, location, address, accepts, schedule) values
  ('00000000-0000-0000-0000-000000000001',
   'Контейнер побутових відходів — східний район',
   st_makepoint(32.4133305, 50.5915724)::geography,
   'Східна частина Прилук (OSM node 6831083822)',
   array['plastic', 'paper', 'metal', 'glass']::text[],
   '{"mon-sun":"24/7"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001',
   'Контейнер побутових відходів — пров. Переможний',
   st_makepoint(32.3864032, 50.4606651)::geography,
   'Південні Прилуки (OSM node 11528586468)',
   array['plastic', 'paper', 'metal', 'glass']::text[],
   '{"mon-sun":"24/7"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001',
   'Контейнер побутових відходів — вул. Михайлівська',
   st_makepoint(32.3942968, 50.4652977)::geography,
   'Михайлівська, південний масив (OSM node 11528837169)',
   array['plastic', 'paper', 'metal', 'glass']::text[],
   '{"mon-sun":"24/7"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001',
   'Контейнер побутових відходів — пров. Горького',
   st_makepoint(32.3826936, 50.4631364)::geography,
   'Провулок Горького (OSM node 11528837170)',
   array['plastic', 'paper', 'metal', 'glass']::text[],
   '{"mon-sun":"24/7"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001',
   'Контейнер побутових відходів — вул. Артема',
   st_makepoint(32.3804772, 50.4698506)::geography,
   'Вул. Артема (OSM node 11528837173)',
   array['plastic', 'paper', 'metal', 'glass']::text[],
   '{"mon-sun":"24/7"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001',
   'Контейнер побутових відходів — вул. Сковороди',
   st_makepoint(32.3795151, 50.4737076)::geography,
   'Вул. Сковороди (OSM node 11528837174)',
   array['plastic', 'paper', 'metal', 'glass']::text[],
   '{"mon-sun":"24/7"}'::jsonb);

-- ────────────────────────────────────────────────────────────────
-- Placeholder specialty points along central Pryluky streets.
-- TODO(hackathon Day 1): replace with confirmed data from КП "Прилуки-Чисто".
-- ────────────────────────────────────────────────────────────────
insert into public.collection_points (community_id, name, location, address, accepts, schedule) values
  ('00000000-0000-0000-0000-000000000001',
   'Пункт прийому ПЕТ — вул. Київська',
   st_makepoint(32.3920, 50.5960)::geography,
   'вул. Київська, 78 (центр)',
   array['plastic']::text[],
   '{"mon":"9-17","tue":"9-17","wed":"9-17","thu":"9-17","fri":"9-17"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001',
   'Пункт прийому скла — Центральний ринок',
   st_makepoint(32.3910, 50.5950)::geography,
   'Центральний ринок, вхід з вул. Шевченка',
   array['glass']::text[],
   '{"mon-sun":"8-20"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001',
   'Прийом батарейок — гімназія №1',
   st_makepoint(32.3830, 50.5960)::geography,
   'вул. Соборна, гімназія №1',
   array['hazardous']::text[],
   '{"mon":"8-18","tue":"8-18","wed":"8-18","thu":"8-18","fri":"8-18"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001',
   'Прийом макулатури — вул. Незалежності',
   st_makepoint(32.3985, 50.5925)::geography,
   'вул. Незалежності (біля пошти)',
   array['paper']::text[],
   '{"mon":"9-18","tue":"9-18","wed":"9-18","thu":"9-18","fri":"9-18","sat":"10-14"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001',
   'Прийом металу — вул. Садова',
   st_makepoint(32.3856, 50.5895)::geography,
   'вул. Садова (промзона)',
   array['metal']::text[],
   '{"mon":"8-17","tue":"8-17","wed":"8-17","thu":"8-17","fri":"8-17"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001',
   'Еко-точка — вул. Переяславська',
   st_makepoint(32.3975, 50.5985)::geography,
   'вул. Переяславська (супермаркет)',
   array['plastic', 'paper', 'metal', 'glass', 'hazardous']::text[],
   '{"mon-sun":"8-22"}'::jsonb);

/*
-- DOWN
delete from public.collection_points
where community_id = '00000000-0000-0000-0000-000000000001';
*/
