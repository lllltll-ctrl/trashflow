/**
 * Placeholder. Regenerate with:
 *   pnpm exec supabase gen types typescript --linked > packages/db/src/types.gen.ts
 * after the first migration is applied.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
