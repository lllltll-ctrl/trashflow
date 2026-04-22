import 'server-only';
import { createClient } from './supabase/server';

export type CollectionPoint = {
  id: string;
  community_id: string;
  name: string;
  address: string | null;
  accepts: string[];
  schedule: Record<string, string> | null;
  is_active: boolean;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

type RawPoint = Omit<CollectionPoint, 'lat' | 'lng'> & {
  location: { type: 'Point'; coordinates: [number, number] } | null;
};

export async function listAllPoints(): Promise<CollectionPoint[]> {
  const client = createClient();
  const { data, error } = await client
    .from('collection_points')
    .select('*')
    .order('is_active', { ascending: false })
    .order('name');

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as RawPoint[]).map((row) => ({
    ...row,
    lat: row.location?.coordinates?.[1] ?? null,
    lng: row.location?.coordinates?.[0] ?? null,
  }));
}
