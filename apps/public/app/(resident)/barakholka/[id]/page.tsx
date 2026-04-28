import { notFound } from 'next/navigation';
import { getMarketplaceItem } from '@/lib/marketplace';
import { PageHead } from '@/components/design/page-head';
import { MarketplaceDetail } from '@/components/marketplace-detail';

export const metadata = { title: 'Оголошення · Барахолка' };
export const dynamic = 'force-dynamic';

export default async function MarketplaceDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { edit?: string };
}) {
  const item = await getMarketplaceItem(params.id);
  if (!item) notFound();

  const editToken = typeof searchParams.edit === 'string' ? searchParams.edit : null;

  return (
    <>
      <PageHead title="Оголошення" backHref="/barakholka" />
      <div className="flex-1 overflow-y-auto px-5 pb-[40px]">
        <MarketplaceDetail item={item} editToken={editToken} />
      </div>
    </>
  );
}
