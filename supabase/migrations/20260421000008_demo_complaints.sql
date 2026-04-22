-- 008_demo_complaints.sql — 20 synthetic complaints spread across Pryluky
-- Purpose: give the admin dashboard a realistic-looking heatmap + feed +
-- filter table for local demos and the Day 1 rehearsal. Hot spots are
-- clustered around three problem districts (Дружби, Центр, Промзона)
-- so the heatmap visibly highlights them.
--
-- Delete everything here before any real pilot complaint arrives so the
-- Pryluky rep sees their own data, not our fixtures.
--
-- UP

-- Clear any prior demo fixtures before reseeding.
delete from public.complaints
where community_id = '00000000-0000-0000-0000-000000000001'
  and reporter_id is null
  and description like 'DEMO:%';

insert into public.complaints
    (community_id, reporter_id, location, photo_urls, category_id, description, status, created_at, resolved_at)
values
    -- Hot spot #1: Дружби district (5 complaints, mostly new/in-progress)
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.4025, 50.5970)::geography,
     array['https://picsum.photos/seed/pr1/640/480'],
     'plastic',
     'DEMO: мікрорайон Дружби — купа пластикових пляшок біля школи',
     'new', now() - interval '3 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.4030, 50.5975)::geography,
     array['https://picsum.photos/seed/pr2/640/480'],
     null,
     'DEMO: Дружби — звалище сміття між будинками 12 і 14',
     'new', now() - interval '9 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.4018, 50.5965)::geography,
     array['https://picsum.photos/seed/pr3/640/480'],
     'paper',
     'DEMO: Дружби — великі коробки біля магазину',
     'assigned', now() - interval '1 day', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.4033, 50.5968)::geography,
     array['https://picsum.photos/seed/pr4/640/480'],
     'hazardous',
     'DEMO: Дружби — будівельне сміття і старі акумулятори',
     'in_progress', now() - interval '2 days', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.4040, 50.5980)::geography,
     array['https://picsum.photos/seed/pr5/640/480'],
     'plastic',
     'DEMO: Дружби — переповнений контейнер',
     'resolved', now() - interval '5 days', now() - interval '4 days'),

    -- Hot spot #2: Центр (вул. Київська / ринок) — 4 complaints
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3915, 50.5955)::geography,
     array['https://picsum.photos/seed/pr6/640/480'],
     'glass',
     'DEMO: біля ринку — розбите скло на тротуарі',
     'new', now() - interval '6 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3922, 50.5962)::geography,
     array['https://picsum.photos/seed/pr7/640/480'],
     'paper',
     'DEMO: Київська — картонні коробки після супермаркету',
     'in_progress', now() - interval '1 day 6 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3930, 50.5948)::geography,
     array['https://picsum.photos/seed/pr8/640/480'],
     null,
     'DEMO: Центр — переповнена урна біля зупинки',
     'resolved', now() - interval '3 days', now() - interval '2 days 20 hours'),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3908, 50.5970)::geography,
     array['https://picsum.photos/seed/pr9/640/480'],
     'metal',
     'DEMO: Центр — старі батареї опалення',
     'rejected', now() - interval '8 days', null),

    -- Hot spot #3: Промзона (Садова / Переяславська) — 4 complaints
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3850, 50.5890)::geography,
     array['https://picsum.photos/seed/pr10/640/480'],
     'metal',
     'DEMO: Садова — купа металобрухту біля гаражів',
     'new', now() - interval '12 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3860, 50.5895)::geography,
     array['https://picsum.photos/seed/pr11/640/480'],
     'hazardous',
     'DEMO: промзона — розлиті мастила і старі шини',
     'in_progress', now() - interval '2 days 4 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3872, 50.5902)::geography,
     array['https://picsum.photos/seed/pr12/640/480'],
     'plastic',
     'DEMO: Переяславська — викинутий поліетилен',
     'assigned', now() - interval '18 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3845, 50.5885)::geography,
     array['https://picsum.photos/seed/pr13/640/480'],
     null,
     'DEMO: промзона — загальне звалище будівельного сміття',
     'resolved', now() - interval '10 days', now() - interval '7 days'),

    -- Scattered single complaints across the city (7 more)
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3982, 50.5928)::geography,
     array['https://picsum.photos/seed/pr14/640/480'],
     'plastic',
     'DEMO: Незалежності — пляшки біля дитячого майданчика',
     'new', now() - interval '5 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3870, 50.5945)::geography,
     array['https://picsum.photos/seed/pr15/640/480'],
     'paper',
     'DEMO: Соборна — розвіяні газети',
     'resolved', now() - interval '12 days', now() - interval '10 days'),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3990, 50.5985)::geography,
     array['https://picsum.photos/seed/pr16/640/480'],
     'hazardous',
     'DEMO: Переяславська — старий телевізор і монітор',
     'new', now() - interval '2 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3900, 50.6010)::geography,
     array['https://picsum.photos/seed/pr17/640/480'],
     'glass',
     'DEMO: північ міста — скляні пляшки після свята',
     'assigned', now() - interval '1 day 3 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3805, 50.5830)::geography,
     array['https://picsum.photos/seed/pr18/640/480'],
     'metal',
     'DEMO: Артема — викинутий холодильник',
     'in_progress', now() - interval '3 days 10 hours', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.4100, 50.5900)::geography,
     array['https://picsum.photos/seed/pr19/640/480'],
     null,
     'DEMO: околиці — старі меблі біля дороги',
     'rejected', now() - interval '15 days', null),
    ('00000000-0000-0000-0000-000000000001', null,
     st_makepoint(32.3940, 50.5990)::geography,
     array['https://picsum.photos/seed/pr20/640/480'],
     'plastic',
     'DEMO: центральний парк — пакети після пікніка',
     'resolved', now() - interval '6 days', now() - interval '5 days 4 hours');

/*
-- DOWN
delete from public.complaints
where community_id = '00000000-0000-0000-0000-000000000001'
  and reporter_id is null
  and description like 'DEMO:%';
*/
