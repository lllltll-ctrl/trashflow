'use client';

import { useEffect, useState } from 'react';
import { LineChart, Loader2, TrendingDown, Truck, Zap } from 'lucide-react';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@trashflow/ui';

type Snapshot = {
  sample: {
    windowDays: number;
    routesGenerated: number;
    afterKm: number;
    afterPickups: number;
    beforeKm: number;
    beforePickups: number;
  };
  savings: {
    kmSaved: number;
    kmSavedPct: number;
    litresSaved: number;
    uahSavedWeek: number;
    uahSavedYear: number;
  };
};

export function RoiSnapshot() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/roi/snapshot', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body);
        }
        return res.json() as Promise<Snapshot>;
      })
      .then((body) => {
        if (!cancelled) setData(body);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'failed');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <LineChart className="size-5 text-primary" /> Реальна симуляція (минулі 7 днів)
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            на основі згенерованих маршрутів
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive">Не вдалося завантажити: {error}</p>
        )}
        {!data && !error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Рахуємо…
          </div>
        )}
        {data && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat
                icon={<Truck className="size-4" />}
                label="Збережено км"
                primary={`${data.savings.kmSaved} км`}
                secondary={`-${data.savings.kmSavedPct}% від статичного графіку`}
              />
              <Stat
                icon={<Zap className="size-4" />}
                label="Збережено пального"
                primary={`${data.savings.litresSaved} л`}
                secondary="за тиждень"
              />
              <Stat
                icon={<TrendingDown className="size-4" />}
                label="Економія за тиждень"
                primary={`${data.savings.uahSavedWeek.toLocaleString('uk-UA')} ₴`}
                secondary={`згенеровано ${data.sample.routesGenerated} маршрут(ів)`}
              />
              <Stat
                icon={<TrendingDown className="size-4" />}
                label="Прогноз на рік"
                primary={`${data.savings.uahSavedYear.toLocaleString('uk-UA')} ₴`}
                secondary="x52, без зростання парку"
              />
            </div>
            <div className="rounded-md bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <strong>Як рахуємо:</strong> «До» — кожен бак вивозили 2 рази на тиждень за
              графіком (старий підхід КП). «Після» — фактичні км, які наш VRP-оптимізатор
              видав диспетчеру за останні 7 днів. Різниця × витрата 28 л/100км × 58 ₴/л.
              Чим більше баків заповнюються до пікапу, тим менше зайвих рейсів.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  icon,
  label,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tracking-tight">{primary}</div>
      <div className="text-xs text-muted-foreground">{secondary}</div>
    </div>
  );
}
