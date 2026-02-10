import React from 'react';

import type { AvaliacaoStats, Servico } from '../features/servicos/servicosTypes';
import { resolveApiAssetUrl } from '../utils/resolveAssetUrl';
import { ServiceCard } from './ServiceCard';

type Props = {
  items: Servico[];
  statsById: Record<string, AvaliacaoStats | undefined>;
  onDetails: (servico: Servico) => void;
  onRate: (servico: Servico) => void;
  currentUserId?: string;
  isAuthenticated?: boolean;
  onEdit?: (servico: Servico) => void;
  onDelete?: (servico: Servico) => void;
};

function getOwnerId(servico: Servico): string | undefined {
  const u: any = servico.usuario as any;
  if (!u) return undefined;
  if (typeof u === 'string') return u;
  return u._id || u.id;
}

function getServicoImageCandidate(servico: Servico): string | undefined {
  const raw: any = (servico as any).imagem;
  if (!raw) return undefined;
  if (Array.isArray(raw)) return raw[0];
  if (typeof raw === 'string') return raw;
  return undefined;
}

export function ServiceList({ items, statsById, onDetails, onRate, currentUserId, isAuthenticated, onEdit, onDelete }: Props) {
  return (
    <div className="d-flex flex-column gap-2">
      {items.map((servico) => {
        const stats = statsById[servico._id];
        const imageCandidate = getServicoImageCandidate(servico);
        const imageUrl = imageCandidate ? resolveApiAssetUrl(imageCandidate) : undefined;

        const ownerId = getOwnerId(servico);
        const canMutate = Boolean(isAuthenticated) && Boolean(currentUserId) && Boolean(ownerId) && ownerId === currentUserId;

        return (
          <ServiceCard
            key={servico._id}
            title={servico.nome}
            category={servico.tipo_servico}
            imageUrl={imageUrl}
            rating={stats?.media}
            ratingCount={stats?.total}
            onDetailsClick={() => onDetails(servico)}
            onRateClick={() => onRate(servico)}
            onEditClick={onEdit && canMutate ? () => onEdit(servico) : undefined}
            onDeleteClick={onDelete && canMutate ? () => onDelete(servico) : undefined}
          />
        );
      })}
    </div>
  );
}
