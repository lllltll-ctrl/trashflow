import 'server-only';
import { createClient } from './supabase/server';

export type OpsSnapshot = {
  ripeBins: number;
  totalBins: number;
  publicBins: number;
  householdBins: number;
  trucksTotal: number;
  trucksOnRoute: number;
  routesToday: number;
  pickupsToday: number;
  pickupsWeek: number;
  kmToday: number;
  kmWeek: number;
  sortedSharePct: number;
  households: {
    total: number;
    sorted: number;
    standard: number;
    unscanned: number;
  };
};

const COMMUNITY_ID = '00000000-0000-0000-0000-000000000001';

export async function getOpsSnapshot(): Promise<OpsSnapshot> {
  const supabase = createClient() as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (t: string) => any;
    rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  };

  const today = new Date().toISOString().slice(0, 10);
  const weekStart = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);

  // ── ripe bins (uses our RPC; data shape known)
  const ripeRes = await supabase.rpc('ripe_bins_for_routing', { p_threshold: 70 });
  const ripeBins = Array.isArray(ripeRes.data) ? (ripeRes.data as unknown[]).length : 0;

  // ── all bins for total/by-kind
  const binsRes = await supabase
    .from('bins')
    .select('id, kind')
    .eq('community_id', COMMUNITY_ID)
    .eq('is_active', true);
  const binsRows = (binsRes.data as Array<{ kind: string }>) ?? [];
  const totalBins = binsRows.length;
  const publicBins = binsRows.filter((b) => b.kind === 'public').length;
  const householdBins = binsRows.filter((b) => b.kind === 'household').length;

  // ── vehicles + active routes
  const trucksRes = await supabase
    .from('vehicles')
    .select('id, is_active')
    .eq('community_id', COMMUNITY_ID)
    .eq('is_active', true);
  const trucksTotal = (trucksRes.data as unknown[] | null)?.length ?? 0;

  const inProgressRes = await supabase
    .from('routes')
    .select('id, vehicle_id')
    .eq('community_id', COMMUNITY_ID)
    .eq('status', 'in_progress');
  const trucksOnRoute = new Set(
    (((inProgressRes.data as Array<{ vehicle_id: string | null }>) ?? [])
      .map((r) => r.vehicle_id)
      .filter(Boolean) as string[]),
  ).size;

  // ── routes today + week
  const routesTodayRes = await supabase
    .from('routes')
    .select('id, distance_m')
    .eq('community_id', COMMUNITY_ID)
    .eq('planned_for', today);
  const routesToday = (routesTodayRes.data as unknown[] | null)?.length ?? 0;
  const kmToday =
    ((routesTodayRes.data as Array<{ distance_m: number | null }>) ?? []).reduce(
      (s, r) => s + (Number(r.distance_m) || 0),
      0,
    ) / 1000;

  const routesWeekRes = await supabase
    .from('routes')
    .select('distance_m')
    .eq('community_id', COMMUNITY_ID)
    .gte('planned_for', weekStart);
  const kmWeek =
    ((routesWeekRes.data as Array<{ distance_m: number | null }>) ?? []).reduce(
      (s, r) => s + (Number(r.distance_m) || 0),
      0,
    ) / 1000;

  // ── pickups today + week + sort rate
  const pickupsTodayRes = await supabase
    .from('pickup_events')
    .select('id, sorted', { count: 'exact' })
    .eq('community_id', COMMUNITY_ID)
    .gte('ts', today);
  const pickupsToday = (pickupsTodayRes.count as number) ?? 0;

  const pickupsWeekRes = await supabase
    .from('pickup_events')
    .select('id, sorted', { count: 'exact' })
    .eq('community_id', COMMUNITY_ID)
    .gte('ts', weekStart);
  const weekRows = (pickupsWeekRes.data as Array<{ sorted: boolean | null }>) ?? [];
  const sortedRows = weekRows.filter((p) => p.sorted === true).length;
  const sortedSharePct = weekRows.length > 0 ? Math.round((sortedRows / weekRows.length) * 100) : 0;
  const pickupsWeek = (pickupsWeekRes.count as number) ?? 0;

  // ── households tier breakdown
  const hRes = await supabase
    .from('households')
    .select('id, pricing_tier')
    .eq('community_id', COMMUNITY_ID);
  const hRows = (hRes.data as Array<{ pricing_tier: string }>) ?? [];

  return {
    ripeBins,
    totalBins,
    publicBins,
    householdBins,
    trucksTotal,
    trucksOnRoute,
    routesToday,
    pickupsToday,
    pickupsWeek,
    kmToday: round1(kmToday),
    kmWeek: round1(kmWeek),
    sortedSharePct,
    households: {
      total: hRows.length,
      sorted: hRows.filter((h) => h.pricing_tier === 'sorted').length,
      // standard + unscanned both map to the base-rate tier now
      standard: hRows.filter((h) => h.pricing_tier !== 'sorted').length,
      unscanned: 0,
    },
  };
}

function round1(x: number): number {
  return Math.round(x * 10) / 10;
}
