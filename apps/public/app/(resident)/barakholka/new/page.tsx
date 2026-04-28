import { PageHead } from '@/components/design/page-head';
import { HeroBand } from '@/components/design/hero-band';
import { MarketplaceForm } from '@/components/marketplace-form';

export const metadata = { title: 'Виставити товар · Барахолка' };

export default function NewMarketplacePage() {
  return (
    <>
      <PageHead title="Виставити товар" backHref="/barakholka" />
      <HeroBand
        pale
        eyebrow="Барахолка"
        titleBefore="Опиши річ — "
        titleEm="хтось"
        titleAfter=" забере."
        sub="Залишай чесний номер: іншим резидентам дзвонити, щоб домовитись про самовивіз."
      />
      <div className="flex-1 overflow-y-auto px-5 pb-[40px]">
        <MarketplaceForm />
      </div>
    </>
  );
}
