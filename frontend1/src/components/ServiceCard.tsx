import React from 'react';

export type ServiceCardProps = {
  title: string;
  category: string;
  imageUrl?: string;
  rating?: number; // 0..5
  ratingCount?: number;
  onDetailsClick?: () => void;
  onRateClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
};

function clampRating(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(5, Math.max(0, value));
}

function Stars({ value }: { value: number }) {
  const normalized = clampRating(value);
  const full = Math.round(normalized);

  return (
    <span aria-label={`Avaliação: ${normalized.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <span key={idx} aria-hidden>
          {idx < full ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

export function ServiceCard({
  title,
  category,
  imageUrl,
  rating,
  ratingCount,
  onDetailsClick,
  onRateClick,
  onEditClick,
  onDeleteClick
}: ServiceCardProps) {
  return (
    <div className="card" data-testid="service-card">
      {imageUrl ? <img src={imageUrl} className="card-img-top" alt={`Imagem de ${title}`} /> : null}

      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{category}</p>

        <div className="d-flex align-items-center gap-2 mb-2">
          <Stars value={rating ?? 0} />
          <small className="text-muted" data-testid="rating-meta">
            {typeof rating === 'number' ? rating.toFixed(1) : '0.0'}
            {typeof ratingCount === 'number' ? ` (${ratingCount})` : ''}
          </small>
        </div>

        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={onDetailsClick}>
            Detalhes
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onRateClick}>
            Avaliar
          </button>
          {onEditClick ? (
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onEditClick}>
              Editar
            </button>
          ) : null}
          {onDeleteClick ? (
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={onDeleteClick}>
              Excluir
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
