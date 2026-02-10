import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, ListGroup, Row, Spinner, Table } from 'react-bootstrap';

import { api } from '../services/api';
import { useAppSelector } from '../hooks/reduxHooks';

type EstatisticasResposta = {
  success: boolean;
  data: {
    totalPontos: number;
    totalEventos: number;
    totalAvaliacoes: number;
    mediaGeral: number;

    pontosPorTipo?: Array<{ _id: string; total: number }>;
    pontosPorMes?: Array<{ _id: string; total: number }>;
    pontosRecentes?: Array<{ nome?: string; tipo?: string; createdAt?: string }>;

    avaliacoesPorMes?: Array<{ _id: string; total: number }>;
    distribuicaoNotas?: Array<{ _id: number; total: number }>;
    eventosPorStatus?: Array<{ _id: string; total: number }>;
    eventosPorMes?: Array<{ _id: string; total: number }>;

    topServicosAvaliados?: Array<{ nome: string; tipo?: string; totalAvaliacoes: number; mediaAvaliacoes: number }>;
    topEventosAvaliados?: Array<{ nome: string; data?: string; totalAvaliacoes: number; mediaAvaliacoes: number }>;
    avaliacoesRecentes?: Array<{
      nota: number;
      comentario?: string;
      criadoEm?: string;
      usuarioNome?: string;
      servicoNome?: string | null;
      eventoNome?: string | null;
      tipo?: 'servico' | 'evento' | string;
    }>;
    eventosRecentes?: Array<{ nome: string; data?: string; status?: string; createdAt?: string; criadorNome?: string }>;
  };
};

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);

  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EstatisticasResposta['data'] | null>(null);

  const fetchStats = async () => {
    try {
      setStatus('loading');
      setError(null);
      const response = await api.get<EstatisticasResposta>('/estatisticas');
      setData(response.data.data);
      setStatus('succeeded');
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'Falha ao carregar estatísticas');
    }
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setStatus('loading');
        setError(null);
        const response = await api.get<EstatisticasResposta>('/estatisticas');
        if (!mounted) return;
        setData(response.data.data);
        setStatus('succeeded');
      } catch (err) {
        if (!mounted) return;
        setStatus('failed');
        setError(err instanceof Error ? err.message : 'Falha ao carregar estatísticas');
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="d-flex flex-column gap-3">
      <Card>
        <Card.Body>
          <Row className="align-items-center g-2">
            <Col>
              <h1 className="h4 mb-1">Dashboard</h1>
              <div className="text-muted">
                Logado como: <strong>{user?.nome ?? 'Usuário'}</strong>
              </div>
            </Col>
            <Col xs="auto" className="text-end">
              <Button variant="outline-primary" onClick={fetchStats} disabled={status === 'loading'}>
                Atualizar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {status === 'loading' ? (
        <Card>
          <Card.Body className="d-flex align-items-center gap-2">
            <Spinner size="sm" />
            <span>Carregando estatísticas...</span>
          </Card.Body>
        </Card>
      ) : null}

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {data ? (
        <>
          <Row className="g-3 mb-3">
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="text-muted">Pontos</div>
                  <div className="h4 mb-0">{data.totalPontos}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="text-muted">Eventos</div>
                  <div className="h4 mb-0">{data.totalEventos}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="text-muted">Avaliações</div>
                  <div className="h4 mb-0">{data.totalAvaliacoes}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="text-muted">Média geral</div>
                  <div className="h4 mb-0">{data.mediaGeral}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-3">
            <Col lg={6}>
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Pontos por tipo</Card.Title>
                  <Table size="sm" responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.pontosPorTipo ?? []).map((row, idx) => (
                        <tr key={`${row._id}-${idx}`}>
                          <td>{row._id}</td>
                          <td className="text-end">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Eventos por status</Card.Title>
                  <Table size="sm" responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.eventosPorStatus ?? []).map((row, idx) => (
                        <tr key={`${row._id}-${idx}`}>
                          <td>{row._id}</td>
                          <td className="text-end">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Avaliações por mês</Card.Title>
                  <Table size="sm" responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Mês</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.avaliacoesPorMes ?? []).map((row, idx) => (
                        <tr key={`${row._id}-${idx}`}>
                          <td>{row._id}</td>
                          <td className="text-end">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Distribuição de notas</Card.Title>
                  <Table size="sm" responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Nota</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.distribuicaoNotas ?? []).map((row, idx) => (
                        <tr key={`${row._id}-${idx}`}>
                          <td>{row._id}</td>
                          <td className="text-end">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Top serviços avaliados</Card.Title>
                  <Table size="sm" responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th className="text-end">Avaliações</th>
                        <th className="text-end">Média</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.topServicosAvaliados ?? []).map((row, idx) => (
                        <tr key={`${row.nome}-${idx}`}>
                          <td>
                            <div>{row.nome}</div>
                            <small className="text-muted">{row.tipo ?? ''}</small>
                          </td>
                          <td className="text-end">{row.totalAvaliacoes}</td>
                          <td className="text-end">{row.mediaAvaliacoes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Top eventos avaliados</Card.Title>
                  <Table size="sm" responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th className="text-end">Avaliações</th>
                        <th className="text-end">Média</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.topEventosAvaliados ?? []).map((row, idx) => (
                        <tr key={`${row.nome}-${idx}`}>
                          <td>
                            <div>{row.nome}</div>
                            <small className="text-muted">
                              {row.data ? new Date(row.data).toLocaleDateString('pt-BR') : ''}
                            </small>
                          </td>
                          <td className="text-end">{row.totalAvaliacoes}</td>
                          <td className="text-end">{row.mediaAvaliacoes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Avaliações recentes</Card.Title>
                  <ListGroup variant="flush">
                    {(data.avaliacoesRecentes ?? []).map((row, idx) => (
                      <ListGroup.Item key={`${row.criadoEm ?? 'x'}-${idx}`}>
                        <div className="d-flex justify-content-between">
                          <strong>{row.tipo === 'evento' ? row.eventoNome ?? 'Evento' : row.servicoNome ?? 'Serviço'}</strong>
                          <span>{row.nota}/5</span>
                        </div>
                        <div className="text-muted">
                          {row.usuarioNome ? `${row.usuarioNome} • ` : ''}
                          {row.criadoEm ? new Date(row.criadoEm).toLocaleDateString('pt-BR') : ''}
                        </div>
                        {row.comentario ? <div className="mt-1">{row.comentario}</div> : null}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Eventos recentes</Card.Title>
                  <ListGroup variant="flush">
                    {(data.eventosRecentes ?? []).map((row, idx) => (
                      <ListGroup.Item key={`${row.nome}-${idx}`}>
                        <div className="d-flex justify-content-between">
                          <strong>{row.nome}</strong>
                          <span className="text-muted">{row.status ?? ''}</span>
                        </div>
                        <div className="text-muted">
                          {row.data ? `${new Date(row.data).toLocaleDateString('pt-BR')} • ` : ''}
                          {row.criadorNome ?? ''}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : null}
    </div>
  );
}
