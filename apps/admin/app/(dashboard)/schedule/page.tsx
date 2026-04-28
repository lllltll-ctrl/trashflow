import { PRYLUKY_COMMUNITY_ID } from '@trashflow/db';
import { ScheduleManager } from '@/components/schedule-manager';
import { getCurrentProfile } from '@/lib/queries';
import { listPickupSchedules } from '@/lib/schedules';

export const metadata = { title: 'Графік вивозу · TrashFlow Admin' };

export default async function SchedulePage() {
  const [schedules, profile] = await Promise.all([listPickupSchedules(), getCurrentProfile()]);
  // Multi-tenant ready: write goes to the dispatcher's own community.
  // Falls back to the Pryluky pilot constant only if profile fetch fails
  // (which middleware should already have prevented).
  const communityId = profile?.community_id ?? PRYLUKY_COMMUNITY_ID;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Графік вивозу</h1>
        <p className="text-sm text-muted-foreground">
          Розклад збору відходів по районах. Мешканці бачать це у застосунку та плануватимуть
          винесення сміття за добу до приїзду машини.
        </p>
      </header>
      <ScheduleManager initial={schedules} communityId={communityId} />
    </div>
  );
}
