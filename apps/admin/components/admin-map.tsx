'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { Badge } from '@trashflow/ui';
import { PRYLUKY_CENTER } from '@trashflow/db';
import type { Complaint } from '@/lib/types';
import type { MapBin, MapVehicle } from '@/app/api/map-state/route';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MAP_CENTER: [number, number] = [PRYLUKY_CENTER.lat, PRYLUKY_CENTER.lng];

type Mode = 'live' | 'complaints';

/**
 * Two distinct modes — no overlapping layers:
 *
 *   LIVE      — bin fill heatmap (yellow → red gradient, no green so the
 *               low-fill noise doesn't drown the signal) + truck markers.
 *               Tiny 3px slate dots show individual bins for hover/tooltip,
 *               but the eye reads the heatmap, not the dots.
 *
 *   COMPLAINTS — only complaints (illegal-dump reports) coloured by status.
 *                Nothing else, so the dispatcher sees the actual problem
 *                geography.
 */
export function AdminMap({ complaints }: { complaints: Complaint[] }) {
  const [mode, setMode] = useState<Mode>('live');
  const [bins, setBins] = useState<MapBin[]>([]);
  const [vehicles, setVehicles] = useState<MapVehicle[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const positioned = useMemo(
    () =>
      complaints.filter(
        (c): c is Complaint & { lat: number; lng: number } =>
          c.lat !== null && c.lng !== null,
      ),
    [complaints],
  );

  // Poll only when on the live tab.
  useEffect(() => {
    if (mode !== 'live') return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch('/api/map-state', { cache: 'no-store' });
        if (!res.ok) return;
        const body = (await res.json()) as { bins: MapBin[]; vehicles: MapVehicle[] };
        if (!cancelled) {
          setBins(body.bins);
          setVehicles(body.vehicles);
          setLastSync(new Date());
        }
      } catch {
        // soft-fail
      }
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [mode]);

  const ripe = bins.filter((b) => b.fillPct >= 70);
  const movingTrucks = vehicles.filter((v) => v.speedKmh > 0).length;
  const openComplaints = positioned.filter((c) => c.status === 'new' || c.status === 'assigned').length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          <ModeButton active={mode === 'live'} onClick={() => setMode('live')}>
            Жива карта
          </ModeButton>
          <ModeButton active={mode === 'complaints'} onClick={() => setMode('complaints')}>
            Скарги
          </ModeButton>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mode === 'live' && (
            <>
              <Badge variant="secondary" className="font-normal">
                🚛 {movingTrucks}/{vehicles.length} в русі
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {bins.length} баків
              </Badge>
              <Badge variant="destructive" className="font-normal">
                {ripe.length} ≥70%
              </Badge>
              {lastSync && (
                <span className="text-xs text-muted-foreground">
                  {lastSync.toLocaleTimeString('uk-UA')}
                </span>
              )}
            </>
          )}
          {mode === 'complaints' && (
            <>
              <Badge variant="destructive" className="font-normal">
                {openComplaints} відкритих
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {positioned.length} з координатами
              </Badge>
            </>
          )}
        </div>
      </div>

      <MapContainer
        center={MAP_CENTER}
        zoom={13}
        scrollWheelZoom
        className="h-[calc(100vh-12rem)] min-h-[32rem] w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mode === 'live' && (
          <>
            <BinHeatLayer bins={bins} />
            {/* Tiny bin dots — public bins stay neutral, household bins
                colour-code the household's PAYT tier so the dispatcher sees
                at a glance which streets are sorting and which aren't. */}
            {bins.map((b) => {
              const color = binDotColor(b);
              return (
                <CircleMarker
                  key={b.id}
                  center={[b.lat, b.lng]}
                  radius={3}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: b.kind === 'household' ? 0.85 : 0.55,
                    weight: 0,
                  }}
                >
                  <Popup>
                    <strong>{b.address ?? 'Без адреси'}</strong>
                    <br />
                    {b.kind === 'household' ? 'приватний' : 'публічний'} ·{' '}
                    <strong>{b.fillPct}%</strong>
                    {b.kind === 'household' && b.pricingTier && (
                      <>
                        <br />
                        тариф: <strong>{tierLabel(b.pricingTier)}</strong>
                      </>
                    )}
                  </Popup>
                </CircleMarker>
              );
            })}
            {vehicles.map((v) => (
              <Marker key={v.id} position={[v.lat, v.lng]} icon={truckIcon(v.speedKmh > 0)}>
                <Popup>
                  <strong>{v.label}</strong>
                  <br />
                  {v.speedKmh > 0 ? `${Math.round(v.speedKmh)} км/год` : 'припарковано'}
                  {v.ts && (
                    <>
                      <br />
                      <em>{new Date(v.ts).toLocaleTimeString('uk-UA')}</em>
                    </>
                  )}
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {mode === 'complaints' &&
          positioned.map((c) => (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lng]}
              radius={6}
              pathOptions={{
                color: complaintColor(c.status),
                fillColor: complaintColor(c.status),
                fillOpacity: 0.85,
                weight: 1.5,
              }}
            >
              <Popup>
                <strong>Скарга — {c.category_id ?? 'без категорії'}</strong>
                <br />
                {c.description?.slice(0, 120) ?? 'Без опису'}
                <br />
                <em>статус: {c.status}</em>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>

      {mode === 'live' && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Legend color="#475569" label="публічний бак" />
          <Legend color="#16a34a" label="приватний — сортує (×0.5)" />
          <Legend color="#ca8a04" label="приватний — базовий (×1.0)" />
          <Legend color="#dc2626" label="приватний — без застосунку (×1.5)" />
        </div>
      )}

      {mode === 'complaints' && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Legend color="#dc2626" label="нова" />
          <Legend color="#0ea5e9" label="у роботі" />
          <Legend color="#475569" label="вирішена" />
        </div>
      )}
    </div>
  );
}

