import { api } from '../../services/api';
import type { AvaliacaoStats, Servico } from './servicosTypes';

export type ServicoUpsertInput = {
  nome: string;
  descricao?: string;
  tipo_servico: Servico['tipo_servico'];
  categoria?: string;
  contato?: {
    telefone?: string;
    instagram?: string;
  };
  localizacao?: {
    latitude?: number;
    longitude?: number;
  };
  imagemFile?: File | null;
};

function buildServicoFormData(input: ServicoUpsertInput): FormData {
  const fd = new FormData();
  fd.append('nome', input.nome);
  if (input.descricao) fd.append('descricao', input.descricao);
  fd.append('tipo_servico', input.tipo_servico);
  if (input.categoria) fd.append('categoria', input.categoria);
  if (input.contato) fd.append('contato', JSON.stringify(input.contato));
  if (input.localizacao) fd.append('localizacao', JSON.stringify(input.localizacao));
  if (input.imagemFile) fd.append('imagem', input.imagemFile);
  return fd;
}

export async function listarServicos(): Promise<Servico[]> {
  const response = await api.get<Servico[]>('/servicos');
  return response.data;
}

export async function obterServico(servicoId: string): Promise<Servico> {
  const response = await api.get<Servico>(`/servicos/${servicoId}`);
  return response.data;
}

export async function criarServico(input: ServicoUpsertInput): Promise<Servico> {
  const fd = buildServicoFormData(input);
  const response = await api.post<Servico>('/servicos', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function atualizarServico(servicoId: string, input: ServicoUpsertInput): Promise<Servico> {
  const fd = buildServicoFormData(input);
  const response = await api.put<Servico>(`/servicos/${servicoId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function deletarServico(servicoId: string): Promise<{ message: string } | void> {
  const response = await api.delete<{ message: string }>(`/servicos/${servicoId}`);
  return response.data;
}

export async function obterStatsServico(servicoId: string): Promise<AvaliacaoStats> {
  const response = await api.get<{ stats: AvaliacaoStats }>(
    `/avaliacoes/referencia/servico/${servicoId}?limit=1&page=1`
  );
  return response.data.stats;
}

export async function criarAvaliacaoServico(input: {
  servicoId: string;
  nota: number;
  comentario?: string;
}): Promise<void> {
  await api.post('/avaliacoes', {
    tipo: 'servico',
    referenciaId: input.servicoId,
    nota: input.nota,
    comentario: input.comentario
  });
}
