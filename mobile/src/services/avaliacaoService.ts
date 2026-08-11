import { apiRequest, jsonBody } from './apiClient';

export type AvaliacaoTipo = 'servico' | 'evento';

export type Avaliacao = {
  _id: string;
  tipo: AvaliacaoTipo;
  referenciaId: string;
  usuarioId?:
    | string
    | { _id?: string; nome?: string; email?: string };
  nota: number;
  comentario?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  createdAt?: string;
};

export type AvaliacoesPorRefResponse = {
  referencia: { tipo: AvaliacaoTipo; id: string };
  paginacao: { page: number; limit: number; count: number };
  stats: { media: number; total: number };
  items: Avaliacao[];
};

export async function listAvaliacoes(page = 1, limit = 50) {
  return apiRequest<Avaliacao[]>(
    `/avaliacoes/?page=${page}&limit=${limit}`,
  );
}

export async function listAvaliacoesByRef(
  tipo: AvaliacaoTipo,
  id: string,
  page = 1,
  limit = 50,
) {
  return apiRequest<AvaliacoesPorRefResponse>(
    `/avaliacoes/referencia/${tipo}/${id}?page=${page}&limit=${limit}`,
  );
}

export async function createAvaliacaoRequest(
  input: {
    tipo: AvaliacaoTipo;
    referenciaId: string;
    nota: number;
    comentario?: string;
  },
  token?: string | null,
) {
  return apiRequest<Avaliacao>('/avaliacoes/', {
    method: 'POST',
    body: jsonBody(input),
    token,
  });
}

export async function listAvaliacoesByServico(
  servicoId: string,
  page = 1,
  limit = 50,
) {
  return apiRequest<AvaliacoesPorRefResponse>(
    `/avaliacoes/referencia/servico/${servicoId}?page=${page}&limit=${limit}`,
  );
}

export async function listAvaliacoesByEvento(
  eventoId: string,
  page = 1,
  limit = 50,
) {
  return apiRequest<AvaliacoesPorRefResponse>(
    `/avaliacoes/referencia/evento/${eventoId}?page=${page}&limit=${limit}`,
  );
}
