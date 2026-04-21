import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10).default('placeholder-anon-key-do-not-use'),
  NEXT_PUBLIC_MAPTILER_KEY: z.string().optional(),
});

export const env = schema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_MAPTILER_KEY: process.env.NEXT_PUBLIC_MAPTILER_KEY,
});
