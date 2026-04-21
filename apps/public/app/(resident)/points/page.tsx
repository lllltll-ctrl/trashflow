import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isWasteCategory, type WasteCategoryId } from '@trashflow/db';
import { PointsBrowser } from '@/components/points-browser';

export const metadata = { title: 'Точки збору · TrashFlow' };

export default function PointsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const rawCategory = searchParams.category;
  const initialCategory: WasteCategoryId | null =
    typeof rawCategory === 'string' && isWasteCategory(rawCategory) ? rawCategory : null;

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
        <h1 className="text-2xl font-bold leading-tight">Точки збору поблизу</h1>
        <p className="text-sm text-muted-foreground">
          Увімкніть геолокацію, щоб ми показали найближчі пункти прийому у вашому районі.
        </p>
      </header>

      <PointsBrowser initialCategory={initialCategory} />
    </main>
  );
}
