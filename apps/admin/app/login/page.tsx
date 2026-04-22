import { Suspense } from 'react';
import { LoginForm } from '@/components/login-form';

export const metadata = { title: 'Вхід · TrashFlow' };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">TrashFlow</p>
          <h1 className="text-xl font-bold">Вхід диспетчера</h1>
          <p className="text-sm text-muted-foreground">
            Доступ надається адміністратором громади.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
