import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@trashflow/ui';

export const metadata = { title: 'Вхід · TrashFlow' };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Вхід диспетчера</CardTitle>
          <CardDescription>
            TODO: Supabase Auth UI (magic link + пароль), after sign-in redirect до /dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Реалізується агентом <code>frontend-admin</code> день 4 плану.
        </CardContent>
      </Card>
    </main>
  );
}
