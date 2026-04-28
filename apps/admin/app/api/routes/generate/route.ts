import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/queries';
import { generateTodayRoutes } from '@/lib/routes';

export const dynamic = 'force-dynamic';

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile || !['dispatcher', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  try {
    const routes = await generateTodayRoutes(profile.community_id);
    return NextResponse.json({ routes });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'failed to generate routes';
    console.error('generate routes failed', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
