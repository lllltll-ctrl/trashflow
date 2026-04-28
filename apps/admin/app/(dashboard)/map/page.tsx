import { AdminMapLoader } from '@/components/admin-map-loader';
import { listComplaints } from '@/lib/queries';

export const metadata = { title: 'Мапа · TrashFlow Admin' };

export default async function MapPage() {
  const complaints = await listComplaints(undefined, 500);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-3">
      <header className="shrink-0">
        <h1 className="text-2xl font-bold">Жива карта</h1>
        <p className="text-sm text-muted-foreground">
          Машини в реальному часі + тепломапа наповнення. Окремий режим — скарги.
        </p>
      </header>
      <div className="min-h-0 flex-1">
        <AdminMapLoader complaints={complaints} />
      </div>
    </div>
  );
}
