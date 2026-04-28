import { ComplaintsTable } from '@/components/complaints-table';
import { RapidResponseButton } from '@/components/rapid-response-button';
import { listCrews } from '@/lib/crews';
import { listComplaintsPaginated } from '@/lib/queries';

export const metadata = { title: 'Скарги · TrashFlow Admin' };

const PAGE_SIZE = 50;

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number.parseInt(searchParams.page ?? '1', 10) || 1;
  const [{ rows, total, page: actualPage }, crews] = await Promise.all([
    listComplaintsPaginated(page, PAGE_SIZE),
    listCrews(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const openCount = rows.filter((r) => r.status === 'new' || r.status === 'assigned').length;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Скарги</h1>
          <p className="text-sm text-muted-foreground">
            {total} скарг у базі. Сторінка {actualPage} з {totalPages}, по {PAGE_SIZE} на сторінку.
            «Маршрут реагування» збирає всі відкриті скарги в один прохід вільної машини —
            окремо від планових маршрутів вивозу баків.
          </p>
        </div>
        <RapidResponseButton openCount={openCount} />
      </header>
      <ComplaintsTable
        initial={rows}
        crews={crews}
        page={actualPage}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
      />
    </div>
  );
}
