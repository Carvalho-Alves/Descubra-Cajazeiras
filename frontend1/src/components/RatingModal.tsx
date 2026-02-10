import React, { useMemo, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';

type Props = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (payload: { nota: number; comentario?: string }) => Promise<void> | void;
};

export function RatingModal({ isOpen, title, onClose, onSubmit }: Props) {
  const [nota, setNota] = useState<number>(5);
  const [comentario, setComentario] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => nota >= 1 && nota <= 5 && !isSaving, [nota, isSaving]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSaving(true);
      setError(null);
      await onSubmit({ nota, comentario: comentario.trim() ? comentario.trim() : undefined });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar avaliação');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="ratingNota">
            <Form.Label>Nota</Form.Label>
            <Form.Select value={nota} onChange={(e) => setNota(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={4}>4</option>
              <option value={3}>3</option>
              <option value={2}>2</option>
              <option value={1}>1</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="ratingComentario">
            <Form.Label>Comentário (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Conte como foi sua experiência"
            />
          </Form.Group>

          <Button type="submit" disabled={!canSubmit}>
            {isSaving ? 'Enviando...' : 'Enviar'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
