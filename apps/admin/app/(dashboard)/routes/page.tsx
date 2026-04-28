import { RouteManager } from '@/components/route-manager';
import { getRipeBins, listRecentRoutes } from '@/lib/routes';

export const metadata = { title: 'Маршрути · TrashFlow' };
export const dynamic = 'force-dynamic';

export default async function RoutesPage() {
  const [routes, ripe] = await Promise.all([listRecentRoutes(), getRipeBins()]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Маршрути</h1>
        <p className="text-sm text-muted-foreground">
          Динамічна маршрутизація замість статичного графіка: щодня збираємо лише ті
          баки, які реально заповнені (≥70%). Менше зайвих рейсів → менше пального.
        </p>
      </header>
      <RouteManager initialRoutes={routes} ripeCount={ripe.length} />
    </div>
  );
}
