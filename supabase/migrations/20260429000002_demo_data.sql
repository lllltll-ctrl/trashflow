-- 20260429000002_demo_data.sql
-- Demo data for the admin panel: support_messages + extra marketplace_items.
-- complaints (20), households (50), bins (67), bin_readings (3350) and
-- pickup_schedules (9) already have realistic data — do not touch them here.
--
-- UP

set local search_path = public, extensions;

do $$ declare
    v_community_id uuid;
begin
    select id into v_community_id
    from public.communities
    where slug = 'pryluky'
    limit 1;

    if v_community_id is null then
        raise exception 'Community pryluky not found — run seed.sql first';
    end if;

    -- ──────────────────────────────────────────────────────────────────────
    -- SUPPORT MESSAGES — 8 realistic Ukrainian messages
    -- Statuses: new (3), read (2), replied (3)
    -- Types: question (4), feedback (3), other (1)
    -- ──────────────────────────────────────────────────────────────────────
    insert into public.support_messages
        (community_id, name, email, type, message, status, reply, replied_at, created_at)
    values

    -- 1. question / new
    (v_community_id,
     'Олена Кравченко',
     'o.kravchenko@ukr.net',
     'question',
     'Доброго дня! Хочу дізнатись, де знаходиться найближчий пункт прийому пластику до вулиці Мазепи? На карті відображається контейнер, але фізично я його не знаходжу.',
     'new', null, null,
     now() - interval '2 hours'),

    -- 2. question / new
    (v_community_id,
     'Василь Петренко',
     'vasyl.petrenko@gmail.com',
     'question',
     'Як підключити мій будинок до програми PAYT (платиш за що викидаєш)? Хочемо сортувати відходи та економити на комунальних послугах.',
     'new', null, null,
     now() - interval '5 hours'),

    -- 3. feedback / new
    (v_community_id,
     'Тетяна Мороз',
     'tmoroz@meta.ua',
     'feedback',
     'Дуже задоволена новим додатком! Нарешті можна зручно повідомити про стихійне сміттєзвалище. Подала скаргу вчора — сьогодні вже прибрали. Дякую команді!',
     'new', null, null,
     now() - interval '8 hours'),

    -- 4. question / read
    (v_community_id,
     'Микола Бойченко',
     'mykola.b@pryluky.gov.ua',
     'question',
     'Доброго ранку. Маю питання щодо графіку вивезення крупногабаритного сміття у мікрорайоні Дружби. Останній раз вивозили два тижні тому, у нас вже переповнений майданчик.',
     'read', null, null,
     now() - interval '1 day 3 hours'),

    -- 5. feedback / read
    (v_community_id,
     'Ірина Савченко',
     'i.savchenko@ukrnet.net',
     'feedback',
     'Пропоную додати можливість підписатись на сповіщення про зміну статусу скарги. Я подала заявку три дні тому і не знаю, чи її розглянули. Статус «в роботі» з''явився, але жодного повідомлення не отримала.',
     'read', null, null,
     now() - interval '2 days 6 hours'),

    -- 6. question / replied
    (v_community_id,
     'Андрій Коваль',
     'andrii.koval@gmail.com',
     'question',
     'Чи можна здати старий телевізор і зламаний ноутбук? Де знаходиться пункт прийому небезпечної електроніки у Прилуках?',
     'replied',
     'Доброго дня, Андрію! Пункт прийому небезпечних відходів та електроніки знаходиться за адресою вул. Київська, 112 (КП «Прилуки-Чисто»). Режим роботи: пн–пт 8:00–17:00, сб 9:00–14:00. Великогабаритну техніку можна здати безкоштовно за наявності паспорту.',
     now() - interval '3 days',
     now() - interval '4 days'),

    -- 7. feedback / replied
    (v_community_id,
     'Людмила Яременко',
     'lyudmyla.y@ukr.net',
     'feedback',
     'Хочу подякувати диспетчеру Оксані за швидке реагування на мою скаргу про сміттєвий майданчик на вул. Садовій. Все прибрали за день. Ось би так завжди!',
     'replied',
     'Людмило, дякуємо за добрі слова! Передамо подяку команді. Продовжуємо працювати для чистоти нашої громади.',
     now() - interval '5 days 12 hours',
     now() - interval '7 days'),

    -- 8. other / replied
    (v_community_id,
     'Сергій Ткаченко',
     's.tkachenko@chernihiv.ua',
     'other',
     'Наша школа (ЗОШ №3) хоче долучитись до програми роздільного збору. Чи є якась програма для навчальних закладів? Хотіли б встановити окремі контейнери для пластику та паперу на шкільному подвір''ї.',
     'replied',
     'Сергію, дякуємо за ініціативу! Так, у нас є програма «Еко-школа». Зверніться до відділу комунального господарства за тел. (04637) 5-12-34 або напишіть на email eko@pryluky.gov.ua. Контейнери надаються безкоштовно для навчальних закладів.',
     now() - interval '8 days',
     now() - interval '10 days');

    -- ──────────────────────────────────────────────────────────────────────
    -- MARKETPLACE ITEMS — 10 extra listings (2 already exist from migration 020)
    -- Mix of categories and statuses
    -- ──────────────────────────────────────────────────────────────────────
    insert into public.marketplace_items
        (community_id, title, description, category, contact_name, contact_phone,
         edit_token, status, created_at, expires_at)
    values

    (v_community_id,
     'Диван-ліжко розкладний',
     'Стан задовільний, механізм роботи відмінний. Колір бежевий. Самовивіз з вул. Артема. Допоможу навантажити.',
     'furniture', 'Наталія', '+380931112233',
     encode(gen_random_bytes(12), 'hex'), 'available',
     now() - interval '1 day', now() + interval '29 days'),

    (v_community_id,
     'Велосипед дитячий 20" (7-10 років)',
     'Мало їздили, синок виріс. Є невеликі подряпини на рамі, все функціонує. Вул. Переяславська.',
     'other', 'Дмитро', '+380671234001',
     encode(gen_random_bytes(12), 'hex'), 'available',
     now() - interval '2 days', now() + interval '28 days'),

    (v_community_id,
     'Шафа-купе дзеркальна 2-секційна',
     'Висота 220 см, ширина 160 см. Потребує розбирання. Дзеркала цілі. Самовивіз, вул. Соборна.',
     'furniture', 'Оксана', '+380501234567',
     encode(gen_random_bytes(12), 'hex'), 'available',
     now() - interval '3 days', now() + interval '27 days'),

    (v_community_id,
     'Навчальні підручники 5-й клас (2025 рік)',
     'Повний комплект: математика, українська, англійська, природознавство, ін. Стан відмінний.',
     'books', 'Марина', '+380951234890',
     encode(gen_random_bytes(12), 'hex'), 'available',
     now() - interval '4 days', now() + interval '26 days'),

    (v_community_id,
     'Пральна машина LG 5 кг',
     'Не ремонтувалась, причина — переїзд. Рік випуску 2019. Все програми працюють. Є невеликий шум при віджимі.',
     'electronics', 'Роман', '+380631234777',
     encode(gen_random_bytes(12), 'hex'), 'available',
     now() - interval '5 days', now() + interval '25 days'),

    (v_community_id,
     'Набір кастрюль (6 шт.) нержавіюча сталь',
     'Комплект для сім''ї. Усі кришки є. Незначний нальот від довгого зберігання, відмиється.',
     'other', 'Ганна', '+380671239988',
     encode(gen_random_bytes(12), 'hex'), 'available',
     now() - interval '6 days', now() + interval '24 days'),

    (v_community_id,
     'Дитячий одяг 3-4 роки (дівчинка)',
     'Близько 20 предметів: штани, кофти, сукні, куртка весняна. Стан гарний. Вул. Шевченка.',
     'clothes', 'Людмила', '+380501118899',
     encode(gen_random_bytes(12), 'hex'), 'available',
     now() - interval '7 days', now() + interval '23 days'),

    (v_community_id,
     'Конструктор LEGO Technic (400+ деталей)',
     'Всі деталі є (перевірено), інструкція в наявності. Хлопчик переріс. Вул. Незалежності.',
     'toys', 'Степан', '+380971234321',
     encode(gen_random_bytes(12), 'hex'), 'available',
     now() - interval '9 days', now() + interval '21 days'),

    -- 2 already-taken items (realistic history)
    (v_community_id,
     'Мікрохвильова піч Samsug 20L',
     'Стан робочий, без запаху. Самовивіз.',
     'electronics', 'Петро', '+380631111222',
     encode(gen_random_bytes(12), 'hex'), 'taken',
     now() - interval '15 days', now() + interval '15 days'),

    (v_community_id,
     'Зимові чоботи жіночі 38 розмір',
     'Носились один сезон. Натуральна шкіра, на хутрі.',
     'clothes', 'Вікторія', '+380951119988',
     encode(gen_random_bytes(12), 'hex'), 'taken',
     now() - interval '20 days', now() + interval '10 days');

end $$;

/*
-- DOWN (manual rollback)
delete from public.support_messages
where community_id = (select id from public.communities where slug = 'pryluky')
  and email in (
      'o.kravchenko@ukr.net', 'vasyl.petrenko@gmail.com', 'tmoroz@meta.ua',
      'mykola.b@pryluky.gov.ua', 'i.savchenko@ukrnet.net', 'andrii.koval@gmail.com',
      'lyudmyla.y@ukr.net', 's.tkachenko@chernihiv.ua'
  );

delete from public.marketplace_items
where community_id = (select id from public.communities where slug = 'pryluky')
  and contact_name in (
      'Наталія', 'Дмитро', 'Оксана', 'Марина', 'Роман',
      'Ганна', 'Людмила', 'Степан', 'Петро', 'Вікторія'
  )
  and created_at > now() - interval '25 days';
*/
