'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { MapPin, Navigation } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
  buttonVariants,
} from '@trashflow/ui';
import {
  WASTE_CATEGORIES,
  WASTE_CATEGORY_ICONS,
  WASTE_CATEGORY_LABELS_UA,
  type WasteCategoryId,
} from '@trashflow/db';
import { fetchPointsNearby, type PointNearby } from '@/lib/rpc';

const PRYLUKY_CENTER = { lat: 50.5942, lng: 32.3874 };

const PointsMap = dynamic(() => import('./points-map').then((m) => m.PointsMap), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse rounded-lg bg-muted" />,
});

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; points: PointNearby[] }
  | { status: 'error'; message: string };

export function PointsBrowser({ initialCategory }: { initialCategory: WasteCategoryId | null }) {
  const [category, setCategory] = useState<WasteCategoryId | null>(initialCategory);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'idle' });

  const searchCenter = userLocation ?? PRYLUKY_CENTER;

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        // Silent fallback — the map just centers on Pryluky.
      },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  }, []);

  useEffect(() => {
    setLoadState({ status: 'loading' });
    fetchPointsNearby({
      lat: searchCenter.lat,
      lng: searchCenter.lng,
      category,
      radius_m: 10_000,
    })
      .then((points) => setLoadState({ status: 'ready', points }))
      .catch((err: unknown) => {
        console.error('points_nearby failed', err);
        const message = err instanceof Error ? err.message : 'Не вдалося завантажити точки.';
        setLoadState({ status: 'error', message });
        toast.error(message);
      });
  }, [searchCenter.lat, searchCenter.lng, category]);

  const points = loadState.status === 'ready' ? loadState.points : [];

  return (
    <div className="space-y-4">
      <CategoryFilter value={category} onChange={setCategory} />

      <PointsMap points={points} userLocation={userLocation} center={searchCenter} />

      <div className="space-y-2">
        {loadState.status === 'loading' && <Spinner label="Завантажую точки…" />}
        {loadState.status === 'ready' && points.length === 0 && <EmptyState />}
        {loadState.status === 'ready' &&
          points.map((p) => <PointRow key={p.id} point={p} />)}
        {loadState.status === 'error' && (
          <p className="text-sm text-destructive">{loadState.message}</p>
        )}
      </div>
    </div>
  );
}

function CategoryFilter({
  value,
  onChange,
}: {
  value: WasteCategoryId | null;
  onChange: (next: WasteCategoryId | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip active={value === null} onClick={() => onChange(null)}>
        Усі
      </FilterChip>
      {WASTE_CATEGORIES.map((cat) => (
        <FilterChip key={cat} active={value === cat} onClick={() => onChange(cat)}>
          {WASTE_CATEGORY_ICONS[cat]} {WASTE_CATEGORY_LABELS_UA[cat]}
        </FilterChip>
      ))}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
        (active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background hover:bg-accent')
      }
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-start justify-between gap-2 text-base">
          <span>{point.name}</span>
          <Badge variant="secondary" className="shrink-0 font-normal">
            {distanceLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-4 pt-0">
        {point.address && (
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {point.address}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {point.accepts.map((cat) => (
            <Badge key={cat} variant="outline" className="text-xs font-normal">
              {WASTE_CATEGORY_ICONS[cat as WasteCategoryId] ?? '•'}{' '}
              {WASTE_CATEGORY_LABELS_UA[cat as WasteCategoryId] ?? cat}
            </Badge>
          ))}
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ size: 'sm', variant: 'outline', className: 'w-full' })}
        >
          <Navigation className="size-3.5" aria-hidden />
          Прокласти маршрут
        </a>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-8 text-center text-sm text-muted-foreground">
        Поки що немає точок збору в цій категорії поблизу. Спробуйте іншу категорію або очистіть
        фільтр.
      </CardContent>
    </Card>
  );
}
