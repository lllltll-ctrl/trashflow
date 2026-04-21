import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10).default('placeholder-anon-key-do-not-use'),
  NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG: z.string().default('pryluky'),
  NEXT_PUBLIC_MAPTILER_KEY: z.string().optional(),
});

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG: process.env.NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG,
  NEXT_PUBLIC_MAPTILER_KEY: process.env.NEXT_PUBLIC_MAPTILER_KEY,
});

export type ClientEnv = typeof clientEnv;
