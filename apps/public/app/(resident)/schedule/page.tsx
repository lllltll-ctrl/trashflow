import { ScheduleBrowser, type PublicPickupSchedule } from '@/components/schedule-browser';
import { PageHead } from '@/components/design/page-head';
import { clientEnv } from '@/lib/env';

export const metadata = { title: 'Графік вивозу · TrashFlow' };

async function loadSchedules(): Promise<PublicPickupSchedule[]> {
  const base = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  try {
    const res = await fetch(
      `${base}/rest/v1/pickup_schedules?select=id,district,day_of_week,time_window,waste_kinds,notes&is_active=eq.true&order=district.asc,day_of_week.asc`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return [];
    return (await res.json()) as PublicPickupSchedule[];
  } catch {
    return [];
  }
}

export default async function SchedulePage() {
  const schedules = await loadSchedules();

  return (
    <>
      <PageHead title="Графік" backHref="/" />
      <div className="flex-1 overflow-y-auto px-5 pb-[120px]">
        <ScheduleBrowser initial={schedules} />
      </div>
    </>
  );
}
