import { InteractiveView } from '@/components/interactive-view';
import { PageHead } from '@/components/design/page-head';

export const metadata = { title: 'Інтерактив · TrashFlow' };

export default function InteractivePage() {
  return (
    <>
      <PageHead title="Інтерактив" backHref="/" />
      <div className="flex-1 overflow-y-auto px-5 pb-[40px]">
        <InteractiveView />
      </div>
    </>
  );
}
