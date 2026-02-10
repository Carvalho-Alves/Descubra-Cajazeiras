export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  foto?: string;
  role?: string;
};

export type LoginRequest = {
  email: string;
  senha: string;
};

export type RegisterRequest = {
  nome: string;
  email: string;
  senha: string;
  foto?: File | null;
};
