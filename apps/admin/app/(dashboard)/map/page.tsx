import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

export const metadata = { title: 'Тепломапа · TrashFlow Admin' };

export default function MapPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Тепломапа скарг</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Leaflet heatmap</CardTitle>
          <CardDescription>
            TODO: react-leaflet + leaflet.heat, 30-денне вікно за замовчуванням, перемикач на
            hex-grid (RPC complaint_heatmap) для агрегованого вигляду.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Реалізується агентом <code>frontend-admin</code> день 4 плану.
        </CardContent>
      </Card>
    </div>
  );
}
