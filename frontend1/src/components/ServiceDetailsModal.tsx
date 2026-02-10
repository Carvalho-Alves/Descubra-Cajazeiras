import React from 'react';
import { Badge, Button, Modal } from 'react-bootstrap';

import type { Servico } from '../features/servicos/servicosTypes';

type Props = {
  isOpen: boolean;
  servico: Servico | null;
  onClose: () => void;
  onRate: (servico: Servico) => void;
};

export function ServiceDetailsModal({ isOpen, servico, onClose, onRate }: Props) {
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalhes</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!servico ? null : (
          <>
            <h2 className="h5 mb-2">{servico.nome}</h2>
            <div className="d-flex gap-2 flex-wrap mb-2">
              <Badge bg="secondary">{servico.tipo_servico}</Badge>
              {servico.categoria ? <Badge bg="info">{servico.categoria}</Badge> : null}
            </div>

            {servico.descricao ? <p className="mb-2">{servico.descricao}</p> : null}

            {servico.contato?.telefone ? (
              <p className="mb-1">
                <strong>Telefone:</strong> {servico.contato.telefone}
              </p>
            ) : null}
            {servico.contato?.instagram ? (
              <p className="mb-0">
                <strong>Instagram:</strong> {servico.contato.instagram}
              </p>
            ) : null}
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
            if (servico) onRate(servico);
          }}
          disabled={!servico}
        >
          Avaliar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
