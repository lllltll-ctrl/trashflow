import { KpiCards } from '@/components/kpi-cards';
import { ComplaintsFeed } from '@/components/complaints-feed';
import { getCurrentProfile, getKpiSnapshot, listComplaints } from '@/lib/queries';

export const metadata = { title: 'Огляд · TrashFlow Admin' };

export default async function OverviewPage() {
  const [profile, snapshot, recent] = await Promise.all([
    getCurrentProfile(),
    getKpiSnapshot(),
    listComplaints(undefined, 20),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Огляд</h1>
        <p className="text-sm text-muted-foreground">
          {profile?.full_name ? `Вітаємо, ${profile.full_name}` : 'Вітаємо'} · Прилуцька громада
        </p>
      </header>

      <KpiCards snapshot={snapshot} />

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Останні скарги (real-time)</h2>
        <ComplaintsFeed initial={recent} />
      </section>
    </div>
  );
}
