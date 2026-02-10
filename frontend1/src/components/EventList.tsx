import React from 'react';

import type { AvaliacaoStats, Evento } from '../features/eventos/eventosTypes';
import { resolveApiAssetUrl } from '../utils/resolveAssetUrl';
import { ServiceCard } from './ServiceCard';

type Props = {
  items: Evento[];
  statsById: Record<string, AvaliacaoStats | undefined>;
  onDetails: (evento: Evento) => void;
  onRate: (evento: Evento) => void;
  currentUserId?: string;
  isAuthenticated?: boolean;
  onEdit?: (evento: Evento) => void;
  onDelete?: (evento: Evento) => void;
};

function getOwnerId(evento: Evento): string | undefined {
  const u: any = evento.usuario as any;
  if (!u) return undefined;
  if (typeof u === 'string') return u;
  return u._id || u.id;
}

function formatEventoLabel(evento: Evento) {
  const date = evento.data ? new Date(evento.data) : null;
  const dateText = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('pt-BR') : 'Data a definir';
  const timeText = evento.horario ? ` • ${evento.horario}` : '';
  return `${dateText}${timeText}`;
}

export function EventList({ items, statsById, onDetails, onRate, currentUserId, isAuthenticated, onEdit, onDelete }: Props) {
  return (
    <div className="d-flex flex-column gap-2">
      {items.map((evento) => {
        const stats = statsById[evento._id];
        const imageUrl = evento.imagem ? resolveApiAssetUrl(evento.imagem) : undefined;

        const ownerId = getOwnerId(evento);
        const canMutate = Boolean(isAuthenticated) && Boolean(currentUserId) && Boolean(ownerId) && ownerId === currentUserId;

        return (
          <ServiceCard
            key={evento._id}
            title={evento.nome}
            category={formatEventoLabel(evento)}
            imageUrl={imageUrl}
            rating={stats?.media}
            ratingCount={stats?.total}
            onDetailsClick={() => onDetails(evento)}
            onRateClick={() => onRate(evento)}
            onEditClick={onEdit && canMutate ? () => onEdit(evento) : undefined}
            onDeleteClick={onDelete && canMutate ? () => onDelete(evento) : undefined}
          />
        );
      })}
    </div>
  );
}
