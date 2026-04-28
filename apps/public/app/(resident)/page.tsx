import { HomeContent } from '@/components/home-content';
import { clientEnv } from '@/lib/env';

type HomeStats = { activePoints: number; communityName: string };

const COMMUNITY_SHORT_NAMES: Record<string, string> = { pryluky: 'Прилуки' };

async function loadStats(): Promise<HomeStats> {
  const base = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const slug = clientEnv.NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG;
  const fallback: HomeStats = {
    activePoints: 20,
    communityName: COMMUNITY_SHORT_NAMES[slug] ?? 'Прилуки',
  };
  try {
    const res = await fetch(
      `${base}/rest/v1/collection_points?select=id&is_active=eq.true`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
        next: { revalidate: 60 },
      },
    );
    const count = Number((res.headers.get('content-range') ?? '').split('/')[1] ?? 0);
    return { activePoints: count || fallback.activePoints, communityName: fallback.communityName };
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const stats = await loadStats();
  return <HomeContent stats={stats} />;
}
