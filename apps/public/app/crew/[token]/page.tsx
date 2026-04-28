import { notFound } from 'next/navigation';
import { clientEnv } from '@/lib/env';
import { DriverRoute, type DriverRouteData } from '@/components/driver-route';

export const metadata = { title: 'Маршрут водія · TrashFlow' };
export const dynamic = 'force-dynamic';

async function fetchRouteByToken(token: string): Promise<DriverRouteData | null> {
  const url = `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/route_by_driver_token`;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_token: token }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id as string,
    vehicleLabel: (row.vehicle_label as string) ?? 'Машина',
    plate: (row.plate as string) ?? '',
    plannedFor: row.planned_for as string,
    status: row.status as 'planned' | 'in_progress' | 'done' | 'cancelled',
    distanceM: Number(row.distance_m ?? 0),
    durationS: Number(row.duration_s ?? 0),
    stops: (row.stops as DriverRouteData['stops']) ?? [],
    completedBinIds: ((row.completed_bin_ids as string[]) ?? []).filter(Boolean),
  };
}

export default async function CrewRoutePage({ params }: { params: { token: string } }) {
  const data = await fetchRouteByToken(params.token);
  if (!data) notFound();

  return <DriverRoute initial={data} token={params.token} />;
}
