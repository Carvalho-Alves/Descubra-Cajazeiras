import { apiRequest } from './apiClient';

export type EstatisticasData = {
  totalPontos: number;
  totalEventos: number;
  totalAvaliacoes: number;
  mediaGeral: number;
  eventosPorStatus?: Array<{ _id: string; total: number }>;
};

export type EstatisticasResponse = {
  success: boolean;
  data: EstatisticasData;
};

export async function getEstatisticas() {
  const res = await apiRequest<EstatisticasResponse>('/estatisticas/');
  return res.data;
}
