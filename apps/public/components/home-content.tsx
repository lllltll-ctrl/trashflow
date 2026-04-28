'use client';

import Link from 'next/link';
import {
  ArrowRight, AlertTriangle, Gamepad2, MapPin, Clock,
  ArrowDownWideNarrow, Recycle, Gift, Lock, Truck,
  MessageCircle, type LucideIcon,
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

      {/* ── Mobile-only header (hidden on desktop — top navbar takes over) ── */}
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

      {/* ── Desktop-only community + account strip ───────────────────────── */}
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

      {/* Digest carousel — full width on both layouts */}
      <DigestCarousel />

      {/* ── Desktop: two-column layout ─────────────────────────────────── */}
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

      {/* Bottom padding */}
      <div className="pb-4" />
    </div>
  );
}
