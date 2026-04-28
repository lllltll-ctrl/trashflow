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

export const WASTE_CATEGORY_LABELS_UA: Record<WasteCategoryId, string> = {
  plastic: 'Пластик',
  paper: 'Папір і картон',
  glass: 'Скло',
  metal: 'Метал',
  hazardous: 'Небезпечні відходи',
};

export const WASTE_CATEGORY_ICONS: Record<WasteCategoryId, string> = {
  plastic: '🥤',
  paper: '📰',
  glass: '🍾',
  metal: '🥫',
  hazardous: '🔋',
};

export function isWasteCategory(value: string): value is WasteCategoryId {
  return (WASTE_CATEGORIES as ReadonlyArray<string>).includes(value);
}

export type ComplaintStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type UserRole = 'resident' | 'dispatcher' | 'admin';

/**
 * Single source of truth for the Pryluky pilot community. As soon as a real
 * community-switcher lands, replace direct imports with a server-resolved
 * value (from auth profile in admin, from URL slug in public).
 */
export const PRYLUKY_COMMUNITY_ID = '00000000-0000-0000-0000-000000000001';

export const PRYLUKY_CENTER: Readonly<{ lat: number; lng: number }> = Object.freeze({
  lat: 50.5942,
  lng: 32.3874,
});

export const DEFAULT_SEARCH_RADIUS_M = 10_000;

/**
 * Days of week in the order that pickup_schedules.day_of_week uses (Sunday = 0).
 * Pryluky residents read schedules week-by-week, so we keep both short labels for
 * dense table cells and the full names for accessible labels / aria-text.
 */
export const DAY_OF_WEEK_LABELS_UA: ReadonlyArray<{ short: string; full: string }> = [
  { short: 'Нд', full: 'Неділя' },
  { short: 'Пн', full: 'Понеділок' },
  { short: 'Вт', full: 'Вівторок' },
  { short: 'Ср', full: 'Середа' },
  { short: 'Чт', full: 'Четвер' },
  { short: 'Пт', full: 'Пʼятниця' },
  { short: 'Сб', full: 'Субота' },
] as const;

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
