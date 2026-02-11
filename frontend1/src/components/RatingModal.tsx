import React, { useMemo, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import './RatingModal.css';

type Props = {
  isOpen: boolean;
  title: string;
  imageUrl?: string;
  onClose: () => void;
  onSubmit: (payload: { nota: number; comentario?: string }) => Promise<void> | void;
};

const ratingLabels: Record<number, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Muito bom',
  5: 'Excelente'
};

export function RatingModal({
  isOpen,
  title,
  imageUrl,
  onClose,
  onSubmit
}: Props) {
  const [nota, setNota] = useState(5);
  const [hoverNota, setHoverNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_CHARS = 200;
  const notaExibida = hoverNota ?? nota;

  const canSubmit = useMemo(
    () => nota >= 1 && nota <= 5 && !isSaving,
    [nota, isSaving]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSaving(true);
      setError(null);
      await onSubmit({
        nota,
        comentario: comentario.trim() || undefined
      });
      onClose();
    } catch (err) {
      setError('Erro ao enviar avaliação');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <div className="rating-modal">
        {imageUrl && (
          <div className="rating-cover">
            <img src={imageUrl} alt="Serviço avaliado" />
          </div>
        )}

        <div className="rating-content">
          <h4 className="rating-title">{title}</h4>

          {error && <Alert variant="danger">{error}</Alert>}

          {/* ESTRELAS */}
          <div className="rating-stars-wrapper">
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <span
                  key={value}
                  className={`star ${value <= notaExibida ? 'active' : ''}`}
                  onClick={() => setNota(value)}
                  onMouseEnter={() => setHoverNota(value)}
                  onMouseLeave={() => setHoverNota(null)}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="rating-text">
              {ratingLabels[notaExibida]}
            </span>
          </div>

          {/* COMENTÁRIO */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="rating-comment">
              <Form.Control
                as="textarea"
                rows={4}
                maxLength={MAX_CHARS}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Conte como foi sua experiência (atendimento, qualidade, ambiente...)"
              />
              <span className="char-counter">
                {comentario.length}/{MAX_CHARS}
              </span>
            </Form.Group>

            {/* BOTÕES */}
            <div className="rating-actions">
              <Button variant="link" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isSaving ? 'Enviando...' : 'Enviar avaliação'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
