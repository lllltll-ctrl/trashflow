'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BinCounts, PointNearby, PointType } from '@/lib/rpc';

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

type Coord = { lat: number; lng: number };

// ─── Colored dot markers ──────────────────────────────────────────────────────

const MARKER_COLORS: Record<PointType, { fill: string; stroke: string; size: number }> = {
  collection: { fill: '#3B82F6', stroke: '#1D4ED8', size: 14 },
  dump:       { fill: '#EF4444', stroke: '#B91C1C', size: 16 },
  recycling:  { fill: '#F59E0B', stroke: '#B45309', size: 14 },
};

function makeMarkerIcon(type: PointType): L.DivIcon {
  const { fill, stroke, size } = MARKER_COLORS[type];
  const half = size / 2;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${fill};
      border:2.5px solid ${stroke};
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -(half + 4)],
  });
}

// Pre-build icons once (avoids re-creating on every render)
const ICONS: Record<PointType, L.DivIcon> = {
  collection: makeMarkerIcon('collection'),
  dump:       makeMarkerIcon('dump'),
  recycling:  makeMarkerIcon('recycling'),
};

// ─── Bin badges ───────────────────────────────────────────────────────────────

const BIN_DISPLAY = [
  { key: 'mixed'   as const, label: 'Змішані',  bg: '#6B7280', fg: '#fff'     },
  { key: 'glass'   as const, label: 'Скло',     bg: '#2FA560', fg: '#fff'     },
  { key: 'plastic' as const, label: 'Пластик',  bg: '#FFD23F', fg: '#1a1a1a' },
  { key: 'paper'   as const, label: 'Папір',    bg: '#3B82F6', fg: '#fff'     },
  { key: 'organic' as const, label: 'Органіка', bg: '#92400E', fg: '#fff'     },
];

function BinBadges({ containers }: { containers: BinCounts | null }) {
  if (!containers) return null;
  const visible = BIN_DISPLAY.filter((b) => (containers[b.key] ?? 0) > 0);
  if (visible.length === 0) return null;
  return (
    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {visible.map((b) => (
        <span
          key={b.key}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: b.bg, color: b.fg,
            borderRadius: 10, padding: '2px 7px',
            fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
          }}
        >
          {b.label}
          <span style={{
            background: 'rgba(255,255,255,0.25)', borderRadius: 8,
            padding: '0 4px', fontSize: 10, fontWeight: 700,
          }}>
            {containers[b.key]}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function MapLegend() {
  const items = [
    { color: '#3B82F6', label: 'Контейнерний майданчик' },
    { color: '#F59E0B', label: 'Переробний центр' },
    { color: '#EF4444', label: 'Майданчик великогабаритних відходів' },
  ];
  return (
    <div
      style={{
        position: 'absolute', bottom: 28, left: 10, zIndex: 1000,
        background: 'rgba(255,255,255,0.93)',
        borderRadius: 10, padding: '8px 11px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        fontSize: 11, fontFamily: 'system-ui, sans-serif',
        display: 'flex', flexDirection: 'column', gap: 5,
        backdropFilter: 'blur(4px)',
      }}
    >
      {items.map((it) => (
        <div key={it.color} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 11, height: 11, borderRadius: '50%',
            background: it.color, flexShrink: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }} />
          <span style={{ color: '#222', lineHeight: 1 }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Map ──────────────────────────────────────────────────────────────────────

export function PointsMap({
  points,
  userLocation,
  center,
}: {
  points: PointNearby[];
  userLocation: Coord | null;
  center: Coord;
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>Ви тут</Popup>
        </Marker>
      )}

      {points.map((p) => {
        const type: PointType = p.point_type ?? 'collection';
        return (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={ICONS[type]}>
            <Popup minWidth={200}>
              <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: 180 }}>
                {/* Type label */}
                <div style={{
                  display: 'inline-block',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: type === 'dump' ? '#B91C1C' : type === 'recycling' ? '#B45309' : '#1D4ED8',
                  marginBottom: 3,
                }}>
                  {type === 'dump' ? '🚛 Майданчик великогабаритних відходів'
                    : type === 'recycling' ? '♻ Переробний центр'
                    : '🗑 Контейнерний майданчик'}
                </div>

                {/* Name */}
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0E3A23', marginBottom: 2 }}>
                  {p.name}
                </div>

                {/* Address */}
                {p.address && p.address !== p.name && (
                  <div style={{ fontSize: 11.5, color: '#555', marginBottom: 2 }}>
                    {p.address}
                  </div>
                )}

                {/* Distance */}
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>
                  {Math.round(p.distance_m)} м від вас
                </div>

                {/* Recycling info */}
                {p.buyback_info && (
                  <div style={{ fontSize: 11, color: '#555', marginTop: 4, lineHeight: 1.4 }}>
                    {p.buyback_info}
                  </div>
                )}

                {/* Bin counts for collection points */}
                {type === 'collection' && <BinBadges containers={p.containers} />}
              </div>
            </Popup>
          </Marker>
        );
      })}

      <MapLegend />
      <AutoFit points={points} userLocation={userLocation} />
    </MapContainer>
  );
}

function AutoFit({
  points,
  userLocation,
}: {
  points: PointNearby[];
  userLocation: Coord | null;
}) {
  const map = useMap();
  useEffect(() => {
    // Fit only to collection/recycling, exclude dumps from initial fit
    const relevant = points.filter((p) => (p.point_type ?? 'collection') !== 'dump');
    const src = relevant.length > 0 ? relevant : points;
    if (src.length === 0) return;
    const coords: [number, number][] = src.map((p) => [p.lat, p.lng]);
    if (userLocation) coords.push([userLocation.lat, userLocation.lng]);
    map.fitBounds(coords, { padding: [40, 40], maxZoom: 15 });
  }, [map, points, userLocation]);
  return null;
}
