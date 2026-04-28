'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { PRYLUKY_CENTER } from '@trashflow/db';
import type { ResidentTruck } from './live-trucks-map';

const CENTER: [number, number] = [PRYLUKY_CENTER.lat, PRYLUKY_CENTER.lng];

function truckIcon(moving: boolean): L.DivIcon {
  const bg = moving ? '#2FA560' : '#687A70';
  return L.divIcon({
    html: `
      <div style="
        width: 32px; height: 32px; border-radius: 999px;
        background: ${bg}; color: white;
        display: grid; place-items: center;
        font-size: 16px; line-height: 1;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">🚛</div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function LiveTrucksMapInner({ trucks }: { trucks: ResidentTruck[] }) {
  return (
    <MapContainer
      center={CENTER}
      zoom={13}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution=''
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {trucks.map((t) => (
        <Marker key={t.id} position={[t.lat, t.lng]} icon={truckIcon(t.onRoute)} />
      ))}
    </MapContainer>
  );
}
