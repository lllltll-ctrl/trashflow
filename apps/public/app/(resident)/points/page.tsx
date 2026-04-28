import { isWasteCategory, type WasteCategoryId } from '@trashflow/db';
import { PointsBrowser } from '@/components/points-browser';
import { PageHead } from '@/components/design/page-head';
import { HeroBand } from '@/components/design/hero-band';

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
    <>
      <PageHead title="Точки" backHref="/" />
      <HeroBand
        pale
        eyebrow="Точки прийому"
        titleBefore="Активні "
        titleEm="точки"
        titleAfter=" у громаді"
        sub="Оберіть категорію, щоб побачити найближчі пункти прийому."
      />
      <div className="flex-1 overflow-y-auto px-5 pb-[120px]">
        <PointsBrowser initialCategory={initialCategory} />
      </div>
    </>
  );
}
