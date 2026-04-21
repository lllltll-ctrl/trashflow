import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';

export type { Database };
export type TrashflowClient = SupabaseClient<Database>;

export type WasteCategoryId =
  | 'plastic'
  | 'paper'
  | 'glass'
  | 'metal'
  | 'hazardous';

export const WASTE_CATEGORIES: ReadonlyArray<WasteCategoryId> = [
  'plastic',
  'paper',
  'glass',
  'metal',
  'hazardous',
] as const;

export type ComplaintStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type UserRole = 'resident' | 'dispatcher' | 'admin';

interface CreateClientOptions {
  url: string;
  anonKey: string;
}

export function createBrowserClient(opts: CreateClientOptions): TrashflowClient {
  return createClient<Database>(opts.url, opts.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export function createServerClient(opts: {
  url: string;
  serviceRoleKey: string;
}): TrashflowClient {
  return createClient<Database>(opts.url, opts.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
