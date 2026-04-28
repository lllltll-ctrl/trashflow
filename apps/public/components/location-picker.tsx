'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Crosshair, Loader2, MapPin } from 'lucide-react';
import { palette } from '@/components/design/tokens';

// Lazy-load the Leaflet inner so SSR + the rest of the form bundle stay
// fast. The picker is only rendered when the user reaches Step 2 of /report.
const PickerInner = dynamic(
  () => import('./location-picker-inner').then((m) => m.LocationPickerInner),
  {
    ssr: false,
    loading: () => (
      <div
        className="grid h-[260px] w-full place-items-center rounded-[24px] text-xs text-[color:var(--ink-mute)]"
        style={{ background: 'linear-gradient(165deg, #E8F5EC 0%, #F4F9F1 100%)' }}
      >
        <Loader2 className="size-5 animate-spin" />
      </div>
    ),
  },
);

export type LatLng = { lat: number; lng: number };

export function LocationPicker({
  value,
  onChange,
  geolocate,
  geolocating,
}: {
  value: LatLng | null;
  onChange: (next: LatLng) => void;
  geolocate: () => void;
  geolocating: boolean;
}) {
  // Independent local copy so dragging the marker is responsive even between
  // parent re-renders.
  const [local, setLocal] = useState<LatLng | null>(value);
  useEffect(() => {
    setLocal(value);
  }, [value?.lat, value?.lng]);

  const update = (next: LatLng) => {
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div
        className="relative h-[260px] overflow-hidden rounded-[24px] border border-[rgba(14,58,35,0.08)]"
        style={{ boxShadow: 'var(--tf-shadow-sm)' }}
      >
        <PickerInner value={local} onPlace={update} />

        {/* Tap-anywhere hint when nothing placed yet */}
        {!local && (
          <div
            className="pointer-events-none absolute inset-x-3 bottom-16 rounded-[12px] bg-white/95 px-3 py-2 text-center text-[12px] font-semibold text-[color:var(--green-deep)] backdrop-blur"
          >
            Торкніться карти, щоб поставити мітку
          </div>
        )}

        {/* Geolocation shortcut (overlay, top-right) */}
        <button
          type="button"
          onClick={geolocate}
          disabled={geolocating}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-[12px] bg-white/95 px-3 py-2 text-[12px] font-bold text-[color:var(--green-deep)] backdrop-blur disabled:opacity-60"
        >
          {geolocating ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Crosshair className="size-3.5" strokeWidth={2.4} />
          )}
          Моя геолокація
        </button>

        {/* Coords readout */}
        {local && (
          <div className="absolute left-3 bottom-3 right-3 flex items-center gap-2 rounded-[12px] bg-white/95 px-3 py-2 backdrop-blur">
            <span
              className="grid size-7 shrink-0 place-items-center rounded-full"
              style={{ background: palette.greenLight }}
            >
              <MapPin className="size-4 text-white" strokeWidth={2.4} />
            </span>
            <span
              className="flex-1 truncate text-[12px] tracking-[0.06em] text-[color:var(--ink-soft)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {local.lat.toFixed(6)}, {local.lng.toFixed(6)}
            </span>
          </div>
        )}
      </div>

      <p className="text-[11.5px] leading-[1.5] text-[color:var(--ink-mute)]">
        Поставте мітку якомога ближче до звалища — диспетчеру не потрібно вгадувати, де
        точно ви бачили проблему. Можна перетягнути мітку якщо помилились.
      </p>
    </div>
  );
}
