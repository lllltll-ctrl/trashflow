import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@trashflow/db/types';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith('/login') || pathname.startsWith('/auth/');

  if (!user && !isAuthRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role gate: only dispatcher/admin may use this dashboard. Residents who
  // happen to have a Supabase session must be bounced to /login with an error.
  // TODO(perf): cache role in a JWT custom claim so we don't query per hit.
  // TODO(types): drop the cast after `pnpm exec supabase gen types typescript --linked`.
  if (user && !isAuthRoute) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profilesTable = supabase.from('profiles') as any;
    const { data: profile } = (await profilesTable
      .select('role')
      .eq('id', user.id)
      .maybeSingle()) as { data: { role?: string } | null };
    const role = profile?.role;
    if (role !== 'dispatcher' && role !== 'admin') {
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('error', 'forbidden_role');
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:png|svg|webp|jpg)).*)'],
};
