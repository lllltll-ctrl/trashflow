'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

type Inputs = {
  trucks: number;
  routesPerWeek: number;
  avgRouteKm: number;
  fuelLitersPer100Km: number;
  fuelPriceUah: number;
  complaintHoursPerWeek: number;
  dispatcherHourlyUah: number;
  routeOptimizationSavingsPct: number;
  dispatcherEfficiencyPct: number;
};

const DEFAULTS: Inputs = {
  trucks: 8,
  routesPerWeek: 36,
  avgRouteKm: 35,
  fuelLitersPer100Km: 28,
  fuelPriceUah: 58,
  complaintHoursPerWeek: 18,
  dispatcherHourlyUah: 220,
  routeOptimizationSavingsPct: 18,
  dispatcherEfficiencyPct: 55,
};

const WEEKS_PER_YEAR = 52;

export function RoiCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);

  const result = useMemo(() => computeRoi(inputs), [inputs]);

  const update = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
      <Card>
        <CardHeader>
          <CardTitle>Вхідні дані</CardTitle>
          <CardDescription>
            За замовчуванням — оціночні значення для КП масштабу Прилук. Підкрутіть після
            інтерв&apos;ю з представником громади.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Section title="Автопарк">
            <NumberField
              label="Сміттєвозів у парку"
              value={inputs.trucks}
              onChange={(v) => update('trucks', v)}
              step={1}
            />
            <NumberField
              label="Маршрутів на тиждень (сумарно)"
              value={inputs.routesPerWeek}
              onChange={(v) => update('routesPerWeek', v)}
              step={1}
            />
            <NumberField
              label="Середня довжина маршруту (км)"
              value={inputs.avgRouteKm}
              onChange={(v) => update('avgRouteKm', v)}
              step={1}
            />
          </Section>
          <Section title="Паливо">
            <NumberField
              label="Витрата (л / 100 км)"
              value={inputs.fuelLitersPer100Km}
              onChange={(v) => update('fuelLitersPer100Km', v)}
              step={0.5}
            />
            <NumberField
              label="Ціна палива (грн / л)"
              value={inputs.fuelPriceUah}
              onChange={(v) => update('fuelPriceUah', v)}
              step={0.5}
            />
          </Section>
          <Section title="Диспетчерська робота">
            <NumberField
              label="Годин на обробку скарг / тиждень"
              value={inputs.complaintHoursPerWeek}
              onChange={(v) => update('complaintHoursPerWeek', v)}
              step={1}
            />
            <NumberField
              label="Вартість години диспетчера (грн)"
              value={inputs.dispatcherHourlyUah}
              onChange={(v) => update('dispatcherHourlyUah', v)}
              step={10}
            />
          </Section>
          <Section title="Ефект TrashFlow">
            <SliderField
              label={`Економія пального від оптимізації маршрутів: ${inputs.routeOptimizationSavingsPct}%`}
              value={inputs.routeOptimizationSavingsPct}
              min={0}
              max={40}
              step={1}
              onChange={(v) => update('routeOptimizationSavingsPct', v)}
            />
            <SliderField
              label={`Скорочення часу на обробку скарг: ${inputs.dispatcherEfficiencyPct}%`}
              value={inputs.dispatcherEfficiencyPct}
              min={0}
              max={90}
              step={1}
              onChange={(v) => update('dispatcherEfficiencyPct', v)}
            />
          </Section>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">
              Економія на рік: {formatUah(result.totalAnnualSavings)}
            </CardTitle>
            <CardDescription>
              {formatUah(result.monthlySavings)} на місяць · термін окупності пілоту ≈{' '}
              {result.paybackMonths.toFixed(1)} міс (при вартості пілоту 150 000 грн)
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Структура економії</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SavingsRow
              label="Пальне (оптимізація маршрутів)"
              value={result.fuelSavings}
              max={result.totalAnnualSavings}
              tone="primary"
            />
            <SavingsRow
              label="Час диспетчера"
              value={result.dispatcherSavings}
              max={result.totalAnnualSavings}
              tone="secondary"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Порівняння річних витрат</CardTitle>
            <CardDescription>До TrashFlow vs після</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CostBar
              label="Пальне без TrashFlow"
              value={result.fuelAnnualBase}
              max={result.fuelAnnualBase}
              tone="muted"
            />
            <CostBar
              label="Пальне з TrashFlow"
              value={result.fuelAnnualOptimized}
              max={result.fuelAnnualBase}
              tone="primary"
            />
            <CostBar
              label="Диспетчер без TrashFlow"
              value={result.dispatcherAnnualBase}
              max={result.dispatcherAnnualBase}
              tone="muted"
            />
            <CostBar
              label="Диспетчер з TrashFlow"
              value={result.dispatcherAnnualOptimized}
              max={result.dispatcherAnnualBase}
              tone="primary"
            />
          </CardContent>
        </Card>

        <Card className="bg-muted/40">
          <CardContent className="py-4 text-xs text-muted-foreground">
            Модель консервативна: 15-25% економії на пальному характерне для переходу від ручного
            планування до оптимізованого графіка (джерело: WRI Ross Center, 2022). Цифри
            диспетчера — ринкова ставка 200-250 грн/год (2025-2026).
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function computeRoi(inputs: Inputs) {
  const weeklyKm = inputs.routesPerWeek * inputs.avgRouteKm;
  const weeklyLiters = (weeklyKm * inputs.fuelLitersPer100Km) / 100;
  const weeklyFuelCost = weeklyLiters * inputs.fuelPriceUah;
  const fuelAnnualBase = weeklyFuelCost * WEEKS_PER_YEAR;
  const fuelAnnualOptimized = fuelAnnualBase * (1 - inputs.routeOptimizationSavingsPct / 100);
  const fuelSavings = fuelAnnualBase - fuelAnnualOptimized;

  const dispatcherWeekly = inputs.complaintHoursPerWeek * inputs.dispatcherHourlyUah;
  const dispatcherAnnualBase = dispatcherWeekly * WEEKS_PER_YEAR;
  const dispatcherAnnualOptimized =
    dispatcherAnnualBase * (1 - inputs.dispatcherEfficiencyPct / 100);
  const dispatcherSavings = dispatcherAnnualBase - dispatcherAnnualOptimized;

  const totalAnnualSavings = fuelSavings + dispatcherSavings;
  const monthlySavings = totalAnnualSavings / 12;
  const pilotCostUah = 150_000;
  const paybackMonths = totalAnnualSavings > 0 ? pilotCostUah / monthlySavings : Infinity;

  return {
    fuelAnnualBase,
    fuelAnnualOptimized,
    fuelSavings,
    dispatcherAnnualBase,
    dispatcherAnnualOptimized,
    dispatcherSavings,
    totalAnnualSavings,
    monthlySavings,
    paybackMonths,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  step?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="flex-1 text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-24 rounded-md border border-input bg-background px-2 py-1 text-right text-sm"
      />
    </label>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}

function SavingsRow({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: 'primary' | 'secondary';
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const bg = tone === 'primary' ? 'bg-primary' : 'bg-emerald-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{formatUah(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${bg}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CostBar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: 'muted' | 'primary';
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const bg = tone === 'muted' ? 'bg-muted-foreground/30' : 'bg-primary';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground">{formatUah(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${bg}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatUah(value: number): string {
  return `${Math.round(value).toLocaleString('uk-UA')} грн`;
}
