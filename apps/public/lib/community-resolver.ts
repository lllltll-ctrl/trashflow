'use client';

import { clientEnv } from './env';

/**
 * Resolves a community slug → community_id by querying Supabase REST. Cached
 * in module scope so subsequent calls in the same browser session reuse the
 * result without a network round-trip.
 *
 * Replaces the hardcoded PRYLUKY_COMMUNITY_ID in the public PWA so multi-
 * tenant deploys (different subdomain → different slug) work without code
 * changes. Falls back to null on network failure — the caller decides what
 * to do (most flows abort with a user-facing error).
 */
let cache: Promise<string | null> | null = null;
let cachedSlug: string | null = null;

export function resolveCommunityId(
  slug: string = clientEnv.NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG,
): Promise<string | null> {
  if (cache && cachedSlug === slug) return cache;
  cachedSlug = slug;
  cache = fetchCommunityId(slug);
  return cache;
}

async function fetchCommunityId(slug: string): Promise<string | null> {
  try {
    const url = `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/communities?slug=eq.${encodeURIComponent(
      slug,
    )}&select=id`;
    const res = await fetch(url, {
      headers: {
        apikey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ id: string }>;
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

// Test-only: drop the in-memory cache so tests can re-prime the resolver.
export function __resetCommunityCache(): void {
  cache = null;
  cachedSlug = null;
}
