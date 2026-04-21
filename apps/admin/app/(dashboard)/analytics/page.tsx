import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

export const metadata = { title: 'Аналітика · TrashFlow Admin' };

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Аналітика та ROI</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>ROI-калькулятор</CardTitle>
          <CardDescription>
            TODO: inputs (бюджет КП, к-ть маршрутів, середня відстань), outputs (економія грн/рік),
            графік скарг за місяцями, сезонність. Дані беремо з реального бюджету Прилук (день 5).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Реалізується агентом <code>frontend-admin</code> день 4/5 плану.
        </CardContent>
      </Card>
    </div>
  );
}
