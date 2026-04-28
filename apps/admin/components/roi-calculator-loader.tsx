'use client';

import dynamic from 'next/dynamic';

const RoiCalculator = dynamic(
  () => import('./roi-calculator').then((m) => m.RoiCalculator),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    ),
  },
);

export function RoiCalculatorLoader() {
  return <RoiCalculator />;
}
