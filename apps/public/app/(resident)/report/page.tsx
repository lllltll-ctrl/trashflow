import { ReportForm } from '@/components/report-form';
import { PageHead } from '@/components/design/page-head';
import { HeroBand } from '@/components/design/hero-band';

export const metadata = { title: 'Скарга · TrashFlow' };

export default function ReportPage() {
  return (
    <>
      <PageHead title="Скарга" backHref="/" />
      <HeroBand
        pale
        eyebrow="Повідомити про звалище"
        titleBefore="Знайшли "
        titleEm="проблему"
        titleAfter="?"
        sub="Надішліть фото й координати — диспетчер надасть бригаду."
      />
      <div className="flex-1 overflow-y-auto px-5 pb-[120px]">
        <ReportForm />
      </div>
    </>
  );
}
