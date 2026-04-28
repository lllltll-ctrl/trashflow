import { SupportForm } from '@/components/support-form';
import { PageHead } from '@/components/design/page-head';

export const metadata = { title: 'Підтримка · TrashFlow' };

export default function SupportPage() {
  return (
    <>
      <PageHead title="Підтримка" backHref="/" />
      <div className="flex-1 overflow-y-auto px-5 pb-[40px]">
        <SupportForm />
      </div>
    </>
  );
}
