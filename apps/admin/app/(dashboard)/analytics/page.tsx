import { RoiCalculatorLoader } from '@/components/roi-calculator-loader';
import { RoiSnapshot } from '@/components/roi-snapshot';

export const metadata = { title: 'ROI · TrashFlow Admin' };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">ROI-калькулятор</h1>
        <p className="text-sm text-muted-foreground">
          Зверху — реальні цифри з маршрутів останнього тижня. Знизу — what-if калькулятор
          для пітча: підкрутіть під цифри КП після зустрічі.
        </p>
      </header>
      <RoiSnapshot />
      <RoiCalculatorLoader />
    </div>
  );
}
