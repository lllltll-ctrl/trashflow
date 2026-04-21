'use client';

import { clientEnv } from './env';
import type { WasteCategoryId } from '@trashflow/db';

const PRYLUKY_COMMUNITY_ID = '00000000-0000-0000-0000-000000000001';

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

async function uploadPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${PRYLUKY_COMMUNITY_ID}/${crypto.randomUUID()}.${ext}`;

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

async function insertComplaint(body: {
  photo_url: string;
  lat: number;
  lng: number;
  description?: string;
  category_id?: WasteCategoryId;
}): Promise<SubmittedComplaint> {
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
      community_id: PRYLUKY_COMMUNITY_ID,
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
  const photoUrl = await uploadPhoto(draft.photo);
  return insertComplaint({
    photo_url: photoUrl,
    lat: draft.lat,
    lng: draft.lng,
    description: draft.description,
    category_id: draft.category,
  });
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
