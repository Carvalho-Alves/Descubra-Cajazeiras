export type EventoStatus = 'ativo' | 'cancelado' | 'encerrado';

export type Evento = {
  _id: string;
  nome: string;
  descricao?: string;
  data: string; // ISO date
  horario?: string;
  localizacao: {
    latitude: number;
    longitude: number;
  };
  imagem?: string;
  usuario?: string | { _id: string; nome?: string; email?: string };
  status?: EventoStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type AvaliacaoStats = {
  media: number;
  total: number;
};
