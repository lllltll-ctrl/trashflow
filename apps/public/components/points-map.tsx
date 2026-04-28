'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { PointNearby } from '@/lib/rpc';

// Fix default marker icons — webpack strips the built-ins from leaflet.
// Using Cloudflare CDN keeps us independent of Next image-loader quirks.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

type Coord = { lat: number; lng: number };

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
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]}>
          <Popup>
            <strong>{p.name}</strong>
            <br />
            {p.address}
            <br />
            <em>{Math.round(p.distance_m)} м</em>
          </Popup>
        </Marker>
      ))}
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
    if (points.length === 0) return;
    const coords: [number, number][] = points.map((p) => [p.lat, p.lng]);
    if (userLocation) coords.push([userLocation.lat, userLocation.lng]);
    map.fitBounds(coords, { padding: [40, 40], maxZoom: 15 });
  }, [map, points, userLocation]);
  return null;
}
