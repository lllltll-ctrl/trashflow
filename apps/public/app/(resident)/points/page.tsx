import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

export const metadata = { title: 'Точки збору · TrashFlow' };

export default function PointsPage() {
  return (
    <main className="mx-auto max-w-xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Точки збору</CardTitle>
          <CardDescription>
            TODO: Leaflet-мапа, фільтр за категорією, виклик RPC points_nearby,
            маршрут на пішохідну навігацію через OSRM або Google Maps intent.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Реалізується агентом <code>frontend-public</code> день 3 плану.
        </CardContent>
      </Card>
    </main>
  );
}
