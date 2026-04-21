import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

export const metadata = { title: 'Скарга · TrashFlow' };

export default function ReportPage() {
  return (
    <main className="mx-auto max-w-xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Нова скарга</CardTitle>
          <CardDescription>
            TODO: фото + автогеолокація + опис, Zod-валідація форми, insert у complaints
            із community_id та reporter_id auth.uid(), оптимістичне оновлення списку.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Реалізується агентом <code>frontend-public</code> день 3 плану.
        </CardContent>
      </Card>
    </main>
  );
}
