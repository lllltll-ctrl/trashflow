import 'server-only';
import { createClient } from './supabase/server';
import { extractCoords, type GeoPoint } from './complaints-utils';
import type { Complaint, KpiSnapshot, Profile } from './types';

type ComplaintRow = Omit<Complaint, 'lat' | 'lng'> & {
  location: GeoPoint | null;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const client = createClient();
  const { data: session } = await client.auth.getUser();
  if (!session.user) return null;

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Profile | null) ?? null;
}

export async function listComplaints(
  status?: Complaint['status'],
  limit = 100,
): Promise<Complaint[]> {
  const client = createClient();
  let query = client
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as ComplaintRow[]).map((row) => ({
    ...row,
    ...extractCoords(row.location),
  })) as Complaint[];
}

export type ComplaintsPage = {
  rows: Complaint[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Paginated complaints fetch — uses Postgres `range()` plus `count: 'exact'`
 * so the table can render only one page at a time. This pairs with the index
 * `complaints_community_feed(community_id, status, created_at desc)`.
 */
export async function listComplaintsPaginated(
  page: number,
  pageSize: number,
  status?: Complaint['status'],
): Promise<ComplaintsPage> {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.min(200, Math.floor(pageSize)));
  const offset = (safePage - 1) * safeSize;

  const client = createClient();
  let query = client
    .from('complaints')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + safeSize - 1);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as unknown as ComplaintRow[]).map((row) => ({
    ...row,
    ...extractCoords(row.location),
  })) as Complaint[];

  return { rows, total: count ?? 0, page: safePage, pageSize: safeSize };
}

export async function getKpiSnapshot(): Promise<KpiSnapshot> {
  const client = createClient();

  const [newResult, inProgressResult, resolvedResult] = await Promise.all([
    client.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    client
      .from('complaints')
      .select('id', { count: 'exact', head: true })
      .in('status', ['assigned', 'in_progress']),
    client
      .from('complaints')
      .select('id, created_at, resolved_at', { count: 'exact' })
      .eq('status', 'resolved')
      .gte('resolved_at', new Date(Date.now() - 7 * 24 * 3600_000).toISOString()),
  ]);

  const resolvedRows = (resolvedResult.data ?? []) as Array<{
    created_at: string;
    resolved_at: string | null;
  }>;

  const durations = resolvedRows
    .map((r) =>
      r.resolved_at ? (Date.parse(r.resolved_at) - Date.parse(r.created_at)) / 3_600_000 : null,
    )
    .filter((x): x is number => x !== null);

  return {
    new_count: newResult.count ?? 0,
    in_progress_count: inProgressResult.count ?? 0,
    resolved_7d: resolvedResult.count ?? 0,
    avg_resolution_hours: durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : null,
  };
}
