import { clientEnv } from './env';

export type PointNearby = {
  id: string;
  name: string;
  address: string | null;
  accepts: string[];
  schedule: Record<string, string> | null;
  lat: number;
  lng: number;
  distance_m: number;
};

export type PointsNearbyArgs = {
  lat: number;
  lng: number;
  category?: string | null;
  radius_m?: number;
  limit?: number;
  community_slug?: string;
};

export async function fetchPointsNearby(args: PointsNearbyArgs): Promise<PointNearby[]> {
  const url = `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/points_nearby`;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_lat: args.lat,
      p_lng: args.lng,
      p_category: args.category ?? null,
      p_radius_m: args.radius_m ?? 5000,
      p_limit: args.limit ?? 20,
      p_community_slug: args.community_slug ?? clientEnv.NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`RPC failed (${response.status}): ${body}`);
  }

  return response.json();
}
