import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

export const metadata = { title: 'Скарги · TrashFlow Admin' };

export default function ComplaintsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Скарги</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Таблиця скарг</CardTitle>
          <CardDescription>
            TODO: TanStack Table, server-side pagination, фільтри за статусом і категорією,
            дії: призначити бригаду, позначити розв&apos;язаною. Usunąти скаргу — лише admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Реалізується агентом <code>frontend-admin</code> день 4 плану.
        </CardContent>
      </Card>
    </div>
  );
}
