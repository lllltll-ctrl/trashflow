import { RoiCalculator } from '@/components/roi-calculator';

export const metadata = { title: 'ROI · TrashFlow Admin' };

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">ROI-калькулятор</h1>
        <p className="text-sm text-muted-foreground">
          Оцінка річної економії від переходу на TrashFlow. Перевірте цифри під ваші дані після
          зустрічі з КП.
        </p>
      </header>
      <RoiCalculator />
    </div>
  );
}
