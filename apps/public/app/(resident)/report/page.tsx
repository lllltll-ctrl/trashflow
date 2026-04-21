import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ReportForm } from '@/components/report-form';

export const metadata = { title: 'Скарга · TrashFlow' };

export default function ReportPage() {
  return (
    <main className="mx-auto max-w-xl space-y-6 p-4 pt-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Назад
      </Link>
      <header className="space-y-2">
        <h1 className="text-2xl font-bold leading-tight">Повідомити про звалище</h1>
        <p className="text-sm text-muted-foreground">
          Одне фото і геолокація — решту зробить диспетчер. Зауваження по сортуванню теж
          приймаємо.
        </p>
      </header>
      <ReportForm />
    </main>
  );
}
