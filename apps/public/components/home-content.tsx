'use client';

import Link from 'next/link';
import {
  ArrowRight, AlertTriangle, Gamepad2, MapPin, Clock,
  ArrowDownWideNarrow, Recycle, Gift, Lock, Truck,
  MessageCircle, type LucideIcon,
  Bell, Search, Zap, CheckCircle, Package, BarChart2,
} from 'lucide-react';
import { LiveTrucksMap } from '@/components/live-trucks-map';
import { DigestCarousel } from '@/components/digest-carousel';
import { palette } from '@/components/design/tokens';
import { useAuth } from '@/lib/auth-context';

type HomeStats = { activePoints: number; communityName: string };

type Tile = {
  href: '/classify' | '/points' | '/schedule' | '/rules';
  title: string;
  sub: (s: HomeStats) => string;
  icon: LucideIcon;
  accent: string;
};

const tiles: Tile[] = [
  { href: '/classify', title: 'Інтерактив',  sub: () => 'Навчайся та грай',        icon: Gamepad2,           accent: 'var(--yellow)'    },
  { href: '/points',   title: 'Точки',        sub: (s) => `${s.activePoints} активних`, icon: MapPin,         accent: 'var(--green-mint)' },
  { href: '/schedule', title: 'Графік',        sub: () => 'Цей тиждень',             icon: Clock,              accent: 'var(--c-glass)'   },
  { href: '/rules',    title: 'Правила',       sub: () => '5 категорій',             icon: ArrowDownWideNarrow, accent: 'var(--c-paper)'   },
];

// ─── KPI tiles (desktop only) ────────────────────────────────────────────────

const KPI_TILES = [
  { label: 'Активних точок',    value: '47',  delta: '+3',  icon: MapPin,       color: 'var(--green-light)' },
  { label: 'Вивезено тонн',     value: '126', delta: '+8%', icon: Package,      color: 'var(--c-plastic)'   },
  { label: 'Звернень закрито',  value: '94%', delta: '↑2%', icon: CheckCircle,  color: 'var(--c-glass)'     },
  { label: 'Жителів активних',  value: '1 2к',delta: '+140',icon: BarChart2,    color: 'var(--c-paper)'     },
] as const;

// ─── Week schedule (desktop only) ────────────────────────────────────────────

const WEEK = [
  { day: 'Пн', date: '28', category: 'Пластик', color: 'var(--c-plastic)', active: false },
  { day: 'Вт', date: '29', category: 'Скло',    color: 'var(--c-glass)',   active: false },
  { day: 'Ср', date: '30', category: 'Папір',   color: 'var(--c-paper)',   active: true  },
  { day: 'Чт', date: '01', category: 'Метал',   color: 'var(--c-metal)',   active: false },
  { day: 'Пт', date: '02', category: 'Пластик', color: 'var(--c-plastic)', active: false },
  { day: 'Сб', date: '03', category: 'Небезп',  color: 'var(--c-hazardous)', active: false },
  { day: 'Нд', date: '04', category: '—',        color: 'var(--ink-mute)', active: false },
] as const;

// ─── Faux map widget (CSS-only, no Leaflet) ───────────────────────────────────

