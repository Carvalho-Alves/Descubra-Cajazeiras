import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';

import type { Servico, TipoServico } from '../features/servicos/servicosTypes';

type Props = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initial?: Servico | null;
  onClose: () => void;
  onSubmit: (payload: {
    nome: string;
    descricao?: string;
    tipo_servico: TipoServico;
    categoria?: string;
    telefone?: string;
    instagram?: string;
    latitude?: number;
    longitude?: number;
    imagemFile?: File | null;
  }) => Promise<void> | void;
};

function parseNumberOrUndefined(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export function ServicoFormModal({ isOpen, mode, initial, onClose, onSubmit }: Props) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoServico>('Hospedagem');
  const [categoria, setCategoria] = useState('');
  const [telefone, setTelefone] = useState('');
  const [instagram, setInstagram] = useState('');
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
      setTipo(initial.tipo_servico ?? 'Hospedagem');
      setCategoria(initial.categoria ?? '');
      setTelefone(initial.contato?.telefone ?? '');
      setInstagram(initial.contato?.instagram ?? '');
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
    setTipo('Hospedagem');
    setCategoria('');
    setTelefone('');
    setInstagram('');
    setLatitude('');
    setLongitude('');
    setImagemFile(null);
  }, [isOpen, mode, initial]);

  const canSubmit = useMemo(() => {
    return nome.trim().length > 0 && !isSaving;
  }, [nome, isSaving]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const lat = parseNumberOrUndefined(latitude);
    const lon = parseNumberOrUndefined(longitude);

    try {
      setIsSaving(true);
      setError(null);
      await onSubmit({
        nome: nome.trim(),
        descricao: descricao.trim() ? descricao.trim() : undefined,
        tipo_servico: tipo,
        categoria: categoria.trim() ? categoria.trim() : undefined,
        telefone: telefone.trim() ? telefone.trim() : undefined,
        instagram: instagram.trim() ? instagram.trim() : undefined,
        latitude: lat,
        longitude: lon,
        imagemFile
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar serviço');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{mode === 'create' ? 'Novo serviço' : 'Editar serviço'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2" controlId="servicoNome">
            <Form.Label>Nome</Form.Label>
            <Form.Control value={nome} onChange={(e) => setNome(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-2" controlId="servicoTipo">
            <Form.Label>Tipo</Form.Label>
            <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoServico)}>
              <option value="Hospedagem">Hospedagem</option>
              <option value="Alimentação/Lazer">Alimentação/Lazer</option>
              <option value="Ponto Turístico">Ponto Turístico</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2" controlId="servicoCategoria">
            <Form.Label>Categoria (opcional)</Form.Label>
            <Form.Control value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="servicoDescricao">
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
              <Form.Group controlId="servicoTelefone">
                <Form.Label>Telefone (opcional)</Form.Label>
                <Form.Control value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="servicoInstagram">
                <Form.Label>Instagram (opcional)</Form.Label>
                <Form.Control value={instagram} onChange={(e) => setInstagram(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2 mb-2">
            <Col sm={6}>
              <Form.Group controlId="servicoLat">
                <Form.Label>Latitude (opcional)</Form.Label>
                <Form.Control value={latitude} onChange={(e) => setLatitude(e.target.value)} />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="servicoLng">
                <Form.Label>Longitude (opcional)</Form.Label>
                <Form.Control value={longitude} onChange={(e) => setLongitude(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2" controlId="servicoImagem">
            <Form.Label>Imagem (opcional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setImagemFile(e.currentTarget.files?.[0] ?? null)}
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
