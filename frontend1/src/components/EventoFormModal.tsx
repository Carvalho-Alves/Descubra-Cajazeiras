import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';

import type { Evento } from '../features/eventos/eventosTypes';

type Props = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initial?: Evento | null;
  onClose: () => void;
  onSubmit: (payload: {
    nome: string;
    descricao?: string;
    data: string;
    horario?: string;
    local?: string;
    latitude: number;
    longitude: number;
    imagemFile?: File | null;
  }) => Promise<void> | void;
};

function parseRequiredNumber(value: string): number {
  const trimmed = value.trim();
  const n = Number(trimmed);
  if (!trimmed || !Number.isFinite(n)) throw new Error('Latitude/longitude inválidas');
  return n;
}

function toDateInputValue(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function EventoFormModal({ isOpen, mode, initial, onClose, onSubmit }: Props) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imagemFile, setImagemFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setIsSaving(false);

    if (mode === 'edit' && initial) {
      setNome(initial.nome ?? '');
      setDescricao(initial.descricao ?? '');
      setData(toDateInputValue(initial.data));
      setHorario(initial.horario ?? '');
      setLocal((initial as any)?.local ?? '');
      setLatitude(
        typeof (initial as any)?.localizacao?.latitude === 'number' ? String((initial as any).localizacao.latitude) : ''
      );
      setLongitude(
        typeof (initial as any)?.localizacao?.longitude === 'number' ? String((initial as any).localizacao.longitude) : ''
      );
      setImagemFile(null);
      return;
    }

    setNome('');
    setDescricao('');
    setData('');
    setHorario('');
    setLocal('');
    setLatitude('');
    setLongitude('');
    setImagemFile(null);
  }, [isOpen, mode, initial]);

  const canSubmit = useMemo(() => {
    return nome.trim().length > 0 && data.trim().length > 0 && latitude.trim().length > 0 && longitude.trim().length > 0 && !isSaving;
  }, [nome, data, latitude, longitude, isSaving]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSaving(true);
      setError(null);
      const lat = parseRequiredNumber(latitude);
      const lon = parseRequiredNumber(longitude);

      await onSubmit({
        nome: nome.trim(),
        descricao: descricao.trim() ? descricao.trim() : undefined,
        data: data.trim(),
        horario: horario.trim() ? horario.trim() : undefined,
        local: local.trim() ? local.trim() : undefined,
        latitude: lat,
        longitude: lon,
        imagemFile
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar evento');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{mode === 'create' ? 'Novo evento' : 'Editar evento'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2" controlId="eventoNome">
            <Form.Label>Nome</Form.Label>
            <Form.Control value={nome} onChange={(e) => setNome(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-2" controlId="eventoData">
            <Form.Label>Data</Form.Label>
            <Form.Control type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </Form.Group>

          <Row className="g-2 mb-2">
            <Col sm={6}>
              <Form.Group controlId="eventoHorario">
                <Form.Label>Horário (opcional)</Form.Label>
                <Form.Control value={horario} onChange={(e) => setHorario(e.target.value)} />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="eventoLocal">
                <Form.Label>Local (opcional)</Form.Label>
                <Form.Control value={local} onChange={(e) => setLocal(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="eventoDescricao">
            <Form.Label>Descrição (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </Form.Group>

          <Row className="g-2 mb-2">
            <Col sm={6}>
              <Form.Group controlId="eventoLat">
                <Form.Label>Latitude</Form.Label>
                <Form.Control value={latitude} onChange={(e) => setLatitude(e.target.value)} />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="eventoLng">
                <Form.Label>Longitude</Form.Label>
                <Form.Control value={longitude} onChange={(e) => setLongitude(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2" controlId="eventoImagem">
            <Form.Label>Imagem (opcional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setImagemFile((e.currentTarget as HTMLInputElement).files?.[0] ?? null)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
