import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@trashflow/db/types';
import { clientEnv } from '../env';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export function createClient() {
  const cookieStore = cookies();
  return createSupabaseServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — ignore; middleware refreshes sessions.
          }
        },
      },
    },
  );
}
