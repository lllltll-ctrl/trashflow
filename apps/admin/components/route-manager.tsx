'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ExternalLink, Loader2, Play, RefreshCw, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@trashflow/ui';
import type { GeneratedRoute, RouteStop } from '@/lib/routes';

const PUBLIC_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

type Props = {
  initialRoutes: GeneratedRoute[];
  ripeCount: number;
};

export function RouteManager({ initialRoutes, ripeCount }: Props) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [generating, setGenerating] = useState(false);
  const [ticking, setTicking] = useState(false);
  const router = useRouter();

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/routes/generate', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const body = (await res.json()) as { routes: GeneratedRoute[] };
      setRoutes((prev) => [...body.routes, ...prev]);
      toast.success(
        body.routes.length === 0
          ? 'Жоден бак не пройшов поріг 70% — нема що збирати'
          : `Створено ${body.routes.length} маршрут(ів)`,
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не вдалося згенерувати');
    } finally {
      setGenerating(false);
    }
  };

  const tick = async () => {
    setTicking(true);
    try {
      const res = await fetch('/api/routes/simulate-tick', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const body = (await res.json()) as {
        result: { bins_bumped: number; vehicles_moved: number; pickups: number };
      };
      const r = body.result;
      toast.success(
        `Симуляція: +${r.bins_bumped} нових показники, ${r.vehicles_moved} рухів, ${r.pickups} забір(ів)`,
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Симуляція не вдалася');
    } finally {
      setTicking(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="size-5 text-primary" />
            Динамічна маршрутизація
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="secondary" className="font-normal">
              {ripeCount} баків ≥70% наповнені
            </Badge>
            <span className="text-muted-foreground">
              Алгоритм: nearest-neighbour seed + 2-opt, ваги по %% наповненості. Час
              виконання &lt;50 мс на 50 точок.
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={generate} disabled={generating || ripeCount === 0} size="lg">
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Оптимізую…
                </>
              ) : (
                <>
                  <Play className="size-4" /> Згенерувати маршрут
                </>
              )}
            </Button>
            <Button onClick={tick} variant="outline" disabled={ticking}>
              {ticking ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Тік…
                </>
              ) : (
                <>
                  <RefreshCw className="size-4" /> Симулювати тік
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Симулятор також працює фоном (pg_cron щохвилини): нові показники датчиків +
            рух машин по виданих маршрутах + автоматичні pickup_events.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Маршрути за останні 7 днів</h2>
        {routes.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Маршрутів ще не згенеровано. Дочекайся поки кілька баків заповниться
              (поріг 70%) і натисни «Згенерувати маршрут».
            </CardContent>
          </Card>
        )}
        {routes.map((r) => (
          <RouteCard key={r.id} route={r} />
        ))}
      </div>
    </div>
  );
}

function RouteCard({ route }: { route: GeneratedRoute }) {
  const distanceKm = (route.distanceM / 1000).toFixed(1);
  const durationMin = Math.round(route.durationS / 60);
  const driverUrl = `${PUBLIC_ORIGIN.replace('3001', '3000')}/crew/${route.driverToken}`;
  const mapsUrl = buildGoogleMapsUrl(route.stops);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-baseline justify-between gap-2 text-base">
          <span>{route.vehicleLabel}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {route.stops.length} зупинок · {distanceKm} км · ~{durationMin} хв
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 hover:bg-accent"
          >
            <ExternalLink className="size-3" /> Google Maps
          </a>
          <a
            href={driverUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 hover:bg-accent"
          >
            <ArrowRight className="size-3" /> Водійський лінк
          </a>
          <span className="text-muted-foreground">
            на {new Date(route.plannedFor).toLocaleDateString('uk-UA')}
          </span>
        </div>

        <ol className="space-y-1 text-sm">
          {route.stops.map((s) => (
            <li key={`${s.seq}-${s.binId}`} className="flex items-start gap-2">
              <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {s.seq}.
              </span>
              <span className="flex-1">
                <span className="font-medium">{s.address ?? 'Без адреси'}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {s.kind === 'household' ? 'приватний' : 'публічний'}
                </span>
              </span>
              <Badge
                variant={s.fillPct >= 90 ? 'destructive' : 'secondary'}
                className="font-mono text-xs"
              >
                {s.fillPct}%
              </Badge>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function buildGoogleMapsUrl(stops: RouteStop[]): string {
  if (stops.length === 0) return 'https://maps.google.com';
  const dest = stops[stops.length - 1]!;
  const waypoints = stops
    .slice(0, -1)
    .map((s) => `${s.lat},${s.lng}`)
    .join('|');
  const params = new URLSearchParams({
    api: '1',
    travelmode: 'driving',
    destination: `${dest.lat},${dest.lng}`,
  });
  if (waypoints) params.set('waypoints', waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
