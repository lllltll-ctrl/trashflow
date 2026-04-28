import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile || !['dispatcher', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  const supabase = createClient() as unknown as {
    rpc: (fn: string) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
  const { data, error } = await supabase.rpc('tf_simulate_tick');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ result: data });
}
