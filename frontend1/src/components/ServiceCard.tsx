import React from 'react';
import './ServiceCard.css';

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
  rating = 0,
  ratingCount,
  onDetailsClick,
  onRateClick,
  onEditClick,
  onDeleteClick
}: ServiceCardProps) {
  return (
    <div className="service-card" data-testid="service-card">
      {imageUrl && (
        <div className="service-card-image-wrapper">
          <img
            src={imageUrl}
            alt={`Imagem de ${title}`}
            className="service-card-image"
          />
        </div>
      )}

      <div className="service-card-body">
        <h5 className="service-card-title">{title}</h5>

        <p className="service-card-category">{category}</p>

        <div className="service-card-rating">
          <Stars value={rating} />
          <small className="service-card-rating-meta">
            {rating.toFixed(1)}
            {typeof ratingCount === 'number' ? ` (${ratingCount})` : ''}
          </small>
        </div>

        <div className="service-card-actions">
          {onDetailsClick && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={onDetailsClick}
            >
              Detalhes
            </button>
          )}

          {onRateClick && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onRateClick}
            >
              Avaliar
            </button>
          )}

          {onEditClick && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onEditClick}
            >
              Editar
            </button>
          )}

          {onDeleteClick && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={onDeleteClick}
            >
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
