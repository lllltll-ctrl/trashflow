import 'server-only';
import { createClient } from './supabase/server';
import type { Crew } from './types';

export async function listCrews(): Promise<Crew[]> {
  const client = createClient();
  const { data, error } = await client
    .from('crews')
    .select('id, community_id, name, phone, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Crew[];
}
