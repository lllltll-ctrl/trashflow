'use client';

import type { ElementType } from 'react';
import { Calendar, Trophy, Activity, MapPin, ShoppingBag, AlertTriangle, Recycle } from 'lucide-react';

type LeaderEntry = { rank: number; name: string; score: number; highlight?: boolean };
type ActivityEntry = { icon: ElementType; color: string; text: string; time: string };

const LEADERBOARD: LeaderEntry[] = [
  { rank: 1, name: 'Ніжин',     score: 9840 },
  { rank: 2, name: 'Чернігів',  score: 8310 },
  { rank: 3, name: 'Прилуки',   score: 7650, highlight: true },
  { rank: 4, name: 'Бахмач',    score: 6100 },
  { rank: 5, name: 'Борзна',    score: 4820 },
];

const ACTIVITY: ActivityEntry[] = [
  { icon: Recycle,       color: 'var(--green-light)',  text: 'Новий пункт прийому відкрито', time: '5хв тому'   },
  { icon: ShoppingBag,   color: 'var(--c-plastic)',    text: 'Крісло безкоштовно (Барахолка)', time: '18хв тому' },
  { icon: AlertTriangle, color: 'var(--c-hazardous)',  text: 'Скарга на звалище опрацьована', time: '40хв тому' },
  { icon: MapPin,        color: 'var(--c-glass)',      text: '3 машини завершили маршрут',    time: '1год тому'  },
  { icon: Recycle,       color: 'var(--green-mint)',   text: 'Поновлено графік на тиждень',   time: '2год тому'  },
];

export function DesktopRightPanel() {
  return (
    <aside
      className="tf-desktop-right flex flex-col gap-4 p-4"
      aria-label="Додаткова інформація"
    >
      {/* ── Tomorrow pickup card ────────────────────────────────────────── */}
      <section
        className="rounded-[18px] p-4"
        style={{
          background: 'linear-gradient(160deg, #0E3A23 0%, #185C38 100%)',
          boxShadow: '0 8px 24px -8px rgba(14,58,35,0.28)',
        }}
        aria-labelledby="pickup-heading"
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="size-[15px] text-white/60 shrink-0" strokeWidth={2} />
          <h2
            id="pickup-heading"
            className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/60"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Завтра вивозять
          </h2>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[22px] font-extrabold tracking-[-0.02em] text-white">08:00</span>
          <span className="text-[13px] text-white/60">— 12:00</span>
        </div>
        <p className="text-[12.5px] text-white/75 mb-3">
          вул. Богдана Хмельницького та прилеглі
        </p>

        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Пластик', color: 'var(--c-plastic)' },
            { label: 'Скло',    color: 'var(--c-glass)'   },
            { label: 'Папір',   color: 'var(--c-paper)'   },
          ].map(({ label, color }) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold text-white/90"
              style={{ background: 'rgba(255,255,255,0.12)', border: `1px solid ${color}55` }}
            >
              <span
                className="mr-1.5 inline-block size-1.5 rounded-full"
                style={{ background: color }}
                aria-hidden
              />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Community leaderboard ───────────────────────────────────────── */}
      <section
        className="rounded-[18px] border border-[rgba(14,58,35,0.07)] bg-white p-4"
        style={{ boxShadow: '0 2px 8px -2px rgba(14,58,35,0.06)' }}
        aria-labelledby="leaderboard-heading"
      >
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="size-[15px] shrink-0" style={{ color: 'var(--yellow)' }} strokeWidth={2} />
          <h2
            id="leaderboard-heading"
            className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)' }}
          >
            Рейтинг громад
          </h2>
        </div>

        <ol className="space-y-1">
          {LEADERBOARD.map(({ rank, name, score, highlight }) => (
            <li
              key={name}
              className={[
                'flex items-center gap-3 rounded-[10px] px-2.5 py-2',
                highlight
                  ? 'font-semibold'
                  : '',
              ].join(' ')}
              style={
                highlight
                  ? { background: 'rgba(255, 210, 63, 0.12)', border: '1px solid rgba(255,210,63,0.3)' }
                  : {}
              }
            >
              <span
                className="w-5 shrink-0 text-center text-[12px] font-bold"
                style={{ color: rank <= 3 ? 'var(--yellow-shadow)' : 'var(--ink-mute)' }}
                aria-label={`Місце ${rank}`}
              >
                {rank}
              </span>
              <span
                className="flex-1 text-[13px]"
                style={{ color: highlight ? 'var(--green-deep)' : 'var(--ink-soft)' }}
              >
                {name}
                {highlight && (
                  <span className="ml-1.5 text-[10px] opacity-60">(ваша)</span>
                )}
              </span>
              <span
                className="text-[12px] font-semibold tabular-nums"
                style={{ color: highlight ? 'var(--green-mid)' : 'var(--ink-mute)' }}
              >
                {score.toLocaleString('uk-UA')}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Recent activity feed ────────────────────────────────────────── */}
      <section
        className="rounded-[18px] border border-[rgba(14,58,35,0.07)] bg-white p-4"
        style={{ boxShadow: '0 2px 8px -2px rgba(14,58,35,0.06)' }}
        aria-labelledby="activity-heading"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="size-[15px] shrink-0" style={{ color: 'var(--green-light)' }} strokeWidth={2} />
          <h2
            id="activity-heading"
            className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)' }}
          >
            Остання активність
          </h2>
        </div>

        <ul className="space-y-3">
          {ACTIVITY.map(({ icon: Icon, color, text, time }) => (
            <li key={text} className="flex items-start gap-2.5">
              <span
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-[8px]"
                style={{ background: `${color}18` }}
                aria-hidden
              >
                <Icon className="size-[13px]" style={{ color }} strokeWidth={2} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] leading-snug" style={{ color: 'var(--ink-soft)' }}>
                  {text}
                </p>
                <p className="mt-0.5 text-[10.5px]" style={{ color: 'var(--ink-mute)' }}>
                  {time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
