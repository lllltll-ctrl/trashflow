import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/queries';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile || !['dispatcher', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { vehicleId?: string };

  const supabase = createClient() as unknown as {
    rpc: (
      fn: string,
      args?: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };

  const { data, error } = await supabase.rpc('tf_generate_complaint_route', {
    p_vehicle_id: body.vehicleId ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows = (data as Array<Record<string, unknown>>) ?? [];
  const first = rows[0];
  return NextResponse.json({
    routeId: (first?.route_id as string) ?? null,
    stopCount: (first?.stop_count as number) ?? 0,
  });
}
