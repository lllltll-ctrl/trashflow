import { clientEnv } from './env';

export type MarketplaceCategory =
  | 'electronics'
  | 'furniture'
  | 'clothes'
  | 'books'
  | 'toys'
  | 'other';

export const CATEGORY_LABELS_UA: Record<MarketplaceCategory, string> = {
  electronics: 'Електроніка',
  furniture: 'Меблі',
  clothes: 'Одяг',
  books: 'Книги',
  toys: 'Іграшки',
  other: 'Інше',
};

export const CATEGORY_ICONS: Record<MarketplaceCategory, string> = {
  electronics: '📱',
  furniture: '🛋️',
  clothes: '👕',
  books: '📚',
  toys: '🧸',
  other: '🎁',
};

export const CATEGORY_ORDER: MarketplaceCategory[] = [
  'electronics',
  'furniture',
  'clothes',
  'books',
  'toys',
  'other',
];

export type MarketplaceListItem = {
  id: string;
  title: string;
  description: string | null;
  category: MarketplaceCategory;
  contactName: string;
  photoUrl: string | null;
  createdAt: string;
  expiresAt: string;
};

export type MarketplaceItemFull = MarketplaceListItem & {
  contactPhone: string;
  status: 'available' | 'taken' | 'expired';
};

const BASE = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
const KEY = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SLUG = clientEnv.NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG;

const HEADERS = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

export async function listMarketplaceItems(opts: {
  category?: MarketplaceCategory | null;
  signal?: AbortSignal;
} = {}): Promise<MarketplaceListItem[]> {
  const res = await fetch(`${BASE}/rest/v1/rpc/marketplace_list`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      p_community_slug: SLUG,
      p_category: opts.category ?? null,
      p_limit: 60,
    }),
    cache: 'no-store',
    signal: opts.signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  return rows.map(rowToList);
}

export async function getMarketplaceItem(id: string): Promise<MarketplaceItemFull | null> {
  const res = await fetch(`${BASE}/rest/v1/rpc/marketplace_get_one`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ p_id: id }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  const row = rows[0];
  if (!row) return null;
  return {
    ...rowToList(row),
    contactPhone: (row.contact_phone as string) ?? '',
    status: row.status as MarketplaceItemFull['status'],
  };
}

export async function postMarketplaceItem(input: {
  title: string;
  description: string;
  category: MarketplaceCategory;
  contactName: string;
  contactPhone: string;
  photoUrl: string | null;
}): Promise<{ id: string; editToken: string }> {
  const res = await fetch(`${BASE}/rest/v1/rpc/marketplace_post`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      p_title: input.title,
      p_description: input.description,
      p_category: input.category,
      p_contact_name: input.contactName,
      p_contact_phone: input.contactPhone,
      p_photo_url: input.photoUrl,
      p_community_slug: SLUG,
    }),
  });
  if (!res.ok) {
    throw new Error((await res.text()).slice(0, 200));
  }
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  const row = rows[0];
  if (!row) throw new Error('Постгрес повернув порожню відповідь');
  return { id: row.id as string, editToken: row.edit_token as string };
}

export async function markMarketplaceItemTaken(
  id: string,
  editToken: string,
): Promise<void> {
  const res = await fetch(`${BASE}/rest/v1/rpc/marketplace_mark_taken`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ p_id: id, p_edit_token: editToken }),
  });
  if (!res.ok) {
    throw new Error((await res.text()).slice(0, 200));
  }
}

function rowToList(row: Record<string, unknown>): MarketplaceListItem {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    category: row.category as MarketplaceCategory,
    contactName: row.contact_name as string,
    photoUrl: (row.photo_url as string) ?? null,
    createdAt: row.created_at as string,
    expiresAt: row.expires_at as string,
  };
}

/**
 * Upload a photo to the public 'marketplace-photos' bucket. Returns the
 * publicly-accessible URL. Caller is responsible for compressing the file
 * (see lib/compress) before passing it in — bucket caps at 5 MB.
 */
export async function uploadMarketplacePhoto(file: File): Promise<string> {
  const ext = inferExtension(file);
  const filename = `${cryptoUuid()}.${ext}`;
  const url = `${BASE}/storage/v1/object/marketplace-photos/${filename}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': file.type || 'image/jpeg',
      'x-upsert': 'false',
      'cache-control': '3600',
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Завантаження не вдалося: ${res.status} ${await res.text()}`);
  }
  return `${BASE}/storage/v1/object/public/marketplace-photos/${filename}`;
}

function inferExtension(file: File): string {
  if (file.type.includes('png')) return 'png';
  if (file.type.includes('webp')) return 'webp';
  return 'jpg';
}

function cryptoUuid(): string {
  // crypto.randomUUID is available in all modern browsers we target.
  // Fallback for ancient ones is a Math.random hex (not RFC compliant but
  // collision-safe enough for our anonymous bucket).
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, '0'),
  ).join('');
}
