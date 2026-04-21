import { AdminMapLoader } from '@/components/admin-map-loader';
import { listComplaints } from '@/lib/queries';

export const metadata = { title: 'Мапа · TrashFlow Admin' };

export default async function MapPage() {
  const complaints = await listComplaints(undefined, 500);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Мапа скарг</h1>
        <p className="text-sm text-muted-foreground">
          Геодані останніх 500 скарг. Переключіть на «Тепломапу» щоб побачити проблемні райони.
        </p>
      </header>
      <AdminMapLoader complaints={complaints} />
    </div>
  );
}
