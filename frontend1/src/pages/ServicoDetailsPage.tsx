import React, { useEffect } from 'react';
import { Alert, Badge, Card, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

import { fetchServicoById } from '../features/servicos/servicosSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';

export function ServicoDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const servico = useAppSelector((s) => s.servicos.items.find((x) => x._id === id) ?? null);
  const detailsStatus = useAppSelector((s) => (id ? s.servicos.detailsStatusById[id] : undefined) ?? 'idle');
  const detailsError = useAppSelector((s) => (id ? s.servicos.detailsErrorById[id] : undefined) ?? null);

  useEffect(() => {
    if (!id) return;
    if (servico) return;
    if (detailsStatus === 'loading') return;

    dispatch(fetchServicoById(id));
  }, [dispatch, detailsStatus, id, servico]);

  if (!id) {
    return <Alert variant="warning">Serviço inválido.</Alert>;
  }

  const isLoading = !servico && detailsStatus === 'loading';

  return (
    <div>
      <h1 className="h4 mb-3">Detalhes do serviço</h1>

      {isLoading ? (
        <div className="d-flex align-items-center gap-2">
          <Spinner size="sm" />
          <span>Carregando...</span>
        </div>
      ) : null}

      {detailsError ? <Alert variant="danger">{detailsError}</Alert> : null}

      {servico ? (
        <Card>
          <Card.Body>
            <Card.Title>{servico.nome}</Card.Title>

            <div className="d-flex gap-2 flex-wrap mb-3">
              <Badge bg="secondary">{servico.tipo_servico}</Badge>
              {servico.categoria ? <Badge bg="info">{servico.categoria}</Badge> : null}
            </div>

            {servico.descricao ? <Card.Text>{servico.descricao}</Card.Text> : null}

            {servico.contato?.telefone ? (
              <div>
                <strong>Telefone:</strong> {servico.contato.telefone}
              </div>
            ) : null}
            {servico.contato?.instagram ? (
              <div>
                <strong>Instagram:</strong> {servico.contato.instagram}
              </div>
            ) : null}
          </Card.Body>
        </Card>
      ) : detailsStatus === 'failed' ? null : (
        <Alert variant="warning">Serviço não encontrado.</Alert>
      )}
    </div>
  );
}
