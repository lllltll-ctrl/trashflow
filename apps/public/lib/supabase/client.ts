'use client';

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { Database } from '@trashflow/db/types';
import { clientEnv } from '../env';

export function createClient() {
  return createSupabaseBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
