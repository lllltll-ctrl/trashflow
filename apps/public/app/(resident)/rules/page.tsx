import {
  WASTE_CATEGORIES,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import { PageHead } from '@/components/design/page-head';
import { HeroBand } from '@/components/design/hero-band';
import { RulesBrowser, type CategoryRule } from '@/components/rules-browser';
import { clientEnv } from '@/lib/env';

export const metadata = { title: 'Правила сортування · TrashFlow' };

// Editorial copy kept alongside the page — moving it to the DB is a Day 2 task
// once the editorial team has signed off. Each entry is optimised for the
// "Do / Don't" two-column layout in RulesBrowser.
const DO_DONT_UA: Record<WasteCategoryId, { doList: string[]; dontList: string[] }> = {
  plastic: {
    doList: ['ПЕТ-пляшки 1–7', 'Плівка та пакети', 'Кришки окремо'],
    dontList: ['Брудний пластик', 'Памперси', 'Іграшки'],
  },
  paper: {
    doList: ['Газети, журнали', 'Картон (складений)', 'Папір для принтера'],
    dontList: ['Чеки (термопапір)', 'Жирні обгортки', 'Серветки'],
  },
  glass: {
    doList: ['Пляшки, банки', 'Скло будь-якого кольору', 'Без кришок і етикеток'],
    dontList: ['Дзеркала, вікна', 'Лампи', 'Порцеляна'],
  },
  metal: {
    doList: ['Алюмінієві банки', 'Бляшанки з-під консерв', 'Кришки від банок'],
    dontList: ['Балончики під тиском', 'Фарба', 'Електроніка'],
  },
  hazardous: {
    doList: ['Побутові батарейки AA/AAA', 'Акумулятори телефонів', 'Лампи-економки'],
    dontList: ['Автомобільні АКБ (окремо)', 'Розбиті термометри', 'Промислові хімікати'],
  },
};

type WasteCategoryRow = {
  id: WasteCategoryId;
  name_ua: string;
  description: string | null;
  hazard_level: number;
};

const FALLBACK: WasteCategoryRow[] = WASTE_CATEGORIES.map((id) => ({
  id,
  name_ua: WASTE_CATEGORY_LABELS_UA[id],
  description: null,
  hazard_level: id === 'hazardous' ? 3 : 0,
}));

async function loadCategories(): Promise<WasteCategoryRow[]> {
  const base = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  try {
    const res = await fetch(
      `${base}/rest/v1/waste_categories?select=id,name_ua,description,hazard_level`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 600 },
      },
    );
    if (!res.ok) return FALLBACK;
    const rows = (await res.json()) as WasteCategoryRow[];
    if (rows.length === 0) return FALLBACK;
    return WASTE_CATEGORIES.map((id) => rows.find((r) => r.id === id)).filter(
      (r): r is WasteCategoryRow => r !== undefined,
    );
  } catch {
    return FALLBACK;
  }
}

export default async function RulesPage() {
  const cats = await loadCategories();
  const rules: CategoryRule[] = cats.map((c) => ({
    id: c.id,
    name_ua: c.name_ua,
    description: c.description,
    doList: DO_DONT_UA[c.id].doList,
    dontList: DO_DONT_UA[c.id].dontList,
  }));

  return (
    <>
      <PageHead title="Правила" backHref="/" />
      <HeroBand
        pale
        eyebrow="5 категорій сортування"
        titleBefore="Як сортувати "
        titleEm="правильно"
        titleAfter="."
        sub="Коротко: що у який контейнер. Натисніть категорію, щоб побачити деталі."
      />
      <div className="flex-1 overflow-y-auto px-5 pb-[120px]">
        <RulesBrowser categories={rules} />
      </div>
    </>
  );
}
