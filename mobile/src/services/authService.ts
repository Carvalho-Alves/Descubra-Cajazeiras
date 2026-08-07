import { apiRequest, jsonBody } from './apiClient';

export type UserRole = 'Turista' | 'Admin';

export type AuthUser = {
  _id: string;
  nome: string;
  email: string;
  role?: UserRole;
  foto?: string;
  telefone?: string;
};

type LoginResponse = {
  message: string;
  user: AuthUser;
  token: string;
};

type RegisterResponse = {
  message: string;
  user: AuthUser;
  token: string;
};

export async function loginRequest(email: string, senha: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: jsonBody({ email, senha }),
  });
}

export async function registerRequest(input: {
  nome: string;
  email: string;
  senha: string;
}) {
  const form = new FormData();
  form.append('nome', input.nome);
  form.append('email', input.email);
  form.append('senha', input.senha);

  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: form,
    formData: true,
  });
}

export async function getUserById(id: string, token?: string | null) {
  return apiRequest<AuthUser & { neo4jNode?: unknown }>(`/auth/${id}`, {
    token,
  });
}

export async function updateUserRequest(
  id: string,
  data: {
    nome?: string;
    email?: string;
    senha?: string;
    fotoUri?: string | null;
  },
  token?: string | null,
) {
  const form = new FormData();
  if (data.nome != null) form.append('nome', data.nome);
  if (data.email != null) form.append('email', data.email);
  if (data.senha) form.append('senha', data.senha);

  if (data.fotoUri) {
    const name = data.fotoUri.split('/').pop() || 'foto.jpg';
    const match = /\.(\w+)$/.exec(name);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    form.append('foto', {
      uri: data.fotoUri,
      name,
      type,
    } as unknown as Blob);
  }

  return apiRequest<AuthUser>(`/auth/${id}`, {
    method: 'PUT',
    body: form,
    formData: true,
    token,
  });
}
