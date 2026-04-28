'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { PRYLUKY_CENTER } from '@trashflow/db';
import type { LatLng } from './location-picker';

const DEFAULT_CENTER: [number, number] = [PRYLUKY_CENTER.lat, PRYLUKY_CENTER.lng];

// Custom drop-pin icon (yellow accent so it stands out against the green map).
const PIN_ICON = L.divIcon({
  html: `
    <div style="
      width: 32px; height: 32px;
      background: #FFD23F;
      border: 3px solid #fff;
      border-radius: 50% 50% 50% 2px;
      transform: rotate(-45deg);
      box-shadow: 0 8px 20px -4px rgba(0,0,0,0.45);
      display: grid; place-items: center;
    "><div style="
      width: 8px; height: 8px;
      background: #0E3A23;
      border-radius: 50%;
      transform: rotate(45deg);
    "></div></div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export function LocationPickerInner({
  value,
  onPlace,
}: {
  value: LatLng | null;
  onPlace: (next: LatLng) => void;
}) {
  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : DEFAULT_CENTER}
      zoom={14}
      scrollWheelZoom
      doubleClickZoom={false}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution=''
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onPlace={onPlace} />
      <FollowExternal value={value} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={PIN_ICON}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const m = e.target as L.Marker;
              const ll = m.getLatLng();
              onPlace({ lat: ll.lat, lng: ll.lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}

function ClickToPlace({ onPlace }: { onPlace: (next: LatLng) => void }) {
  useMapEvents({
    click: (e) => onPlace({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

/**
 * Re-center the map when the parent feeds us a new value (e.g. from
 * "Моя геолокація"). Pure UX — without this, the user clicks geolocate and
 * wonders why nothing visibly moved.
 */
function FollowExternal({ value }: { value: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.flyTo([value.lat, value.lng], 16, { duration: 0.4 });
  }, [map, value?.lat, value?.lng]);
  return null;
}
