import { ComplaintsTable } from '@/components/complaints-table';
import { listComplaints } from '@/lib/queries';

export const metadata = { title: 'Скарги · TrashFlow Admin' };

export default async function ComplaintsPage() {
  const complaints = await listComplaints(undefined, 200);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Скарги</h1>
        <p className="text-sm text-muted-foreground">
          Весь трафік за останні 200 скарг. Фільтруйте за статусом і категорією.
        </p>
      </header>
      <ComplaintsTable initial={complaints} />
    </div>
  );
}
