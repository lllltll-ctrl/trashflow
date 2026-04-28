import Link from 'next/link';
import { ArrowRight, AlertTriangle, ScanLine, MapPin, Clock, ArrowDownWideNarrow, Recycle, Gift, type LucideIcon } from 'lucide-react';
import { SoapBubbleLoader } from '@/components/soap-bubble-loader';
import { LiveTrucksMap } from '@/components/live-trucks-map';
import { Grain } from '@/components/design/grain';
import { palette, darkHeroBackground } from '@/components/design/tokens';
import { clientEnv } from '@/lib/env';

type HomeStats = {
  activePoints: number;
  communityName: string;
};

const COMMUNITY_SHORT_NAMES: Record<string, string> = {
  pryluky: 'Прилуки',
};

async function loadStats(): Promise<HomeStats> {
  const base = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const slug = clientEnv.NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG;

  const fallback: HomeStats = {
    activePoints: 12,
    communityName: COMMUNITY_SHORT_NAMES[slug] ?? 'Прилуки',
  };

  try {
    const pointsRes = await fetch(
      `${base}/rest/v1/collection_points?select=id&is_active=eq.true`,
      {
        headers: { ...headers, Prefer: 'count=exact' },
        next: { revalidate: 60 },
      },
    );
    const contentRange = pointsRes.headers.get('content-range') ?? '';
    const activePoints = Number(contentRange.split('/')[1] ?? 0) || fallback.activePoints;
    return {
      activePoints,
      communityName: COMMUNITY_SHORT_NAMES[slug] ?? fallback.communityName,
    };
  } catch {
    return fallback;
  }
}

type Tile = {
  href: '/classify' | '/points' | '/schedule' | '/rules';
  title: string;
  sub: (s: HomeStats) => string;
  icon: LucideIcon;
  accent: string;
};

const tiles: Tile[] = [
  { href: '/classify', title: 'Класифікація', sub: () => 'AI-розпізнавання', icon: ScanLine, accent: 'var(--yellow)' },
  { href: '/points', title: 'Точки', sub: (s) => `${s.activePoints} активних`, icon: MapPin, accent: 'var(--green-mint)' },
  { href: '/schedule', title: 'Графік', sub: () => 'Цей тиждень', icon: Clock, accent: 'var(--c-glass)' },
  { href: '/rules', title: 'Правила', sub: () => '5 категорій', icon: ArrowDownWideNarrow, accent: 'var(--c-paper)' },
];

export default async function HomePage() {
  const stats = await loadStats();

  return (
    <div className="flex flex-1 flex-col">
      {/* Dark eco hero */}
      <section
        className="relative mx-[14px] mb-[18px] mt-[6px] overflow-hidden rounded-[28px] px-[22px] pb-[26px] pt-6 text-white"
        style={{ background: darkHeroBackground }}
      >
        <Grain opacity={0.15} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-[12px] text-lg font-extrabold"
              style={{
                background: `linear-gradient(160deg, ${palette.yellowSoft}, ${palette.yellow})`,
                color: palette.greenDeep,
                boxShadow: `inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -3px 0 ${palette.yellowShadow}`,
                transform: 'rotate(-6deg)',
              }}
            >
              <Recycle className="size-[18px]" strokeWidth={2.6} />
            </span>
            <span className="text-[17px] font-extrabold tracking-[-0.01em]">TrashFlow</span>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs">
            {stats.communityName}
          </span>
        </div>

        <div className="relative mx-auto my-4 h-[180px] w-[180px]">
          <SoapBubbleLoader />
        </div>

        <h1
          className="m-0 text-center text-[30px] font-normal leading-[1.05] tracking-[-0.025em]"
          style={{ fontFamily: 'var(--font-display)', textWrap: 'pretty' }}
        >
          Чистіша{' '}
          <em
            className="not-italic"
            style={{
              fontStyle: 'italic',
              fontWeight: 500,
              color: palette.yellow,
            }}
          >
            громада
          </em>
          <br />в три кліки
        </h1>

        <p className="mt-3 text-center text-[13.5px] leading-[1.5] text-white/75">
          Сортуй вдома → дивись де їде машина → плати менше за вивіз.
        </p>
      </section>

      {/* Live trucks — replaces the redundant 'Photograph waste' CTA. People
          who land here for the first time see the system actually working
          before they pick a tile. */}
      <div className="px-[14px]">
        <LiveTrucksMap />
      </div>

      {/* Tile grid */}
      <div className="mt-3.5 grid grid-cols-2 gap-2.5 px-[14px]">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="block rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white p-4 text-left transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: 'var(--tf-shadow-sm)' }}
            >
              <div
                className="mb-2.5 grid size-[34px] place-items-center rounded-[11px] text-[color:var(--green-deep)]"
                style={{ background: t.accent }}
              >
                <Icon className="size-[18px]" strokeWidth={2} />
              </div>
              <div className="text-[15px] font-bold tracking-[-0.01em] text-[color:var(--ink)]">
                {t.title}
              </div>
              <div className="mt-[2px] text-[12.5px] text-[color:var(--ink-mute)]">
                {t.sub(stats)}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Marketplace banner — green, "give away vs throw away" */}
      <div className="px-[14px] pt-[14px]">
        <Link
          href="/barakholka"
          className="flex w-full items-center gap-[14px] rounded-[20px] border px-4 py-[14px] text-left"
          style={{
            background: 'linear-gradient(180deg, #E8F5EC 0%, #D1ECDC 100%)',
            borderColor: 'rgba(47, 165, 96, 0.35)',
            color: palette.greenDeep,
          }}
        >
          <span
            aria-hidden
            className="grid size-[42px] place-items-center rounded-[12px] text-white"
            style={{ background: palette.greenLight }}
          >
            <Gift className="size-[20px]" strokeWidth={2.2} />
          </span>
          <div className="flex-1">
            <div className="text-sm font-bold tracking-[-0.01em]">Барахолка громади</div>
            <div className="mt-0.5 text-xs opacity-70">
              Не викидай — віддай сусіду. Електроніка, меблі, книги. Безкоштовно.
            </div>
          </div>
          <ArrowRight className="size-[18px] opacity-50" />
        </Link>
      </div>

      {/* Report banner */}
      <div className="px-[14px] pb-1 pt-[14px]">
        <Link
          href="/report"
          className="flex w-full items-center gap-[14px] rounded-[20px] border border-dashed px-4 py-[14px] text-left"
          style={{
            background: 'linear-gradient(180deg, #FFF8E7 0%, #FFF1C9 100%)',
            borderColor: 'rgba(199, 153, 8, 0.4)',
            color: '#4A3500',
          }}
        >
          <span
            aria-hidden
            className="grid size-[42px] place-items-center rounded-[12px]"
            style={{ background: palette.yellow, color: '#4A3500' }}
          >
            <AlertTriangle className="size-[20px]" strokeWidth={2.2} />
          </span>
          <div className="flex-1">
            <div className="text-sm font-bold tracking-[-0.01em]">Побачили звалище?</div>
            <div className="mt-0.5 text-xs opacity-70">
              Надішліть фото — бригада приїде.
            </div>
          </div>
          <ArrowRight className="size-[18px] opacity-50" />
        </Link>
      </div>
    </div>
  );
}
