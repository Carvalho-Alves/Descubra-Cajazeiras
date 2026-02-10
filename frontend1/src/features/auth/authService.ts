import { api } from '../../services/api';
import type { AuthUser, LoginRequest, RegisterRequest } from './authTypes';

type LoginResponse = {
  token: string;
  user: {
    _id: string;
    nome: string;
    email: string;
    foto?: string;
    role?: string;
  };
};

export async function login(request: LoginRequest): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post<LoginResponse>('/auth/login', request);
  return {
    token: data.token,
    user: {
      id: data.user._id,
      nome: data.user.nome,
      email: data.user.email,
      foto: data.user.foto,
      role: data.user.role
    }
  };
}

export async function register(request: RegisterRequest): Promise<void> {
  const form = new FormData();
  form.append('nome', request.nome);
  form.append('email', request.email);
  form.append('senha', request.senha);
  if (request.foto) {
    form.append('foto', request.foto);
  }

  await api.post('/auth/register', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
