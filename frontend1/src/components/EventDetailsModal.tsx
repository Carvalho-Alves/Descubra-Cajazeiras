import React from 'react';
import { Badge, Button, Modal } from 'react-bootstrap';

import type { Evento } from '../features/eventos/eventosTypes';

type Props = {
  isOpen: boolean;
  evento: Evento | null;
  onClose: () => void;
  onRate: (evento: Evento) => void;
};

export function EventDetailsModal({ isOpen, evento, onClose, onRate }: Props) {
  const date = evento?.data ? new Date(evento.data) : null;
  const dateText = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('pt-BR') : null;

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalhes</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!evento ? null : (
          <>
            <h2 className="h5 mb-2">{evento.nome}</h2>
            <div className="d-flex gap-2 flex-wrap mb-2">
              {evento.status ? <Badge bg="secondary">{evento.status}</Badge> : null}
              {dateText ? <Badge bg="info">{dateText}</Badge> : null}
              {evento.horario ? (
                <Badge bg="light" text="dark">
                  {evento.horario}
                </Badge>
              ) : null}
            </div>
            {evento.descricao ? <p className="mb-0">{evento.descricao}</p> : null}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (evento) onRate(evento);
          }}
          disabled={!evento}
        >
          Avaliar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
