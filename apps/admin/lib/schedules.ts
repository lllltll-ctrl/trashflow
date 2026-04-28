import 'server-only';
import { createClient } from './supabase/server';

export type PickupSchedule = {
  id: string;
  community_id: string;
  district: string;
  day_of_week: number;
  time_window: string;
  waste_kinds: string[];
  notes: string | null;
  is_active: boolean;
};

export async function listPickupSchedules(): Promise<PickupSchedule[]> {
  const client = createClient();
  const { data, error } = await client
    .from('pickup_schedules')
    .select('id, community_id, district, day_of_week, time_window, waste_kinds, notes, is_active')
    .order('district', { ascending: true })
    .order('day_of_week', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PickupSchedule[];
}
