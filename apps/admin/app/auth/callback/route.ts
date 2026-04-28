import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Returns `next` if it is a same-origin path like "/complaints" or
 * "/points/123". Rejects protocol-relative ("//evil.com"), backslash-escaped
 * ("/\evil.com"), and absolute URLs — all of which can be used for
 * open-redirect attacks even when `startsWith('/')` is true.
 */
function safeNextPath(raw: string | null): string {
  if (!raw) return '/';
  // Must start with a single '/' followed by a non-slash, non-backslash char.
  if (!/^\/[^/\\]/.test(raw)) return '/';
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
