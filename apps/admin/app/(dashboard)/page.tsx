import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

export const metadata = { title: 'Огляд · TrashFlow Admin' };

export default function OverviewPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Огляд</h1>
        <p className="text-sm text-muted-foreground">
          KPI по громаді + фід нових скарг (Realtime).
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>KPI картки</CardTitle>
          <CardDescription>
            TODO: 4 Tremor-картки (нові скарги, у роботі, розв&apos;язано, SLA). Realtime-підписка на
            complaints INSERT у community.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Реалізується агентом <code>frontend-admin</code> день 4 плану.
        </CardContent>
      </Card>
    </div>
  );
}
