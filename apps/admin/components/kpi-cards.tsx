import { AlertCircle, Clock, CheckCircle2, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@trashflow/ui';
import type { KpiSnapshot } from '@/lib/types';

export function KpiCards({ snapshot }: { snapshot: KpiSnapshot }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Нові скарги"
        value={snapshot.new_count}
        icon={AlertCircle}
        tone="destructive"
        hint="Чекають призначення"
      />
      <KpiCard
        label="У роботі"
        value={snapshot.in_progress_count}
        icon={Clock}
        tone="warning"
        hint="Призначено бригаду"
      />
      <KpiCard
        label="Вирішено (7 днів)"
        value={snapshot.resolved_7d}
        icon={CheckCircle2}
        tone="success"
      />
      <KpiCard
        label="Середній час розв'язання"
        value={
          snapshot.avg_resolution_hours !== null
            ? `${snapshot.avg_resolution_hours.toFixed(1)} год`
            : '—'
        }
        icon={Timer}
        tone="muted"
      />
    </div>
  );
}

type Tone = 'destructive' | 'warning' | 'success' | 'muted';

const TONE_STYLES: Record<Tone, string> = {
  destructive: 'text-destructive',
  warning: 'text-amber-600',
  success: 'text-emerald-600',
  muted: 'text-muted-foreground',
};

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`size-4 ${TONE_STYLES[tone]}`} aria-hidden />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
