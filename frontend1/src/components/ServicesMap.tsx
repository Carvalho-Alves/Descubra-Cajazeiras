import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import type { Servico } from '../features/servicos/servicosTypes';
import { ensureLeafletDefaultIcon } from '../utils/leafletIcon';

type Props = {
  center: [number, number];
  zoom: number;
  servicos: Servico[];
  onSelect: (servico: Servico) => void;
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

export function ServicesMap({ center, zoom, servicos, onSelect }: Props) {
  useEffect(() => {
    ensureLeafletDefaultIcon();
  }, []);

  const markers = servicos.filter((s) => {
    const lat = (s as any)?.localizacao?.latitude;
    const lng = (s as any)?.localizacao?.longitude;
    return isFiniteNumber(lat) && isFiniteNumber(lng);
  });

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: 520, width: '100%' }} scrollWheelZoom>
      <Recenter center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((s) => (
        <Marker
          key={s._id}
          position={[s.localizacao.latitude, s.localizacao.longitude]}
          eventHandlers={{
            click: () => onSelect(s)
          }}
        >
          <Popup>
            <strong>{s.nome}</strong>
            <div>{s.tipo_servico}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
