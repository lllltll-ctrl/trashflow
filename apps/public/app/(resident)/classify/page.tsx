import { ClassifyForm } from '@/components/classify-form';
import { PageHead } from '@/components/design/page-head';
import { HeroBand } from '@/components/design/hero-band';

export const metadata = { title: 'Класифікувати · TrashFlow' };

export default function ClassifyPage() {
  return (
    <>
      <PageHead title="Класифікація" backHref="/" />
      <HeroBand
        eyebrow="AI-підказка"
        titleBefore="Сфотографуй "
        titleEm="сміття"
        titleAfter=" — підкажемо, куди здати."
        sub="Модель розпізнає 5 категорій за 2 секунди. Працює офлайн."
      />
      <div className="flex-1 overflow-y-auto px-5 pb-[120px]">
        <ClassifyForm />
      </div>
    </>
  );
}
