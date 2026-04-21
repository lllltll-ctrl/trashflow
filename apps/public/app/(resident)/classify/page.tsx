import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

export const metadata = { title: 'Класифікувати · TrashFlow' };

export default function ClassifyPage() {
  return (
    <main className="mx-auto max-w-xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Класифікація фото</CardTitle>
          <CardDescription>
            TODO: захоплення фото з камери, компресія до 1280px, POST на ML-сервіс,
            показ top-1 категорії з confidence і найближчої точки прийому.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Реалізується агентом <code>frontend-public</code> день 3 плану.
        </CardContent>
      </Card>
    </main>
  );
}
