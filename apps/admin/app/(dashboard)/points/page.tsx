import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

export const metadata = { title: 'Точки збору · TrashFlow Admin' };

export default function PointsAdminPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Точки збору</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>CRUD точок</CardTitle>
          <CardDescription>
            TODO: форма створення (MapLibre picker для координат), редагування графіка (jsonb),
            увімкнення/вимкнення (is_active).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Реалізується агентом <code>frontend-admin</code> день 4 плану.
        </CardContent>
      </Card>
    </div>
  );
}
