'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@trashflow/ui';

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const handleLogin = () => {
    document.cookie = `tf_admin_demo=1; path=/; max-age=86400; SameSite=Lax`;
    window.location.href = next;
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700 text-white text-base font-semibold"
        onClick={handleLogin}
      >
        Увійти в адмін панель
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Демо-режим. Доступ дійсний 24 години.
      </p>
    </div>
  );
}
