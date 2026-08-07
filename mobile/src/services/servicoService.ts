import { CAJAZEIRAS_CENTER } from '../config/api';
import { apiRequest } from './apiClient';

export type TipoServico =
  | 'Hospedagem'
  | 'Alimentação/Lazer'
  | 'Ponto Turístico';

export type Servico = {
  _id: string;
  nome: string;
  descricao?: string;
  tipo_servico: TipoServico;
  categoria?: string;
  contato?: { telefone?: string; instagram?: string };
  localizacao?: { latitude?: number; longitude?: number };
  imagem?: string[];
  usuario?: { _id?: string; nome?: string; email?: string } | string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listServicos() {
  return apiRequest<Servico[]>('/servicos/');
}

export async function listMyServicos(token?: string | null) {
  return apiRequest<Servico[]>('/servicos/mine', { token });
}

export async function searchServicos(q: string) {
  const query = encodeURIComponent(q.trim());
  return apiRequest<Servico[]>(`/servicos/search?q=${query}`);
}

export async function getServico(id: string) {
  return apiRequest<Servico>(`/servicos/${id}`);
}

export async function createServicoRequest(
  input: {
    nome: string;
    descricao?: string;
    tipo_servico: TipoServico;
    telefone?: string;
    latitude?: number;
    longitude?: number;
    imageUri?: string | null;
  },
  token?: string | null,
) {
  const form = new FormData();
  form.append('nome', input.nome);
  if (input.descricao) form.append('descricao', input.descricao);
  form.append('tipo_servico', input.tipo_servico);
  form.append(
    'contato',
    JSON.stringify({ telefone: input.telefone || undefined }),
  );
  form.append(
    'localizacao',
    JSON.stringify({
      latitude: input.latitude ?? CAJAZEIRAS_CENTER.latitude,
      longitude: input.longitude ?? CAJAZEIRAS_CENTER.longitude,
    }),
  );

  if (input.imageUri) {
    const name = input.imageUri.split('/').pop() || 'servico.jpg';
    const match = /\.(\w+)$/.exec(name);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    form.append('imagem', {
      uri: input.imageUri,
      name,
      type,
    } as unknown as Blob);
  }

  return apiRequest<Servico>('/servicos/', {
    method: 'POST',
    body: form,
    formData: true,
    token,
  });
}

export async function deleteServicoRequest(
  id: string,
  token?: string | null,
) {
  return apiRequest<{ message: string }>(`/servicos/${id}`, {
    method: 'DELETE',
    token,
  });
}
