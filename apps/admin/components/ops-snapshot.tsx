import {
  AlertTriangle,
  CalendarCheck,
  Coins,
  Gauge,
  PackageSearch,
  Recycle,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { Card, CardContent } from '@trashflow/ui';
import type { OpsSnapshot } from '@/lib/ops-snapshot';

/**
 * Operational dashboard. Six tiles + a household tier bar at the bottom.
 * Numbers come from getOpsSnapshot() — all real DB reads, refresh on every
 * page load.
 */
export function OpsSnapshotCards({ snapshot }: { snapshot: OpsSnapshot }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Операційний знімок</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Tile
          icon={<AlertTriangle className="size-4" />}
          tone="orange"
          label="Готові до забору"
          primary={`${snapshot.ripeBins}`}
          secondary={`${snapshot.totalBins} баків в системі (${snapshot.publicBins} публ. / ${snapshot.householdBins} прив.)`}
        />
        <Tile
          icon={<Truck className="size-4" />}
          tone="green"
          label="Машини в роботі"
          primary={`${snapshot.trucksOnRoute} / ${snapshot.trucksTotal}`}
          secondary="на маршруті · загалом активних"
        />
        <Tile
          icon={<CalendarCheck className="size-4" />}
          tone="blue"
          label="Маршрутів сьогодні"
          primary={`${snapshot.routesToday}`}
          secondary={`${snapshot.kmToday} км заплановано`}
        />
        <Tile
          icon={<PackageSearch className="size-4" />}
          tone="emerald"
          label="Заборів за тиждень"
          primary={`${snapshot.pickupsWeek}`}
          secondary={`${snapshot.pickupsToday} вже сьогодні`}
        />
        <Tile
          icon={<Gauge className="size-4" />}
          tone="slate"
          label="Кілометраж за тиждень"
          primary={`${snapshot.kmWeek} км`}
          secondary="реальні маршрути VRP-оптимізатора"
        />
        <Tile
          icon={<Recycle className="size-4" />}
          tone="green"
          label="Сортування"
          primary={`${snapshot.sortedSharePct}%`}
          secondary="часта сортованих заборів за тиждень"
        />
      </div>

      {/* Household tier breakdown */}
      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Coins className="size-4 text-primary" />
            PAYT-тарифи приватного сектору
            <span className="text-xs font-normal text-muted-foreground">
              {snapshot.households.total} домогосподарств
            </span>
          </div>
          <TierBar households={snapshot.households} />
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <Legend color="#16a34a" label={`×0.5 сортувальник (${snapshot.households.sorted})`} />
            <Legend color="#ca8a04" label={`×1.0 базовий (${snapshot.households.standard})`} />
          </div>
          <div className="flex items-start gap-2 rounded-md bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>
              Базовий тариф — однаковий для всіх. Хто сортує — платить вдвічі менше (×0.5).
              У Treviso (Італія) така стратегія за 15 років підняла рівень сортування з 27% до 85%.
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

const TONES: Record<string, { bg: string; text: string }> = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  orange: { bg: 'bg-amber-50', text: 'text-amber-700' },
  blue: { bg: 'bg-sky-50', text: 'text-sky-700' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-700' },
};

function Tile({
  icon,
  label,
  primary,
  secondary,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary: string;
  tone: keyof typeof TONES;
}) {
  const t = TONES[tone] ?? TONES.slate!;
  return (
    <Card>
      <CardContent className="space-y-1 py-4">
        <div className={`flex items-center gap-1.5 text-xs uppercase tracking-wider ${t.text}`}>
          <span className={`grid size-6 place-items-center rounded ${t.bg}`}>{icon}</span>
          {label}
        </div>
        <div className="text-2xl font-bold tracking-tight">{primary}</div>
        <div className="text-xs text-muted-foreground">{secondary}</div>
      </CardContent>
    </Card>
  );
}

function TierBar({ households }: { households: OpsSnapshot['households'] }) {
  const total = households.total || 1;
  const sortedPct = (households.sorted / total) * 100;
  const standardPct = Math.max(0, 100 - sortedPct);
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
      <div style={{ width: `${sortedPct}%`, background: '#16a34a' }} />
      <div style={{ width: `${standardPct}%`, background: '#ca8a04' }} />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
