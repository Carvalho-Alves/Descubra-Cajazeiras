import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { EventDetailsModal } from '../components/EventDetailsModal';
import { EventoFormModal } from '../components/EventoFormModal';
import { EventList } from '../components/EventList';
import { EventsMap } from '../components/EventsMap';
import { RatingModal } from '../components/RatingModal';
import { ServicoFormModal } from '../components/ServicoFormModal';
import { ServiceDetailsModal } from '../components/ServiceDetailsModal';
import { ServiceList } from '../components/ServiceList';
import { ServicesMap } from '../components/ServicesMap';
import type { Evento } from '../features/eventos/eventosTypes';
import { criarAvaliacaoEvento } from '../features/eventos/eventosService';
import { createEvento, deleteEvento, fetchEventoStats, fetchEventos, updateEvento } from '../features/eventos/eventosSlice';
import type { Servico, TipoServico } from '../features/servicos/servicosTypes';
import { criarAvaliacaoServico } from '../features/servicos/servicosService';
import { createServico, deleteServico, fetchServicoStats, fetchServicos, updateServico } from '../features/servicos/servicosSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';

const CAJAZEIRAS_CENTER: [number, number] = [-6.8896, -38.5614];

export function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const servicosState = useAppSelector((s) => s.servicos);
  const eventosState = useAppSelector((s) => s.eventos);
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const currentUserId = user?.id;

  const [mode, setMode] = useState<'servicos' | 'eventos'>('servicos');
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState<TipoServico | ''>('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(CAJAZEIRAS_CENTER);
  const [mapZoom, setMapZoom] = useState(13);

  const [serviceDetailsOpen, setServiceDetailsOpen] = useState(false);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [servicoFormOpen, setServicoFormOpen] = useState(false);
  const [eventoFormOpen, setEventoFormOpen] = useState(false);
  const [servicoFormMode, setServicoFormMode] = useState<'create' | 'edit'>('create');
  const [eventoFormMode, setEventoFormMode] = useState<'create' | 'edit'>('create');
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);

  useEffect(() => {
    if (servicosState.status === 'idle') {
      dispatch(fetchServicos());
    }
  }, [dispatch, servicosState.status]);

  useEffect(() => {
    if (eventosState.status === 'idle') {
      dispatch(fetchEventos());
    }
  }, [dispatch, eventosState.status]);

  useEffect(() => {
    if (servicosState.status !== 'succeeded') return;
    for (const s of servicosState.items) {
      if (!servicosState.statsById[s._id]) {
        dispatch(fetchServicoStats(s._id));
      }
    }
  }, [dispatch, servicosState.items, servicosState.statsById, servicosState.status]);

  useEffect(() => {
    if (eventosState.status !== 'succeeded') return;
    for (const e of eventosState.items) {
      if (!eventosState.statsById[e._id]) {
        dispatch(fetchEventoStats(e._id));
      }
    }
  }, [dispatch, eventosState.items, eventosState.statsById, eventosState.status]);

  const filteredServicos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return servicosState.items.filter((s) => {
      if (tipo && s.tipo_servico !== tipo) return false;
      if (!q) return true;
      const hay = `${s.nome} ${s.categoria ?? ''} ${s.tipo_servico}`.toLowerCase();
      return hay.includes(q);
    });
  }, [servicosState.items, search, tipo]);

  const filteredEventos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return eventosState.items.filter((e) => {
      if (!q) return true;
      const hay = `${e.nome} ${e.descricao ?? ''} ${e.status ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [eventosState.items, search]);

  const handleGeolocate = () => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setMapZoom(16);
      },
      () => {
        // falha silenciosa (sem UX extra)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const isLoading = mode === 'servicos' ? servicosState.status === 'loading' : eventosState.status === 'loading';
  const combinedError = mode === 'servicos' ? servicosState.error : eventosState.error;

  return (
    <div className="d-flex flex-column gap-3">
      <Card>
        <Card.Body>
          <Row className="align-items-center g-2">
            <Col md={6}>
              <h1 className="h4 mb-1">Mapa e lista</h1>
              <div className="text-muted">
                {mode === 'servicos' ? 'Serviços turísticos em Cajazeiras' : 'Eventos em Cajazeiras'}
              </div>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="d-flex flex-wrap justify-content-md-end gap-2">
                <Button variant="outline-primary" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant="outline-secondary" onClick={handleGeolocate}>
                  Usar minha localização
                </Button>
              </div>
            </Col>
          </Row>

          <Row className="g-2 mt-3">
            <Col xs="auto">
              <Button variant={mode === 'servicos' ? 'primary' : 'outline-primary'} onClick={() => setMode('servicos')}>
                Serviços
              </Button>
            </Col>
            <Col xs="auto">
              <Button variant={mode === 'eventos' ? 'primary' : 'outline-primary'} onClick={() => setMode('eventos')}>
                Eventos
              </Button>
            </Col>
            <Col className="text-end">
              <Button
                variant="success"
                onClick={() => {
                  if (!token) {
                    navigate('/login');
                    return;
                  }
                  if (mode === 'servicos') {
                    setServicoFormMode('create');
                    setSelectedService(null);
                    setServicoFormOpen(true);
                  } else {
                    setEventoFormMode('create');
                    setSelectedEvent(null);
                    setEventoFormOpen(true);
                  }
                }}
              >
                {mode === 'servicos' ? 'Novo serviço' : 'Novo evento'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {combinedError ? <Alert variant="danger">{combinedError}</Alert> : null}

      <Row className="g-3">
        <Col lg={8}>
          {isLoading ? (
            <div className="d-flex align-items-center gap-2">
              <Spinner size="sm" />
              <span>Carregando mapa...</span>
            </div>
          ) : mode === 'servicos' ? (
            <Card>
              <Card.Body>
                <ServicesMap
                  center={mapCenter}
                  zoom={mapZoom}
                  servicos={filteredServicos}
                  onSelect={(s) => {
                    setSelectedService(s);
                    setServiceDetailsOpen(true);
                  }}
                />
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body>
                <EventsMap
                  center={mapCenter}
                  zoom={mapZoom}
                  eventos={filteredEventos}
                  onSelect={(e) => {
                    setSelectedEvent(e);
                    setEventDetailsOpen(true);
                  }}
                />
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <Card.Title className="h6">Filtros</Card.Title>

              <Row className="g-2 mb-2">
                <Col xs={12}>
                  <Form.Control
                    placeholder="Buscar por nome/categoria"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>

                {mode === 'servicos' ? (
                  <Col xs={12}>
                    <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoServico | '')}>
                      <option value="">Todos os tipos</option>
                      <option value="Hospedagem">Hospedagem</option>
                      <option value="Alimentação/Lazer">Alimentação/Lazer</option>
                      <option value="Ponto Turístico">Ponto Turístico</option>
                    </Form.Select>
                  </Col>
                ) : null}
              </Row>

              <div className="d-flex flex-column gap-2">
                {mode === 'servicos' ? (
                  <ServiceList
                    items={filteredServicos}
                    statsById={servicosState.statsById}
                    currentUserId={currentUserId}
                    isAuthenticated={Boolean(token)}
                    onDetails={(s) => {
                      setSelectedService(s);
                      setServiceDetailsOpen(true);
                    }}
                    onRate={(s) => {
                      setSelectedService(s);
                      setRatingOpen(true);
                    }}
                    onEdit={(s) => {
                      if (!token) {
                        navigate('/login');
                        return;
                      }
                      setSelectedService(s);
                      setServicoFormMode('edit');
                      setServicoFormOpen(true);
                    }}
                    onDelete={async (s) => {
                      if (!token) {
                        navigate('/login');
                        return;
                      }
                      const ok = window.confirm(`Excluir o serviço "${s.nome}"?`);
                      if (!ok) return;
                      await dispatch(deleteServico(s._id));
                    }}
                  />
                ) : (
                  <EventList
                    items={filteredEventos}
                    statsById={eventosState.statsById}
                    currentUserId={currentUserId}
                    isAuthenticated={Boolean(token)}
                    onDetails={(e) => {
                      setSelectedEvent(e);
                      setEventDetailsOpen(true);
                    }}
                    onRate={(e) => {
                      setSelectedEvent(e);
                      setRatingOpen(true);
                    }}
                    onEdit={(e) => {
                      if (!token) {
                        navigate('/login');
                        return;
                      }
                      setSelectedEvent(e);
                      setEventoFormMode('edit');
                      setEventoFormOpen(true);
                    }}
                    onDelete={async (e) => {
                      if (!token) {
                        navigate('/login');
                        return;
                      }
                      const ok = window.confirm(`Excluir o evento "${e.nome}"?`);
                      if (!ok) return;
                      await dispatch(deleteEvento(e._id));
                    }}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ServiceDetailsModal
        isOpen={serviceDetailsOpen}
        servico={selectedService}
        onClose={() => setServiceDetailsOpen(false)}
        onRate={(s) => {
          setSelectedService(s);
          setServiceDetailsOpen(false);
          setRatingOpen(true);
        }}
      />

      <EventDetailsModal
        isOpen={eventDetailsOpen}
        evento={selectedEvent}
        onClose={() => setEventDetailsOpen(false)}
        onRate={(e) => {
          setSelectedEvent(e);
          setEventDetailsOpen(false);
          setRatingOpen(true);
        }}
      />

      <RatingModal
        isOpen={ratingOpen}
        title={
          mode === 'servicos'
            ? selectedService
              ? `Avaliar: ${selectedService.nome}`
              : 'Avaliar'
            : selectedEvent
              ? `Avaliar: ${selectedEvent.nome}`
              : 'Avaliar'
        }
        onClose={() => setRatingOpen(false)}
        onSubmit={async ({ nota, comentario }) => {
          if (!token) throw new Error('Faça login para avaliar');

          if (mode === 'servicos' && selectedService) {
            await criarAvaliacaoServico({ servicoId: selectedService._id, nota, comentario });
            await dispatch(fetchServicoStats(selectedService._id));
            return;
          }

          if (mode === 'eventos' && selectedEvent) {
            await criarAvaliacaoEvento({ eventoId: selectedEvent._id, nota, comentario });
            await dispatch(fetchEventoStats(selectedEvent._id));
          }
        }}
      />

      <ServicoFormModal
        isOpen={servicoFormOpen}
        mode={servicoFormMode}
        initial={selectedService}
        onClose={() => setServicoFormOpen(false)}
        onSubmit={async (payload) => {
          if (!token) throw new Error('Faça login para criar/editar serviços');

          const input = {
            nome: payload.nome,
            descricao: payload.descricao,
            tipo_servico: payload.tipo_servico,
            categoria: payload.categoria,
            contato:
              payload.telefone || payload.instagram
                ? { telefone: payload.telefone, instagram: payload.instagram }
                : undefined,
            localizacao:
              typeof payload.latitude === 'number' || typeof payload.longitude === 'number'
                ? { latitude: payload.latitude, longitude: payload.longitude }
                : undefined,
            imagemFile: payload.imagemFile
          };

          if (servicoFormMode === 'create') {
            await dispatch(createServico(input as any));
            return;
          }
          if (!selectedService) throw new Error('Selecione um serviço para editar');
          await dispatch(updateServico({ servicoId: selectedService._id, input: input as any }));
        }}
      />

      <EventoFormModal
        isOpen={eventoFormOpen}
        mode={eventoFormMode}
        initial={selectedEvent}
        onClose={() => setEventoFormOpen(false)}
        onSubmit={async (payload) => {
          if (!token) throw new Error('Faça login para criar/editar eventos');

          const input = {
            nome: payload.nome,
            descricao: payload.descricao,
            data: payload.data,
            horario: payload.horario,
            local: payload.local,
            latitude: payload.latitude,
            longitude: payload.longitude,
            imagemFile: payload.imagemFile
          };

          if (eventoFormMode === 'create') {
            await dispatch(createEvento(input as any));
            return;
          }
          if (!selectedEvent) throw new Error('Selecione um evento para editar');
          await dispatch(updateEvento({ eventoId: selectedEvent._id, input: input as any }));
        }}
      />
    </div>
  );
}