function FauxMap() {
  return (
    <div
      className="relative overflow-hidden rounded-[18px]"
      style={{ height: 280 }}
      aria-label="Декоративна карта руху машин"
      role="img"
    >
      {/* Map background */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, #dce8dd 0%, #c8dac9 40%, #d8e8da 100%)' }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(0deg,transparent,transparent 32px,rgba(0,0,0,0.12) 33px)',
            'repeating-linear-gradient(90deg,transparent,transparent 32px,rgba(0,0,0,0.12) 33px)',
          ].join(','),
        }}
        aria-hidden
      />

      {/* Road strips — horizontal */}
      <div className="absolute left-0 right-0" style={{ top: 82, height: 10, background: 'rgba(255,255,255,0.75)' }} aria-hidden />
      <div className="absolute left-0 right-0" style={{ top: 168, height: 8,  background: 'rgba(255,255,255,0.65)' }} aria-hidden />

      {/* Road strips — vertical */}
      <div className="absolute top-0 bottom-0" style={{ left: 110, width: 10, background: 'rgba(255,255,255,0.7)' }} aria-hidden />
      <div className="absolute top-0 bottom-0" style={{ left: 240, width: 8,  background: 'rgba(255,255,255,0.6)' }} aria-hidden />

      {/* Collection-point dots */}
      {[
        { top: 55,  left: 70,  color: 'var(--c-plastic)',  id: 'pt-plastic' },
        { top: 130, left: 160, color: 'var(--c-glass)',    id: 'pt-glass'   },
        { top: 200, left: 80,  color: 'var(--c-paper)',    id: 'pt-paper'   },
        { top: 100, left: 290, color: 'var(--c-metal)',    id: 'pt-metal'   },
        { top: 220, left: 310, color: 'var(--green-light)',id: 'pt-green'   },
      ].map(({ top, left, color, id }) => (
        <span
          key={id}
          className="absolute inline-block size-3 rounded-full border-2 border-white"
          style={{ top, left, background: color, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
          aria-hidden
        />
      ))}

      {/* Animated truck dots */}
      <span
        className="tf-faux-truck-a tf-faux-truck-dot absolute grid size-5 place-items-center rounded-full border-2 border-white"
        style={{ top: 72, left: 48, background: palette.greenLight, zIndex: 10 }}
        aria-hidden
      >
        <Truck className="size-[10px] text-white" strokeWidth={2.5} />
      </span>
      <span
        className="tf-faux-truck-b tf-faux-truck-dot absolute grid size-5 place-items-center rounded-full border-2 border-white"
        style={{ top: 155, left: 200, background: palette.greenMid, zIndex: 10 }}
        aria-hidden
      >
        <Truck className="size-[10px] text-white" strokeWidth={2.5} />
      </span>
      <span
        className="tf-faux-truck-c tf-faux-truck-dot absolute grid size-5 place-items-center rounded-full border-2 border-white"
        style={{ top: 105, left: 270, background: palette.greenSurf, zIndex: 10 }}
        aria-hidden
      >
        <Truck className="size-[10px] text-white" strokeWidth={2.5} />
      </span>

      {/* Legend chips */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1" aria-label="Легенда">
        {[
          { label: 'Пластик', color: 'var(--c-plastic)' },
          { label: 'Скло',    color: 'var(--c-glass)'   },
          { label: 'Папір',   color: 'var(--c-paper)'   },
          { label: 'Метал',   color: 'var(--c-metal)'   },
        ].map(({ label, color }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: 'rgba(255,255,255,0.82)', color: 'var(--ink-soft)' }}
          >
            <span className="inline-block size-1.5 rounded-full" style={{ background: color }} aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Trucks map placeholder for guests ───────────────────────────────────────

function TrucksMapGuest({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-[rgba(14,58,35,0.06)] bg-white"
      style={{ boxShadow: 'var(--tf-shadow-md)' }}
    >
      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className="grid size-9 place-items-center rounded-[12px] text-[color:var(--ink-mute)]"
            style={{ background: 'rgba(14,58,35,0.06)' }}
          >
            <Truck className="size-[18px]" strokeWidth={2.2} />
          </span>
          <div>
            <div
              className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Машини в роботі
            </div>
            <div className="text-[15px] font-bold tracking-[-0.01em] text-[color:var(--ink-mute)]">
              Лише для резидентів
            </div>
          </div>
        </div>
      </div>

      {/* Blurred fake map + overlay */}
      <div className="relative mx-3.5 mt-2.5 mb-3.5 h-[200px] overflow-hidden rounded-[18px] lg:h-full lg:min-h-[320px]">
        {/* Fake map background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, #dce8dd 0%, #c8dac9 40%, #d8e8da 100%)',
            filter: 'blur(3px)',
            transform: 'scale(1.05)',
          }}
        />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(0,0,0,0.15) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(0,0,0,0.15) 29px)' }}
        />

        {/* Auth overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(2px)' }}
        >
          <div
            className="grid size-11 place-items-center rounded-full"
            style={{ background: `${palette.greenLight}18` }}
          >
            <Lock className="size-[20px]" style={{ color: palette.greenLight }} />
          </div>
          <div className="text-center">
            <div className="text-[13px] font-bold" style={{ color: palette.greenDeep }}>
              Де зараз машини?
            </div>
            <div className="mt-0.5 text-[11.5px]" style={{ color: 'var(--ink-mute)' }}>
              Увійдіть, щоб бачити живу карту
            </div>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-[14px] px-5 py-2.5 text-[13px] font-bold text-white"
            style={{
              background: `linear-gradient(165deg, ${palette.greenLight}, ${palette.greenMid})`,
              boxShadow: `0 6px 16px -6px ${palette.greenLight}88`,
            }}
          >
            Увійти в акаунт
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop TopBar ──────────────────────────────────────────────────────────

function DesktopTopBar({
  onQuickReport,
}: {
  communityName: string;
  onQuickReport: () => void;
}) {
  return (
    <div
      className="sticky top-0 z-20 hidden lg:flex items-center gap-3 border-b border-[rgba(14,58,35,0.07)] px-6 py-3"
      style={{ background: 'rgba(244,249,241,0.95)', backdropFilter: 'blur(12px)' }}
    >
      {/* Search bar */}
      <div className="flex flex-1 items-center gap-2 rounded-[12px] border border-[rgba(14,58,35,0.1)] bg-white px-3 py-2.5"
        style={{ boxShadow: '0 1px 3px rgba(14,58,35,0.05)' }}
      >
        <Search className="size-[15px] shrink-0 text-[color:var(--ink-mute)]" strokeWidth={2} />
        <span className="text-[13px] text-[color:var(--ink-mute)]">
          Пошук по громаді — адреса, категорія…
        </span>
      </div>

      {/* Notifications */}
      <button
        type="button"
        aria-label="Сповіщення"
        className="relative grid size-[38px] shrink-0 place-items-center rounded-[11px] border border-[rgba(14,58,35,0.08)] bg-white transition-colors hover:bg-[rgba(14,58,35,0.04)]"
        style={{ color: 'var(--ink-soft)', boxShadow: '0 1px 3px rgba(14,58,35,0.05)' }}
      >
        <Bell className="size-[17px]" strokeWidth={2} />
        {/* Unread badge */}
        <span
          className="absolute right-1.5 top-1.5 size-2 rounded-full border border-white"
          style={{ background: 'var(--c-hazardous)' }}
          aria-label="Є нові сповіщення"
        />
      </button>

      {/* Quick complaint */}
      <button
        type="button"
        onClick={onQuickReport}
        aria-label="Швидка скарга — повідомити про звалище"
        className="flex shrink-0 items-center gap-2 rounded-[12px] px-4 py-2.5 text-[13px] font-bold text-[color:var(--green-deep)] transition-opacity hover:opacity-90"
        style={{ background: 'var(--yellow)', boxShadow: '0 3px 8px -3px rgba(199,153,8,0.4)' }}
      >
        <Zap className="size-[14px]" strokeWidth={2.5} />
        Швидка скарга
      </button>
    </div>
  );
}

// ─── Desktop HeroBand ────────────────────────────────────────────────────────

function DesktopHeroBand({ communityName }: { communityName: string }) {
  return (
    <div
      className="hidden lg:flex items-center justify-between gap-6 rounded-[22px] mx-6 mt-4 p-5"
      style={{
        background: 'linear-gradient(160deg, #0E3A23 0%, #185C38 65%, #0E3A23 100%)',
        boxShadow: '0 8px 24px -8px rgba(14,58,35,0.3)',
      }}
      role="banner"
    >
      {/* Greeting + pickup info */}
      <div className="flex-1">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-white leading-tight">
          Громада починається з тебе
        </h1>
        <p className="mt-1 text-[13px] text-white/65">
          Завтра вивозять пластик та скло — вул. Богдана Хмельницького
        </p>
      </div>

      {/* Stats ring (decorative SVG) */}
      <div className="relative shrink-0" aria-hidden>
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none">
          {/* Background ring */}
          <circle cx="42" cy="42" r="34" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          {/* Progress arc — 72% sorted */}
          <circle
            cx="42" cy="42" r="34"
            stroke="#FFD23F"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="213.6"
            strokeDashoffset="59.8"
            transform="rotate(-90 42 42)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[18px] font-extrabold text-white leading-none">72%</span>
          <span className="text-[9px] text-white/55 mt-0.5">сортує</span>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop KPI tiles ───────────────────────────────────────────────────────

function DesktopKpiTiles() {
  return (
    <div className="hidden lg:grid lg:grid-cols-4 gap-3 mx-6 mt-4">
      {KPI_TILES.map(({ label, value, delta, icon: Icon, color }) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-[16px] border border-[rgba(14,58,35,0.06)] bg-white p-3.5"
          style={{ boxShadow: '0 2px 8px -2px rgba(14,58,35,0.06)' }}
        >
          <div className="flex items-center justify-between">
            <span
              className="grid size-7 place-items-center rounded-[9px]"
              style={{ background: `${color}18` }}
              aria-hidden
            >
              <Icon className="size-[14px]" style={{ color }} strokeWidth={2} />
            </span>
            <span
              className="text-[10.5px] font-semibold"
              style={{ color: delta.startsWith('+') || delta.startsWith('↑') ? 'var(--green-light)' : 'var(--ink-mute)' }}
            >
              {delta}
            </span>
          </div>
          <div>
            <div className="text-[18px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--ink)' }}>
              {value}
            </div>
            <div className="text-[11px] leading-tight" style={{ color: 'var(--ink-mute)' }}>
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Desktop WeekSchedule ────────────────────────────────────────────────────

function DesktopWeekSchedule() {
  return (
    <div
      className="hidden lg:block mx-6 mt-4 rounded-[18px] border border-[rgba(14,58,35,0.06)] bg-white p-4"
      style={{ boxShadow: '0 2px 8px -2px rgba(14,58,35,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="size-[15px] shrink-0" style={{ color: 'var(--c-glass)' }} strokeWidth={2} />
        <h2
          className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)' }}
        >
          Графік цього тижня
        </h2>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK.map(({ day, date, category, color, active }) => (
          <div
            key={day}
            className="flex flex-col items-center gap-1.5 rounded-[12px] py-2.5 px-1"
            style={
              active
                ? { background: 'var(--green-deep)', boxShadow: '0 4px 12px -4px rgba(14,58,35,0.3)' }
                : { background: 'rgba(14,58,35,0.03)' }
            }
          >
            <span
              className="text-[10px] font-semibold uppercase"
              style={{ color: active ? 'rgba(255,255,255,0.65)' : 'var(--ink-mute)' }}
            >
              {day}
            </span>
            <span
              className="text-[15px] font-extrabold"
              style={{ color: active ? '#FFD23F' : 'var(--ink)' }}
            >
              {date}
            </span>
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: category === '—' ? 'rgba(14,58,35,0.15)' : color }}
              aria-hidden
            />
            <span
              className="text-[9px] font-semibold text-center leading-tight"
              style={{ color: active ? 'rgba(255,255,255,0.75)' : 'var(--ink-mute)' }}
            >
              {category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Desktop category rules strip ────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Пластик',    color: 'var(--c-plastic)', bg: 'var(--c-plastic-bg)', glyph: '◌', tip: 'Пляшки, кришки, упаковка'   },
  { label: 'Скло',       color: 'var(--c-glass)',   bg: 'var(--c-glass-bg)',   glyph: '◇', tip: 'Пляшки, банки, склотара'     },
  { label: 'Папір',      color: 'var(--c-paper)',   bg: 'var(--c-paper-bg)',   glyph: '◱', tip: 'Газети, картон, упаковка'    },
  { label: 'Метал',      color: 'var(--c-metal)',   bg: 'var(--c-metal-bg)',   glyph: '◐', tip: 'Консерви, фольга, дріт'      },
  { label: 'Небезпечні', color: 'var(--c-hazardous)',bg:'var(--c-hazardous-bg)',glyph: '⚡',tip: 'Батарейки, ліки, хімія'     },
] as const;

function DesktopCategoryRules() {
  return (
    <div className="hidden lg:grid lg:grid-cols-5 gap-2.5 mx-6 mt-4">
      {CATEGORIES.map(({ label, color, bg, glyph, tip }) => (
        <Link
          key={label}
          href="/rules"
          className="flex flex-col gap-2 rounded-[16px] border p-3.5 transition-transform hover:-translate-y-0.5"
          style={{ background: bg, borderColor: `${color}30`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          aria-label={`${label} — ${tip}`}
        >
          <span className="text-[22px] leading-none" aria-hidden>{glyph}</span>
          <div>
            <div className="text-[12.5px] font-bold" style={{ color }}>
              {label}
            </div>
            <div className="mt-0.5 text-[10.5px] leading-snug" style={{ color: 'var(--ink-soft)' }}>
              {tip}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Desktop marketplace strip ────────────────────────────────────────────────

const MARKETPLACE_ITEMS = [
  { title: 'Крісло офісне',  price: 'Безкоштовно', tag: 'Меблі',      color: 'var(--c-paper)'   },
  { title: 'Велосипед 26"',  price: '800 грн',     tag: 'Транспорт',  color: 'var(--c-glass)'   },
  { title: 'Монітор 24"',    price: '1 200 грн',   tag: 'Електроніка',color: 'var(--c-plastic)'  },
  { title: 'Книги — 20шт',   price: 'Безкоштовно', tag: 'Книги',      color: 'var(--c-metal)'   },
] as const;

function DesktopMarketplaceStrip({ onSignIn, isAuth }: { onSignIn: () => void; isAuth: boolean }) {
  return (
    <div className="hidden lg:block mx-6 mt-4">
      <div className="flex items-center justify-between mb-2.5">
        <h2
          className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)' }}
        >
          Барахолка громади
        </h2>
        <Link
          href="/barakholka"
          className="flex items-center gap-1 text-[12px] font-semibold"
          style={{ color: 'var(--green-light)' }}
          onClick={(e) => { if (!isAuth) { e.preventDefault(); onSignIn(); } }}
        >
          Всі оголошення
          <ArrowRight className="size-[13px]" strokeWidth={2.5} />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {MARKETPLACE_ITEMS.map(({ title, price, tag, color }) => (
          <Link
            key={title}
            href="/barakholka"
            className="flex flex-col gap-2 rounded-[16px] border border-[rgba(14,58,35,0.06)] bg-white p-3.5 transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: '0 2px 6px -2px rgba(14,58,35,0.06)' }}
            onClick={(e) => { if (!isAuth) { e.preventDefault(); onSignIn(); } }}
          >
            {/* Placeholder thumbnail */}
            <div
              className="h-[72px] rounded-[10px]"
              style={{ background: `${color}18` }}
              aria-hidden
            />
            <div>
              <div className="text-[12.5px] font-bold leading-tight" style={{ color: 'var(--ink)' }}>
                {title}
              </div>
              <div className="mt-1 text-[11px] font-semibold" style={{ color: 'var(--green-light)' }}>
                {price}
              </div>
              <div
                className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: `${color}18`, color }}
              >
                {tag}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HomeContent({ stats }: { stats: HomeStats }) {
  const { session, loading, showSignIn, signOut } = useAuth();
  const isAuth = !loading && !!session;

  function gatedClick(href: string) {
    return (e: React.MouseEvent) => {
      if (!isAuth) { e.preventDefault(); showSignIn(); }
      else { window.location.href = href; }
    };
  }

  return (
    <div className="flex flex-1 flex-col">

      {/* ── Desktop TopBar (sticky, hidden on mobile) ─────────────────── */}
      <DesktopTopBar
        communityName={stats.communityName}
        onQuickReport={() => { if (!isAuth) { showSignIn(); } else { window.location.href = '/report'; } }}
      />

      {/* ── Mobile-only header (hidden on desktop) ───────────────────── */}
      <div className="flex items-center justify-between gap-2.5 px-[18px] pb-2.5 pt-2 lg:hidden">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-[34px] place-items-center rounded-[11px] text-lg font-extrabold"
            style={{
              background: `linear-gradient(160deg, ${palette.yellowSoft}, ${palette.yellow})`,
              color: palette.greenDeep,
              boxShadow: `inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -3px 0 ${palette.yellowShadow}`,
              transform: 'rotate(-6deg)',
            }}
          >
            <Recycle className="size-[18px]" strokeWidth={2.6} />
          </span>
          <span className="text-[16px] font-extrabold tracking-[-0.01em] text-[color:var(--green-deep)]">
            TrashFlow
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: 'rgba(14,58,35,0.06)', color: palette.greenDeep }}
          >
            <span className="inline-block size-1.5 rounded-full" style={{ background: palette.greenLight }} />
            {stats.communityName}
          </span>

          {/* Account button */}
          {loading ? (
            <div className="size-[38px] animate-pulse rounded-[12px] bg-black/5" />
          ) : isAuth ? (
            <button
              aria-label="Акаунт"
              onClick={() => signOut()}
              title="Вийти"
              className="grid size-[38px] place-items-center rounded-[12px] border bg-white"
              style={{ borderColor: `${palette.greenLight}44`, color: palette.greenLight, boxShadow: '0 2px 6px -2px rgba(14,58,35,0.08)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8.5" r="3.6" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4.5 20c1.4-3.6 4.3-5.4 7.5-5.4S18.1 16.4 19.5 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          ) : (
            <button
              aria-label="Увійти"
              onClick={showSignIn}
              className="flex h-[38px] items-center gap-1.5 rounded-[12px] border bg-white px-3 text-[12px] font-bold"
              style={{ borderColor: 'rgba(14,58,35,0.08)', color: palette.greenDeep, boxShadow: '0 2px 6px -2px rgba(14,58,35,0.08)' }}
            >
              Увійти
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop community + account strip (hidden on mobile) ────────── */}
      <div className="hidden lg:flex items-center justify-between gap-3 px-6 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: 'rgba(14,58,35,0.06)', color: palette.greenDeep }}
          >
            <span className="inline-block size-1.5 rounded-full" style={{ background: palette.greenLight }} />
            {stats.communityName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-[34px] w-24 animate-pulse rounded-[10px] bg-black/5" />
          ) : isAuth ? (
            <button
              aria-label="Вийти з акаунту"
              onClick={() => signOut()}
              title="Вийти"
              className="flex h-[34px] items-center gap-2 rounded-[10px] border bg-white px-3 text-[12px] font-semibold"
              style={{ borderColor: `${palette.greenLight}44`, color: palette.greenLight, boxShadow: '0 2px 6px -2px rgba(14,58,35,0.08)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8.5" r="3.6" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4.5 20c1.4-3.6 4.3-5.4 7.5-5.4S18.1 16.4 19.5 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Вийти
            </button>
          ) : (
            <button
              aria-label="Увійти в акаунт"
              onClick={showSignIn}
              className="flex h-[34px] items-center gap-1.5 rounded-[10px] border bg-white px-3 text-[12px] font-bold"
              style={{ borderColor: 'rgba(14,58,35,0.08)', color: palette.greenDeep, boxShadow: '0 2px 6px -2px rgba(14,58,35,0.08)' }}
            >
              Увійти
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop HeroBand ──────────────────────────────────────────── */}
      <DesktopHeroBand communityName={stats.communityName} />

      {/* Digest carousel — full width on both layouts */}
      <DigestCarousel />

      {/* ── Desktop: two-column layout (trucks map + tile grid) ────────── */}
      {/* ── Mobile: stacked layout (unchanged) ─────────────────────────── */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-5 lg:px-6 lg:pt-2">

        {/* Left column: Trucks map */}
        <div className="px-[14px] lg:px-0">
          {isAuth ? <LiveTrucksMap /> : <TrucksMapGuest onSignIn={showSignIn} />}
        </div>

        {/* Right column: tile grid */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5 px-[14px] lg:mt-0 lg:px-0 lg:content-start">
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
      </div>

      {/* ── Desktop faux map (CSS-only animated truck dots) ──────────── */}
      <div className="hidden lg:block mx-6 mt-4">
        <div
          className="rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white overflow-hidden"
          style={{ boxShadow: 'var(--tf-shadow-md)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span
                className="grid size-9 place-items-center rounded-[12px]"
                style={{ background: palette.greenMint, color: palette.greenDeep }}
                aria-hidden
              >
                <Truck className="size-[18px]" strokeWidth={2.2} />
              </span>
              <div>
                <div
                  className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Машини в роботі
                </div>
                <div className="text-[15px] font-bold tracking-[-0.01em] text-[color:var(--green-deep)]">
                  3 на маршруті · 5 в парку
                </div>
              </div>
            </div>
            <span
              className="flex items-center gap-1.5 text-[10.5px] text-[color:var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
            >
              <span
                className="inline-block size-1.5 animate-pulse rounded-full"
                style={{ background: palette.greenLight }}
                aria-hidden
              />
              ОНОВЛЕННЯ 20с
            </span>
          </div>
          <div className="mx-3.5 mb-3.5">
            <FauxMap />
          </div>
        </div>
      </div>

      {/* ── Desktop KPI tiles ─────────────────────────────────────────── */}
      <DesktopKpiTiles />

      {/* ── Desktop WeekSchedule ─────────────────────────────────────── */}
      <DesktopWeekSchedule />

      {/* ── Banners — stacked on mobile, row on desktop ──────────────────── */}
      <div className="mt-3.5 flex flex-col gap-[14px] px-[14px] lg:flex-row lg:px-6 lg:mt-4">

        {/* Marketplace banner */}
        <a
          href="/barakholka"
          onClick={gatedClick('/barakholka')}
          className="flex flex-1 items-center gap-[14px] rounded-[20px] border px-4 py-[14px] text-left"
          style={{
            background: 'linear-gradient(180deg, #E8F5EC 0%, #D1ECDC 100%)',
            borderColor: 'rgba(47, 165, 96, 0.35)',
            color: palette.greenDeep,
          }}
        >
          <span
            aria-hidden
            className="grid size-[42px] place-items-center rounded-[12px] text-white shrink-0"
            style={{ background: isAuth ? palette.greenLight : 'rgba(14,58,35,0.2)' }}
          >
            {isAuth ? <Gift className="size-[20px]" strokeWidth={2.2} /> : <Lock className="size-[18px]" strokeWidth={2.2} />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold tracking-[-0.01em]">Барахолка громади</div>
            <div className="mt-0.5 text-xs opacity-70">
              {isAuth ? 'Не викидай — віддай сусіду. Електроніка, меблі, книги.' : 'Увійдіть, щоб переглядати та публікувати'}
            </div>
          </div>
          <ArrowRight className="size-[18px] opacity-50 shrink-0" />
        </a>

        {/* Report banner */}
        <a
          href="/report"
          onClick={gatedClick('/report')}
          className="flex flex-1 items-center gap-[14px] rounded-[20px] border border-dashed px-4 py-[14px] text-left"
          style={{
            background: 'linear-gradient(180deg, #FFF8E7 0%, #FFF1C9 100%)',
            borderColor: 'rgba(199, 153, 8, 0.4)',
            color: '#4A3500',
          }}
        >
          <span
            aria-hidden
            className="grid size-[42px] place-items-center rounded-[12px] shrink-0"
            style={{ background: isAuth ? palette.yellow : 'rgba(199,153,8,0.2)', color: '#4A3500' }}
          >
            {isAuth ? <AlertTriangle className="size-[20px]" strokeWidth={2.2} /> : <Lock className="size-[18px]" strokeWidth={2.2} />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold tracking-[-0.01em]">Побачили звалище?</div>
            <div className="mt-0.5 text-xs opacity-70">
              {isAuth ? 'Надішліть фото — бригада приїде.' : 'Увійдіть, щоб надіслати скаргу'}
            </div>
          </div>
          <ArrowRight className="size-[18px] opacity-50 shrink-0" />
        </a>

        {/* Support link */}
        <Link
          href="/support"
          className="flex flex-1 items-center gap-3 rounded-[16px] border px-4 py-3 text-left"
          style={{ borderColor: 'rgba(14,58,35,0.08)', background: 'rgba(14,58,35,0.025)' }}
        >
          <MessageCircle className="size-[18px] shrink-0" style={{ color: palette.greenLight }} strokeWidth={2} />
          <span className="flex-1 text-[13px] font-semibold min-w-0" style={{ color: palette.greenDeep }}>
            Маєте питання? Написати в підтримку
          </span>
          <ArrowRight className="size-[16px] opacity-40 shrink-0" style={{ color: palette.greenDeep }} />
        </Link>
      </div>

      {/* ── Desktop category rules (5-column grid) ────────────────────── */}
      <DesktopCategoryRules />

      {/* ── Desktop marketplace strip (4-column preview) ──────────────── */}
      <DesktopMarketplaceStrip onSignIn={showSignIn} isAuth={isAuth} />

      {/* Bottom padding */}
      <div className="pb-4 lg:pb-8" />
    </div>
  );
}
