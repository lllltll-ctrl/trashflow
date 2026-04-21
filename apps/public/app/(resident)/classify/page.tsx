import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ClassifyForm } from '@/components/classify-form';

export const metadata = { title: 'Класифікувати · TrashFlow' };

export default function ClassifyPage() {
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
        <h1 className="text-2xl font-bold leading-tight">Що це за відходи?</h1>
        <p className="text-sm text-muted-foreground">
          Зробіть одне фото сміття — покажемо категорію та куди його віднести.
        </p>
      </header>
      <ClassifyForm />
    </main>
  );
}
