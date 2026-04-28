import { listMarketplaceItems, type MarketplaceCategory } from '@/lib/marketplace';
import { PageHead } from '@/components/design/page-head';
import { HeroBand } from '@/components/design/hero-band';
import { MarketplaceList } from '@/components/marketplace-list';

export const metadata = { title: 'Барахолка · TrashFlow' };
export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = new Set<MarketplaceCategory>([
  'electronics',
  'furniture',
  'clothes',
  'books',
  'toys',
  'other',
]);

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { c?: string };
}) {
  const raw = searchParams.c;
  const category =
    typeof raw === 'string' && VALID_CATEGORIES.has(raw as MarketplaceCategory)
      ? (raw as MarketplaceCategory)
      : null;

  const items = await listMarketplaceItems({ category });

  return (
    <>
      <PageHead title="Барахолка" backHref="/" />
      <HeroBand
        pale
        eyebrow="Безкоштовна громадська барахолка"
        titleBefore="Не викидай — "
        titleEm="віддай"
        titleAfter=" сусіду."
        sub="Електроніка, меблі, одяг, книги. Все безкоштовно. Опиши річ і телефон — хто потребує, забере."
      />
      <div className="flex-1 overflow-y-auto px-5 pb-[40px]">
        <MarketplaceList initial={items} activeCategory={category} />
      </div>
    </>
  );
}
