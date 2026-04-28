'use client';

import { clientEnv } from './env';
import { PRYLUKY_COMMUNITY_ID, type WasteCategoryId } from '@trashflow/db';
import { resolveCommunityId } from './community-resolver';

export type ComplaintDraft = {
  lat: number;
  lng: number;
  photo: File;
  description?: string;
  category?: WasteCategoryId;
};

export type SubmittedComplaint = {
  id: string;
  status: string;
  created_at: string;
};

export const ALLOWED_PHOTO_EXTENSIONS: ReadonlySet<string> = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
]);

/**
 * Extracts a safe extension from a user-supplied filename. Strips everything
 * except `[a-z0-9]`, lowercases, and falls back to 'jpg' if the result isn't
 * in the allowlist. A filename like `../etc/passwd.php.JPG` becomes 'jpg'.
 *
 * Exported so it can be unit-tested in isolation — the upload flow itself is
 * hard to test without a Supabase Storage stub.
 */
export function safePhotoExtension(filename: string): string {
  const raw = filename.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';
  return ALLOWED_PHOTO_EXTENSIONS.has(raw) ? raw : 'jpg';
}

async function uploadPhoto(file: File, communityId: string): Promise<string> {
  const ext = safePhotoExtension(file.name);
  const path = `${communityId}/${crypto.randomUUID()}.${ext}`;

  const uploadUrl = `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/complaint-photos/${path}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': file.type,
      'x-upsert': 'false',
    },
    body: file,
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => '');
    throw new Error(`Не вдалося завантажити фото (${response.status}): ${msg.slice(0, 120)}`);
  }

  return `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/complaint-photos/${path}`;
}

async function insertComplaint(
  communityId: string,
  body: {
    photo_url: string;
    lat: number;
    lng: number;
    description?: string;
    category_id?: WasteCategoryId;
  },
): Promise<SubmittedComplaint> {
  const url = `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/complaints`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      community_id: communityId,
      location: `SRID=4326;POINT(${body.lng} ${body.lat})`,
      photo_urls: [body.photo_url],
      description: body.description ?? null,
      category_id: body.category_id ?? null,
    }),
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => '');
    throw new Error(`Сервер відхилив скаргу (${response.status}): ${msg.slice(0, 160)}`);
  }

  const rows = (await response.json()) as SubmittedComplaint[];
  if (!rows[0]) throw new Error('Сервер не повернув створену скаргу.');
  return rows[0];
}

export async function submitComplaint(draft: ComplaintDraft): Promise<SubmittedComplaint> {
  // Resolve community by slug rather than baking the UUID into the bundle —
  // this makes the public PWA portable to other hromadas via env var alone.
  const communityId = (await resolveCommunityId()) ?? PRYLUKY_COMMUNITY_ID;
  const photoUrl = await uploadPhoto(draft.photo, communityId);
  return insertComplaint(communityId, {
    photo_url: photoUrl,
    lat: draft.lat,
    lng: draft.lng,
    description: draft.description,
    category_id: draft.category,
  });
}

export async function reportFullBin(opts: {
  lat: number;
  lng: number;
  description?: string;
}): Promise<{ binId: string; distanceM: number }> {
  const SLUG = clientEnv.NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG ?? 'pryluky';
  const url = `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/report_full_bin`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_lat: opts.lat,
      p_lng: opts.lng,
      p_description: opts.description ?? null,
      p_community_slug: SLUG,
    }),
  });
  if (!response.ok) {
    const msg = await response.text().catch(() => '');
    throw new Error(`Не вдалося відзначити бак (${response.status}): ${msg.slice(0, 160)}`);
  }
  const rows = (await response.json()) as Array<{ bin_id: string; distance_m: number }>;
  const row = rows[0];
  if (!row) throw new Error('Сервер не повернув підтвердження');
  return { binId: row.bin_id, distanceM: row.distance_m };
}

export async function getBrowserLocation(): Promise<{ lat: number; lng: number }> {
  if (!('geolocation' in navigator)) {
    throw new Error('Геолокація недоступна на цьому пристрої.');
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(geoErrorMessage(err))),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
    );
  });
}

function geoErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Для скарги потрібен доступ до геолокації. Увімкніть його в налаштуваннях браузера.';
    case err.POSITION_UNAVAILABLE:
      return 'Не вдалося визначити координати. Спробуйте вийти на відкрите місце.';
    case err.TIMEOUT:
      return 'Очікування геолокації перевищило ліміт. Спробуйте ще раз.';
    default:
      return 'Помилка геолокації.';
  }
}
