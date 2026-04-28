'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { MapPin, Navigation, ArrowRight, Home } from 'lucide-react';
import {
  DEFAULT_SEARCH_RADIUS_M,
  PRYLUKY_CENTER,
  WASTE_CATEGORIES,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import { fetchPointsNearby, type PointNearby } from '@/lib/rpc';
import { CatBadge } from '@/components/design/cat-badge';
import { categoryStyle } from '@/components/design/tokens';

const PointsMap = dynamic(() => import('./points-map').then((m) => m.PointsMap), {
  ssr: false,
  loading: () => (
    <div
      className="h-[240px] animate-pulse rounded-[24px]"
      style={{
        background:
          'linear-gradient(165deg, #E8F5EC 0%, #F4F9F1 100%)',
      }}
    />
  ),
});

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; points: PointNearby[] }
  | { status: 'error'; message: string };

export function PointsBrowser({ initialCategory }: { initialCategory: WasteCategoryId | null }) {
  const [category, setCategory] = useState<WasteCategoryId | null>(initialCategory);
  const [buybackOnly, setBuybackOnly] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'idle' });

  // Pilot is Pryluky-only and we test remotely, so we always centre on the
  // city and ask for a generous radius. Real geolocation comes back once the
  // hromada switcher lands; until then geolocating remote testers just shows
  // an empty list and confuses everyone.
  const searchCenter = PRYLUKY_CENTER;

  useEffect(() => {
    setLoadState({ status: 'loading' });
    fetchPointsNearby({
      lat: searchCenter.lat,
      lng: searchCenter.lng,
      category,
      radius_m: DEFAULT_SEARCH_RADIUS_M,
      limit: 50,
    })
      .then((points) => setLoadState({ status: 'ready', points }))
      .catch((err: unknown) => {
        console.error('points_nearby failed', err);
        const message = err instanceof Error ? err.message : 'Не вдалося завантажити точки.';
        setLoadState({ status: 'error', message });
        toast.error(message);
      });
  }, [searchCenter.lat, searchCenter.lng, category]);

  const allPoints = loadState.status === 'ready' ? loadState.points : [];
  const points = buybackOnly ? allPoints.filter((p) => p.is_buyback) : allPoints;
  const totalPoints = allPoints.length;
  const buybackCount = allPoints.filter((p) => p.is_buyback).length;

  const byCatCount = useMemo(() => {
    const map = new Map<WasteCategoryId, number>();
    for (const p of points) {
      for (const c of p.accepts) {
        if (c in WASTE_CATEGORY_LABELS_UA) {
          map.set(c as WasteCategoryId, (map.get(c as WasteCategoryId) ?? 0) + 1);
        }
      }
    }
    return map;
  }, [points]);

  const userLocation = null;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Real map card, wrapped so the rounded eco chrome stays consistent */}
      <div
        className="relative overflow-hidden rounded-[24px] border border-[rgba(14,58,35,0.08)]"
        style={{
          height: 240,
        }}
      >
        <PointsMap points={points} userLocation={userLocation} center={searchCenter} />
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex justify-between gap-2">
          <div
            className="rounded-[12px] bg-white/85 px-3 py-2 text-xs font-semibold text-[color:var(--green-deep)] backdrop-blur"
          >
            <span
              className="opacity-60"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
            >
              LAT {searchCenter.lat.toFixed(2)}
            </span>
            <span
              className="ml-2 opacity-60"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
            >
              LON {searchCenter.lng.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="-mx-5 px-5">
        <div className="tf-scroll-x flex gap-2 pb-2">
          <Chip active={category === null} onClick={() => setCategory(null)}>
            Усі · {totalPoints}
          </Chip>
          {buybackCount > 0 && (
            <Chip
              active={buybackOnly}
              onClick={() => setBuybackOnly((v) => !v)}
              activeColor="#FFD23F"
            >
              <Home
                className="size-[14px] shrink-0"
                strokeWidth={2.2}
                style={{ color: buybackOnly ? '#0E3A23' : 'var(--green-deep)' }}
              />
              <span style={{ color: buybackOnly ? '#0E3A23' : 'var(--ink-soft)' }}>
                Сортувальні центри · {buybackCount}
              </span>
            </Chip>
          )}
          {WASTE_CATEGORIES.map((c) => {
            const count = byCatCount.get(c) ?? 0;
            if (count === 0 && category !== c) return null;
            const s = categoryStyle[c];
            const active = category === c;
            return (
              <Chip
                key={c}
                active={active}
                onClick={() => setCategory(c)}
                activeColor={s.color}
              >
                <span
                  className="inline-block size-[8px] shrink-0 rounded-full"
                  style={{ background: active ? '#fff' : s.color }}
                  aria-hidden
                />
                {WASTE_CATEGORY_LABELS_UA[c]} · {count}
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-baseline justify-between">
        <div
          className="text-[18px] tracking-[-0.02em] text-[color:var(--green-deep)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          У Прилуках
        </div>
        <div
          className="text-[11px] text-[color:var(--ink-mute)]"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
        >
          {loadState.status === 'ready' ? `${points.length} / ${totalPoints}` : '…'}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2.5">
        {loadState.status === 'loading' && <LoadingSkeleton />}
        {loadState.status === 'ready' && points.length === 0 && <EmptyState />}
        {loadState.status === 'ready' &&
          points.map((p) => <PointRow key={p.id} point={p} />)}
        {loadState.status === 'error' && (
          <p
            className="rounded-[14px] px-4 py-3 text-sm"
            style={{
              background: 'var(--c-hazardous-bg)',
              color: 'var(--c-hazardous)',
            }}
          >
            {loadState.message}
          </p>
        )}
      </div>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
  activeColor,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  activeColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-transparent px-3 py-2 text-[12.5px] font-semibold transition-colors"
      style={{
        background: active
          ? activeColor ?? 'var(--green-deep)'
          : 'rgba(14, 58, 35, 0.05)',
        color: active ? '#fff' : 'var(--ink-soft)',
      }}
    >
      {children}
    </button>
  );
}

function PointRow({ point }: { point: PointNearby }) {
  const distanceLabel = useMemo(() => {
    if (point.distance_m < 1000) return `${Math.round(point.distance_m)} м`;
    return `${(point.distance_m / 1000).toFixed(1)} км`;
  }, [point.distance_m]);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}&travelmode=walking`;

  return (
    <div
      className="rounded-[22px] border bg-white p-4"
      style={{
        boxShadow: 'var(--tf-shadow-sm)',
        borderColor: point.is_buyback
          ? 'rgba(255, 210, 63, 0.5)'
          : 'rgba(14,58,35,0.06)',
        background: point.is_buyback
          ? 'linear-gradient(165deg, #FFFCEB 0%, #FFFFFF 60%)'
          : '#fff',
      }}
    >
      <div className="flex gap-3">
        <div
          className="grid size-[46px] shrink-0 place-items-center rounded-[14px]"
          style={{
            background: point.is_buyback ? '#FFD23F' : 'var(--green-pale)',
            color: point.is_buyback ? '#0E3A23' : 'var(--green-deep)',
          }}
        >
          {point.is_buyback ? (
            <Home className="size-[20px]" strokeWidth={2.2} />
          ) : (
            <MapPin className="size-[20px]" strokeWidth={2} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="truncate text-[15px] font-bold text-[color:var(--green-deep)]">
              {point.name}
            </div>
            <div className="shrink-0 text-[13px] font-bold text-[color:var(--green-light)]">
              {distanceLabel}
            </div>
          </div>
          {point.address && (
            <div className="mt-0.5 truncate text-[12.5px] text-[color:var(--ink-mute)]">
              {point.address}
            </div>
          )}
          {point.is_buyback && (
            <div
              className="mt-2 flex items-start gap-1.5 rounded-[12px] px-2.5 py-2 text-[12px] font-medium leading-[1.45]"
              style={{
                background: 'rgba(255, 210, 63, 0.18)',
                color: '#4A3500',
              }}
            >
              <span
                className="mt-0.5 inline-block rounded-full bg-[#FFD23F] px-1.5 py-px text-[9.5px] font-bold uppercase tracking-[0.1em] text-[color:var(--green-deep)]"
              >
                Сорт. центр
              </span>
              <span>{point.buyback_info ?? 'Платять за здані матеріали'}</span>
            </div>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {point.accepts.map((cat) =>
              cat in WASTE_CATEGORY_LABELS_UA ? (
                <CatBadge key={cat} id={cat as WasteCategoryId} />
              ) : null,
            )}
          </div>
          <div
            className="mt-3 flex items-center gap-2.5 border-t pt-2.5"
            style={{ borderTop: '1px dashed rgba(14,58,35,0.1)' }}
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 rounded-[12px] bg-[color:var(--green-pale)] px-3 py-1.5 text-[12.5px] font-semibold text-[color:var(--green-deep)]"
            >
              <Navigation className="size-[14px]" strokeWidth={2} />
              Маршрут
              <ArrowRight className="size-[14px]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-[22px] border border-[rgba(14,58,35,0.06)] bg-white p-6 text-center text-sm text-[color:var(--ink-mute)]"
      style={{ boxShadow: 'var(--tf-shadow-sm)' }}
    >
      Поки що немає точок збору в цій категорії поблизу. Спробуйте іншу або очистіть фільтр.
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-[92px] animate-pulse rounded-[22px] border border-[rgba(14,58,35,0.06)]"
          style={{
            background:
              'linear-gradient(165deg, #F4F9F1 0%, #E8F5EC 100%)',
          }}
        />
      ))}
    </>
  );
}
