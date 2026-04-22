'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Spinner } from '@trashflow/ui';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const authError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (authError) toast.error(`Помилка входу: ${authError}`);
  }, [authError]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    const supabase = createClient();
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    if (next !== '/') callbackUrl.searchParams.set('next', next);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });
    setSending(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-3 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-6" aria-hidden />
        </div>
        <p className="font-medium">Посилання для входу надіслано.</p>
        <p className="text-sm text-muted-foreground">
          Перевірте пошту <strong>{email}</strong> — перейдіть за посиланням у листі. Вікно можна
          закрити.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block space-y-2 text-sm font-medium">
        Службова e-mail адреса
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={sending}
          placeholder="dispatcher@pryluky.ua"
          className="w-full rounded-md border border-input bg-background p-3 text-sm"
        />
      </label>
      <Button type="submit" size="lg" className="w-full" disabled={sending}>
        {sending ? <Spinner label="Надсилаю лист…" /> : 'Отримати посилання для входу'}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Вхід без паролю — посилання приходить на пошту, дійсне 10 хвилин.
      </p>
    </form>
  );
}
