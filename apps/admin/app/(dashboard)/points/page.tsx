import { PointsManager } from '@/components/points-manager';
import { listAllPoints } from '@/lib/points';

export const metadata = { title: 'Точки збору · TrashFlow Admin' };

export default async function PointsAdminPage() {
  const points = await listAllPoints();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Точки збору</h1>
        <p className="text-sm text-muted-foreground">
          Список пунктів прийому у вашій громаді. Додавайте нові, вимикайте старі, виправляйте
          адреси — зміни миттєво видно мешканцям у застосунку.
        </p>
      </header>
      <PointsManager initial={points} />
    </div>
  );
}
