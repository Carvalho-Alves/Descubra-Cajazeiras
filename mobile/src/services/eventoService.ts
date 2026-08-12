import { CAJAZEIRAS_CENTER } from '../config/api';
import { apiRequest } from './apiClient';

export type EventoStatus = 'ativo' | 'cancelado' | 'encerrado';

export type Evento = {
  _id: string;
  nome: string;
  descricao?: string;
  data: string;
  horario?: string;
  local?: string;
  telefone?: string;
  localizacao?: { latitude?: number; longitude?: number };
  imagem?: string | string[];
  status?: EventoStatus;
  usuario?: { _id?: string; nome?: string; email?: string } | string;
  avaliacao_media?: number;
  total_avaliacoes?: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function listEventos() {
  return apiRequest<Evento[]>('/eventos/');
}

export async function listMyEventos(token?: string | null) {
  return apiRequest<Evento[]>('/eventos/mine', { token });
}

export async function searchEventos(q: string) {
  const query = encodeURIComponent(q.trim());
  return apiRequest<Evento[]>(`/eventos/search?q=${query}`);
}

export async function getEvento(id: string) {
  return apiRequest<Evento>(`/eventos/${id}`);
}

export async function getEventoById(id: string, token?: string | null) {
  return apiRequest<Evento>(`/eventos/${id}`, { token });
}

export async function createEventoRequest(
  input: {
    nome: string;
    descricao?: string;
    data: string;
    horario?: string;
    latitude?: number;
    longitude?: number;
    imageUri?: string | null;
  },
  token?: string | null,
) {
  const form = new FormData();
  form.append('nome', input.nome);
  if (input.descricao) form.append('descricao', input.descricao);
  form.append('data', input.data);
  if (input.horario) form.append('horario', input.horario);
  form.append(
    'latitude',
    String(input.latitude ?? CAJAZEIRAS_CENTER.latitude),
  );
  form.append(
    'longitude',
    String(input.longitude ?? CAJAZEIRAS_CENTER.longitude),
  );

  if (input.imageUri) {
    const name = input.imageUri.split('/').pop() || 'evento.jpg';
    const match = /\.(\w+)$/.exec(name);
    const ext = match?.[1]?.toLowerCase() || 'jpeg';
    const isVideo = ['mp4', 'webm', 'mov', 'm4v'].includes(ext);
    const type = isVideo ? `video/${ext === 'mov' ? 'quicktime' : ext}` : `image/${ext}`;
    form.append('imagem', {
      uri: input.imageUri,
      name,
      type,
    } as unknown as Blob);
  }

  return apiRequest<Evento>('/eventos/', {
    method: 'POST',
    body: form,
    formData: true,
    token,
  });
}

export async function deleteEventoRequest(
  id: string,
  token?: string | null,
) {
  return apiRequest<{ message: string }>(`/eventos/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function updateEventoRequest(
  id: string,
  input: {
    nome: string;
    descricao?: string;
    data: string;
    horario?: string;
    latitude?: number;
    longitude?: number;
    imageUri?: string | null;
    status?: EventoStatus;
  },
  token?: string | null,
) {
  const form = new FormData();
  form.append('nome', input.nome);
  if (input.descricao) form.append('descricao', input.descricao);
  form.append('data', input.data);
  if (input.horario) form.append('horario', input.horario);
  
  if (input.latitude && input.longitude) {
    form.append('latitude', String(input.latitude));
    form.append('longitude', String(input.longitude));
  }
  
  if (input.status) form.append('status', input.status);

  // Só envia o arquivo físico de imagem para a API se ele for uma imagem local (do celular). 
  // Se for um link HTTP (já salva no banco), não envia nada.
  if (input.imageUri && !input.imageUri.startsWith('http')) {
    const name = input.imageUri.split('/').pop() || 'evento.jpg';
    const match = /\.(\w+)$/.exec(name);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    form.append('imagem', {
      uri: input.imageUri,
      name,
      type,
    } as unknown as Blob);
  }

  return apiRequest<Evento>(`/eventos/${id}`, {
    method: 'PUT',
    body: form,
    formData: true,
    token,
  });
}