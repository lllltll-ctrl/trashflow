import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

export const metadata = { title: 'Офлайн · TrashFlow' };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
            <WifiOff className="size-8 text-muted-foreground" aria-hidden />
          </div>
          <CardTitle>Немає з&apos;єднання</CardTitle>
          <CardDescription>
            Ця сторінка недоступна офлайн. Але попередньо відкриті розділи — так.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-center text-sm">
          <p className="text-muted-foreground">Що можна зробити зараз:</p>
          <ul className="inline-block text-left text-muted-foreground">
            <li>· Переглянути нещодавно відкриті точки збору</li>
            <li>· Класифікувати фото, якщо сторінка вже завантажена</li>
            <li>· Спробувати ще раз коли мережа повернеться</li>
          </ul>
          <p className="pt-3">
            <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
              Повернутись на головну
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