function binDotColor(b: MapBin): string {
  if (b.kind === 'public') return '#475569'; // slate
  switch (b.pricingTier) {
    case 'sorted':
      return '#16a34a'; // green — sorting, ×0.5
    case 'standard':
      return '#ca8a04'; // yellow — using app, no sort, ×1.0
    case 'unscanned':
      return '#dc2626'; // red — never scanned, ×1.5
    default:
      return '#94a3b8';
  }
}

function tierLabel(tier: NonNullable<MapBin['pricingTier']>): string {
  switch (tier) {
    case 'sorted':
      return '×0.5 сортує';
    case 'standard':
      return '×1.0 базовий';
    case 'unscanned':
      return '×1.5 без застосунку';
  }
}

function complaintColor(status: string): string {
  switch (status) {
    case 'new':
      return '#dc2626';
    case 'assigned':
    case 'in_progress':
      return '#0ea5e9';
    case 'resolved':
      return '#475569';
    default:
      return '#6b7280';
  }
}

/**
 * Heatmap of bin fills. Yellow → orange → red gradient — no green so empty
 * bins don't tint the whole town the moment a single one shows up. Low-fill
 * bins still register on the heatmap (radius shrinks with weight) but they
 * fade out instead of painting things green.
 */
function BinHeatLayer({ bins }: { bins: MapBin[] }) {
  const map = useMap();
  useEffect(() => {
    if (bins.length === 0) return;
    const heatPlugin = (L as unknown as {
      heatLayer: (
        latlngs: Array<[number, number, number]>,
        options?: Record<string, unknown>,
      ) => L.Layer;
    }).heatLayer;
    const layer = heatPlugin(
      bins.map((b) => [b.lat, b.lng, Math.max(0.05, b.fillPct / 100)]),
      {
        radius: 28,
        blur: 20,
        maxZoom: 16,
        minOpacity: 0.25,
        gradient: { 0.3: '#fde68a', 0.55: '#f59e0b', 0.75: '#ea580c', 0.95: '#dc2626' },
      },
    );
    layer.addTo(map);
    return () => {
      layer.remove();
    };
  }, [map, bins]);
  return null;
}

function truckIcon(moving: boolean): L.DivIcon {
  const bg = moving ? '#16a34a' : '#475569';
  return L.divIcon({
    html: `
      <div style="
        width: 32px; height: 32px; border-radius: 999px;
        background: ${bg}; color: white;
        display: grid; place-items: center;
        font-size: 18px; line-height: 1;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        border: 2px solid white;
      ">🚛</div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
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
          : 'border-border bg-background text-muted-foreground hover:bg-accent')
      }
    >
      {children}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
