'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Truck } from 'lucide-react';
import { clientEnv } from '@/lib/env';
import { palette } from '@/components/design/tokens';

// react-leaflet/leaflet must be client-only — dynamic import keeps it out of
// the SSR bundle so the home page renders fast on first paint.
const MapInner = dynamic(() => import('./live-trucks-map-inner').then((m) => m.LiveTrucksMapInner), {
  ssr: false,
  loading: () => (
    <div
      className="grid h-full w-full place-items-center text-xs text-[color:var(--ink-mute)]"
      style={{ background: 'linear-gradient(165deg, #E8F5EC 0%, #F4F9F1 100%)' }}
    >
      завантаження карти…
    </div>
  ),
});

export type ResidentTruck = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  onRoute: boolean;
  lastSeen: string;
};

export function LiveTrucksMap() {
  const [trucks, setTrucks] = useState<ResidentTruck[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchTrucks = async () => {
      try {
        const url = `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/public_active_trucks`;
        const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ p_community_slug: clientEnv.NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG }),
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const rows = (await res.json()) as Array<Record<string, unknown>>;
        if (cancelled) return;
        setTrucks(
          rows.map((row) => ({
            id: row.id as string,
            label: row.label as string,
            lat: row.lat as number,
            lng: row.lng as number,
            speedKmh: Number(row.speed_kmh ?? 0),
            heading: (row.heading as number) ?? 0,
            onRoute: Boolean(row.on_route),
            lastSeen: row.last_seen as string,
          })),
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'fetch failed');
      }
    };
    fetchTrucks();
    const id = setInterval(fetchTrucks, 20_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const moving = trucks.filter((t) => t.onRoute).length;

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-[rgba(14,58,35,0.06)] bg-white"
      style={{ boxShadow: 'var(--tf-shadow-md)' }}
    >
      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className="grid size-9 place-items-center rounded-[12px] text-[color:var(--green-deep)]"
            style={{ background: palette.greenMint }}
          >
            <Truck className="size-[18px]" strokeWidth={2.2} />
          </span>
          <div>
            <div
              className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Машини в роботі
            </div>
            <div className="text-[15px] font-bold tracking-[-0.01em] text-[color:var(--green-deep)]">
              {moving > 0 ? `${moving} на маршруті · ${trucks.length} в парку` : `${trucks.length} в парку`}
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10.5px] text-[color:var(--ink-mute)]"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
          <span
            className="inline-block size-1.5 animate-pulse rounded-full"
            style={{ background: palette.greenLight }}
          />
          ОНОВЛЕННЯ 20с
        </span>
      </div>

      {/* Map */}
      <div className="relative mx-3.5 mt-2.5 mb-3.5 h-[200px] overflow-hidden rounded-[18px]">
        <MapInner trucks={trucks} />
        {error && (
          <div
            className="absolute inset-0 grid place-items-center text-xs text-[color:var(--c-hazardous)]"
            style={{ background: 'rgba(255,255,255,0.85)' }}
          >
            не вдалося завантажити: {error}
          </div>
        )}
      </div>
    </div>
  );
}
