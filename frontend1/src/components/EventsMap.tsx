import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import type { Evento } from '../features/eventos/eventosTypes';
import { ensureLeafletDefaultIcon } from '../utils/leafletIcon';

type Props = {
  center: [number, number];
  zoom: number;
  eventos: Evento[];
  onSelect: (evento: Evento) => void;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

export function EventsMap({ center, zoom, eventos, onSelect }: Props) {
  useEffect(() => {
    ensureLeafletDefaultIcon();
  }, []);

  const markers = eventos.filter((e) => {
    const lat = (e as any)?.localizacao?.latitude;
    const lng = (e as any)?.localizacao?.longitude;
    return isFiniteNumber(lat) && isFiniteNumber(lng);
  });

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: 520, width: '100%' }} scrollWheelZoom>
      <Recenter center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((e) => (
        <Marker
          key={e._id}
          position={[e.localizacao.latitude, e.localizacao.longitude]}
          eventHandlers={{
            click: () => onSelect(e)
          }}
        >
          <Popup>
            <strong>{e.nome}</strong>
            <div>{e.status ?? 'ativo'}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
