'use client';

import { useMemo, useState } from 'react';
import { Bell, BellRing, MapPin, Pencil } from 'lucide-react';
import {
  DAY_OF_WEEK_LABELS_UA,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import { CatBadge } from '@/components/design/cat-badge';
import { Grain } from '@/components/design/grain';
import { categoryStyle, palette } from '@/components/design/tokens';

export type PublicPickupSchedule = {
  id: string;
  district: string;
  day_of_week: number;
  time_window: string;
  waste_kinds: string[];
  notes: string | null;
};

export function ScheduleBrowser({ initial }: { initial: PublicPickupSchedule[] }) {
  const districts = useMemo(
    () =>
      Array.from(new Set(initial.map((s) => s.district))).sort((a, b) =>
        a.localeCompare(b, 'uk'),
      ),
    [initial],
  );

  const [selected, setSelected] = useState<string>(districts[0] ?? '');
  const [subscribed, setSubscribed] = useState(false);

  const today = new Date().getDay();

  const filtered = useMemo(
    () => initial.filter((s) => s.district === selected),
    [initial, selected],
  );

  // Find next pickup after today
  const nextPickup = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      const da = (a.day_of_week - today + 7) % 7;
      const db = (b.day_of_week - today + 7) % 7;
      return da - db;
    });
    return sorted[0] ?? null;
  }, [filtered, today]);

  const nextPickupCategory = useMemo<WasteCategoryId | null>(() => {
    if (!nextPickup) return null;
    const first = nextPickup.waste_kinds.find((k) => k in WASTE_CATEGORY_LABELS_UA);
    return (first ?? null) as WasteCategoryId | null;
  }, [nextPickup]);

  if (initial.length === 0) {
    return (
      <div
        className="rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white px-5 py-10 text-center text-sm text-[color:var(--ink-mute)]"
        style={{ boxShadow: 'var(--tf-shadow-sm)' }}
      >
        Графіків ще немає. Зверніться до диспетчера громади.
      </div>
    );
  }

  const firstTime = (nextPickup?.time_window ?? '07:00').split(/[–-]/)[0] ?? '07:00';
  const [nextHour = '07', nextMin = '00'] = firstTime.split(':');

  const nextDayOffset = nextPickup ? (nextPickup.day_of_week - today + 7) % 7 : 0;
  const nextDayLabel = nextPickup
    ? nextDayOffset === 0
      ? 'Сьогодні'
      : nextDayOffset === 1
        ? 'Завтра'
        : DAY_OF_WEEK_LABELS_UA[nextPickup.day_of_week]?.full ?? ''
    : '';

  return (
    <div className="flex flex-col gap-4">
      {/* Next pickup hero */}
      {nextPickup && (
        <div
          className="relative overflow-hidden rounded-[28px] px-[22px] pb-5 pt-[22px] text-white"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 100% 0%, rgba(111,211,154,0.45) 0%, transparent 60%),
              linear-gradient(165deg, #0E3A23 0%, #185C38 100%)`,
          }}
        >
          <Grain opacity={0.15} />
          <div className="relative">
            <div
              className="text-[11px] uppercase tracking-[0.22em] opacity-60"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Наступний вивіз
            </div>
            <div className="mt-2.5 flex items-end gap-3">
              <div
                className="text-[62px] font-normal leading-[0.9] tracking-[-0.04em]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {nextHour}
                <span style={{ color: palette.yellow }}>:</span>
                {nextMin ?? '00'}
              </div>
              <div className="pb-2.5">
                <div className="text-[13px] font-bold tracking-[-0.01em]">
                  {nextDayLabel}
                </div>
                <div className="text-xs opacity-60">
                  {DAY_OF_WEEK_LABELS_UA[nextPickup.day_of_week]?.full ?? ''}
                </div>
              </div>
            </div>
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              {nextPickupCategory && <CatBadge id={nextPickupCategory} />}
              <span className="text-xs opacity-75">· {nextPickup.time_window}</span>
            </div>
            <button
              type="button"
              onClick={() => setSubscribed((v) => !v)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] px-4 py-3 text-sm font-bold transition-all"
              style={{
                background: subscribed ? palette.yellow : 'rgba(255,255,255,0.12)',
                color: subscribed ? palette.greenDeep : '#fff',
                border: subscribed ? 'none' : '1px solid rgba(255,255,255,0.18)',
              }}
            >
              {subscribed ? (
                <>
                  <BellRing className="size-4" strokeWidth={2.2} />
                  Сповіщення увімкнено
                </>
              ) : (
                <>
                  <Bell className="size-4" strokeWidth={2} />
                  Сповіщати мене
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* District chip */}
      <div
        className="flex items-center gap-3 rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white px-4 py-[14px]"
        style={{ boxShadow: 'var(--tf-shadow-sm)' }}
      >
        <div
          className="grid size-9 shrink-0 place-items-center rounded-[12px] text-[color:var(--green-deep)]"
          style={{ background: 'var(--green-pale)' }}
        >
          <MapPin className="size-[18px]" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--ink-mute)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Ваш район
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-[color:var(--ink)]">
            {selected || 'Не вибрано'}
          </div>
        </div>
        <Pencil className="size-[18px] text-[color:var(--ink-mute)]" strokeWidth={2} />
      </div>

      {/* District selector */}
      {districts.length > 1 && (
        <div className="-mx-5 px-5">
          <div className="tf-scroll-x flex gap-2 pb-1">
            {districts.map((d) => {
              const active = selected === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelected(d)}
                  className="shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-[12.5px] font-semibold transition-colors"
                  style={{
                    background: active ? 'var(--green-deep)' : 'rgba(14, 58, 35, 0.05)',
                    color: active ? '#fff' : 'var(--ink-soft)',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Week section header */}
      <div className="flex items-baseline justify-between">
        <div
          className="text-[20px] tracking-[-0.02em] text-[color:var(--green-deep)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Цей тиждень
        </div>
        <div
          className="text-[11px] text-[color:var(--ink-mute)]"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
        >
          {new Intl.DateTimeFormat('uk', { year: 'numeric' }).format(new Date())}
        </div>
      </div>

      {/* Week grid */}
      <WeekGrid filtered={filtered} today={today} />
    </div>
  );
}

function WeekGrid({
  filtered,
  today,
}: {
  filtered: PublicPickupSchedule[];
  today: number;
}) {
  const byDay = useMemo(() => {
    const map = new Map<number, PublicPickupSchedule>();
    for (const s of filtered) {
      if (!map.has(s.day_of_week)) map.set(s.day_of_week, s);
    }
    return map;
  }, [filtered]);

  // Build a week starting today so the "today" row sits at top
  const days: Array<{ dow: number; dateNum: number; label: string }> = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      dow: d.getDay(),
      dateNum: d.getDate(),
      label: DAY_OF_WEEK_LABELS_UA[d.getDay()]?.short ?? '',
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {days.map((d, i) => {
        const row = byDay.get(d.dow);
        const cat = row?.waste_kinds.find((k) => k in WASTE_CATEGORY_LABELS_UA) as
          | WasteCategoryId
          | undefined;
        const s = cat ? categoryStyle[cat] : null;
        const isToday = d.dow === today && i === 0;

        return (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-[18px] border px-4 py-3.5"
            style={{
              background: isToday
                ? 'linear-gradient(165deg, #FFF8E7 0%, #FFF1C9 100%)'
                : '#fff',
              borderColor: isToday
                ? 'rgba(199,153,8,0.25)'
                : 'rgba(14,58,35,0.06)',
              boxShadow: isToday ? 'var(--tf-shadow-md)' : 'none',
            }}
          >
            <div className="w-12 shrink-0 text-center">
              <div
                className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--ink-mute)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {d.label}
              </div>
              <div
                className="mt-0.5 text-[24px] font-normal leading-none tracking-[-0.03em]"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: isToday ? 'var(--green-deep)' : 'var(--ink-soft)',
                }}
              >
                {d.dateNum}
              </div>
            </div>
            <div className="h-9 w-px bg-[rgba(14,58,35,0.08)]" />
            <div className="min-w-0 flex-1">
              {row && cat ? (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-[10px] rounded-full"
                      style={{ background: s!.color }}
                      aria-hidden
                    />
                    <span className="text-sm font-bold tracking-[-0.01em] text-[color:var(--ink)]">
                      {WASTE_CATEGORY_LABELS_UA[cat]}
                    </span>
                    {isToday && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[color:var(--green-deep)]"
                        style={{ background: palette.yellow }}
                      >
                        Сьогодні
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-[color:var(--ink-mute)]">
                    {row.time_window}
                    {row.notes ? ` · ${row.notes}` : ''}
                  </div>
                </>
              ) : (
                <div className="text-[13px] italic text-[color:var(--ink-mute)]">
                  Без вивозу
                </div>
              )}
            </div>
            {s && (
              <div
                className="grid size-9 shrink-0 place-items-center rounded-[12px] text-lg"
                style={{ background: s.bg, color: s.color }}
              >
                {s.glyph}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
