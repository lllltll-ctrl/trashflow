import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export type MapBin = {
  id: string;
  lat: number;
  lng: number;
  fillPct: number;
  kind: 'public' | 'household';
  address: string | null;
  pricingTier: 'sorted' | 'standard' | 'unscanned' | null;
};

export type MapVehicle = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  ts: string | null;
};

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || !['dispatcher', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  // ssr 0.5.2 typing seam — see lib/routes.ts for context.
  const supabase = createClient() as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (table: string) => any;
    rpc: (fn: string) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
  const [binsRes, vehiclesRes] = await Promise.all([
    supabase
      .from('bins_with_latest_fill')
      .select('id, fill_pct, kind, address, lat, lng, pricing_tier'),
    supabase.rpc('vehicles_with_latest_position'),
  ]);

  if (binsRes.error) {
    return NextResponse.json({ error: binsRes.error.message }, { status: 500 });
  }
  if (vehiclesRes.error) {
    return NextResponse.json({ error: vehiclesRes.error.message }, { status: 500 });
  }

  const bins: MapBin[] = (((binsRes.data as Record<string, unknown>[] | null) ?? [])).map((row) => ({
    id: row.id as string,
    lat: row.lat as number,
    lng: row.lng as number,
    fillPct: (row.fill_pct as number) ?? 0,
    kind: row.kind as 'public' | 'household',
    address: (row.address as string | null) ?? null,
    pricingTier: (row.pricing_tier as MapBin['pricingTier']) ?? null,
  }));

  const vehicles: MapVehicle[] = (((vehiclesRes.data as Record<string, unknown>[] | null) ?? [])).map(
    (row) => ({
      id: row.id as string,
      label: row.label as string,
      lat: (row.lat as number) ?? 50.5942,
      lng: (row.lng as number) ?? 32.3874,
      speedKmh: Number(row.speed_kmh ?? 0),
      heading: (row.heading as number) ?? 0,
      ts: (row.position_ts as string) ?? null,
    }),
  );

  return NextResponse.json({ bins, vehicles });
}
