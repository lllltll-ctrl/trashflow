'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { Badge } from '@trashflow/ui';
import type { Complaint } from '@/lib/types';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const PRYLUKY_CENTER: [number, number] = [50.5942, 32.3874];

type Mode = 'markers' | 'heatmap';

export function AdminMap({ complaints }: { complaints: Complaint[] }) {
  const [mode, setMode] = useState<Mode>('markers');

  const positioned = useMemo(
    () => complaints.filter((c): c is Complaint & { lat: number; lng: number } =>
      c.lat !== null && c.lng !== null,
    ),
    [complaints],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1">
          <ModeButton active={mode === 'markers'} onClick={() => setMode('markers')}>
            Маркери
          </ModeButton>
          <ModeButton active={mode === 'heatmap'} onClick={() => setMode('heatmap')}>
            Тепломапа
          </ModeButton>
        </div>
        <Badge variant="outline" className="font-normal">
          {positioned.length} скарг з координатами
        </Badge>
      </div>
      <MapContainer
        center={PRYLUKY_CENTER}
        zoom={13}
        scrollWheelZoom
        className="h-[28rem] w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mode === 'markers' ? (
          positioned.map((c) => (
            <Marker key={c.id} position={[c.lat, c.lng]}>
              <Popup>
                <strong>{c.category_id ?? 'Без категорії'}</strong>
                <br />
                {c.description?.slice(0, 120) ?? 'Без опису'}
                <br />
                <em>{c.status}</em>
              </Popup>
            </Marker>
          ))
        ) : (
          <HeatLayer points={positioned.map((c) => [c.lat, c.lng, 0.8] as [number, number, number])} />
        )}
      </MapContainer>
    </div>
  );
}

function HeatLayer({ points }: { points: Array<[number, number, number]> }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    // Access via loose cast — leaflet.heat augments L at runtime.
    const heatPlugin = (L as unknown as {
      heatLayer: (
        latlngs: Array<[number, number, number]>,
        options?: Record<string, unknown>,
      ) => L.Layer;
    }).heatLayer;
    const layer = heatPlugin(points, {
      radius: 25,
      blur: 18,
      maxZoom: 16,
    });
    layer.addTo(map);
    return () => {
      layer.remove();
    };
  }, [map, points]);

  return null;
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-md border px-3 py-1 text-xs font-medium transition-colors ' +
        (active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background hover:bg-accent')
      }
    >
      {children}
    </button>
  );
}
