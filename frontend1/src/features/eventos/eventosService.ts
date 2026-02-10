import { api } from '../../services/api';
import type { AvaliacaoStats, Evento } from './eventosTypes';

export type EventoUpsertInput = {
  nome: string;
  descricao?: string;
  data: string;
  horario?: string;
  local?: string;
  latitude: number;
  longitude: number;
  imagemFile?: File | null;
};

function buildEventoFormData(input: EventoUpsertInput): FormData {
  const fd = new FormData();
  fd.append('nome', input.nome);
  if (input.descricao) fd.append('descricao', input.descricao);
  fd.append('data', input.data);
  if (input.horario) fd.append('horario', input.horario);
  if (input.local) fd.append('local', input.local);
  fd.append('latitude', String(input.latitude));
  fd.append('longitude', String(input.longitude));
  if (input.imagemFile) fd.append('imagem', input.imagemFile);
  return fd;
}

export async function listarEventos(): Promise<Evento[]> {
  const response = await api.get<Evento[]>('/eventos');
  return response.data;
}

export async function criarEvento(input: EventoUpsertInput): Promise<Evento> {
  const fd = buildEventoFormData(input);
  const response = await api.post<Evento>('/eventos', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function atualizarEvento(eventoId: string, input: EventoUpsertInput): Promise<Evento> {
  const fd = buildEventoFormData(input);
  const response = await api.put<Evento>(`/eventos/${eventoId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function deletarEvento(eventoId: string): Promise<{ message: string } | void> {
  const response = await api.delete<{ message: string }>(`/eventos/${eventoId}`);
  return response.data;
}

export async function obterStatsEvento(eventoId: string): Promise<AvaliacaoStats> {
  const response = await api.get<{ stats: AvaliacaoStats }>(
    `/avaliacoes/referencia/evento/${eventoId}?limit=1&page=1`
  );
  return response.data.stats;
}

export async function criarAvaliacaoEvento(input: {
  eventoId: string;
  nota: number;
  comentario?: string;
}): Promise<void> {
  await api.post('/avaliacoes', {
    tipo: 'evento',
    referenciaId: input.eventoId,
    nota: input.nota,
    comentario: input.comentario
  });
}
