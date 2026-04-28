import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const FUEL_L_PER_100KM = 28;
const FUEL_UAH_PER_L = 58;
const STATIC_PICKUPS_PER_WEEK_PER_BIN = 2; // "every Tue/Thu" baseline
const STATIC_KM_PER_PICKUP = 1.5; // approx shuttle to/from depot

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || !['dispatcher', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  const supabase = createClient() as unknown as {
    from: (t: string) => any;
  };

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

  // Routes generated in last 7 days (the "after" world).
  const routesRes = await supabase
    .from('routes')
    .select('distance_m, stops, planned_for, status')
    .gte('planned_for', sevenDaysAgo.slice(0, 10));

  if (routesRes.error) {
    return NextResponse.json({ error: routesRes.error.message }, { status: 500 });
  }

  const routes = (routesRes.data ?? []) as Array<{
    distance_m: number | null;
    stops: unknown;
    status: string;
  }>;

  const afterKm =
    routes.reduce((acc, r) => acc + (Number(r.distance_m) || 0), 0) / 1000;
  const afterPickups = routes.reduce(
    (acc, r) => acc + (Array.isArray(r.stops) ? r.stops.length : 0),
    0,
  );

  // Total active public + household bins, for the "before" baseline.
  const binsRes = await supabase
    .from('bins')
    .select('id, kind', { count: 'exact', head: true })
    .eq('is_active', true);
  const binsCount = (binsRes.count as number) ?? 0;

  // Static schedule baseline: every bin emptied 2x/week regardless of fill.
  const beforePickups = binsCount * STATIC_PICKUPS_PER_WEEK_PER_BIN;
  const beforeKm = beforePickups * STATIC_KM_PER_PICKUP;

  const kmSaved = Math.max(0, beforeKm - afterKm);
  const litresSaved = (kmSaved * FUEL_L_PER_100KM) / 100;
  const uahSaved = litresSaved * FUEL_UAH_PER_L;
  const annualUahSaved = uahSaved * 52; // extrapolate from 1-week sample

  return NextResponse.json({
    sample: {
      windowDays: 7,
      routesGenerated: routes.length,
      afterKm: round1(afterKm),
      afterPickups,
      beforeKm: round1(beforeKm),
      beforePickups,
    },
    savings: {
      kmSaved: round1(kmSaved),
      kmSavedPct: beforeKm > 0 ? round1((kmSaved / beforeKm) * 100) : 0,
      litresSaved: round1(litresSaved),
      uahSavedWeek: Math.round(uahSaved),
      uahSavedYear: Math.round(annualUahSaved),
    },
    assumptions: {
      fuelLitersPer100Km: FUEL_L_PER_100KM,
      fuelUahPerL: FUEL_UAH_PER_L,
      staticPickupsPerWeekPerBin: STATIC_PICKUPS_PER_WEEK_PER_BIN,
      staticKmPerPickup: STATIC_KM_PER_PICKUP,
    },
  });
}

function round1(x: number): number {
  return Math.round(x * 10) / 10;
}
