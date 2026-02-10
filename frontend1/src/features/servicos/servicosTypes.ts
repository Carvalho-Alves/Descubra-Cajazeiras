export type TipoServico = 'Hospedagem' | 'Alimentação/Lazer' | 'Ponto Turístico';

export type Servico = {
  _id: string;
  nome: string;
  descricao?: string;
  tipo_servico: TipoServico;
  categoria?: string;
  contato?: {
    telefone?: string;
    instagram?: string;
  };
  localizacao: {
    latitude: number;
    longitude: number;
  };
  imagem?: string[];
  usuario?: string | { _id: string; nome?: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
};

export type AvaliacaoStats = {
  media: number;
  total: number;
};
