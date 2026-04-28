import type { ComplaintStatus } from '@trashflow/db';

/**
 * Pure helpers for the complaints UI. Kept in their own module so they can
 * be unit-tested without instantiating React components.
 */

export function statusToLabel(status: ComplaintStatus): string {
  return {
    new: 'Нова',
    assigned: 'Призначено',
    in_progress: 'У роботі',
    resolved: 'Вирішено',
    rejected: 'Відхилено',
  }[status];
}

export type StatusVariant = 'destructive' | 'warning' | 'success' | 'secondary';

export function statusToVariant(status: ComplaintStatus): StatusVariant {
  switch (status) {
    case 'new':
      return 'destructive';
    case 'assigned':
    case 'in_progress':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'rejected':
      return 'secondary';
  }
}

export type GeoPoint = { type: 'Point'; coordinates: [number, number] };

/**
 * PostGIS GeoJSON points serialize as `{ type: 'Point', coordinates: [lng, lat] }`.
 * Defensive against null, malformed shape, and out-of-range coordinates.
 */
export function extractCoords(
  raw: GeoPoint | null | undefined,
): { lat: number | null; lng: number | null } {
  if (
    !raw ||
    raw.type !== 'Point' ||
    !Array.isArray(raw.coordinates) ||
    raw.coordinates.length !== 2
  ) {
    return { lat: null, lng: null };
  }
  const [lng, lat] = raw.coordinates;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { lat: null, lng: null };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { lat: null, lng: null };
  }
  return { lat, lng };
}
