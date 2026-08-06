/**
 * Helpers de formatação usados nas telas
 */
export function formatDateBR(value?: string | Date | null): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatRelativeDate(value?: string | Date | null): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'hoje';
  if (days === 1) return '1 dia atrás';
  if (days < 7) return `${days} dias atrás`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 semana atrás' : `${weeks} semanas atrás`;
  }
  const months = Math.floor(days / 30);
  return months === 1 ? '1 mês atrás' : `${months} meses atrás`;
}

export function labelEventoStatus(status?: string): string {
  switch ((status || '').toLowerCase()) {
    case 'ativo':
      return 'Ativo';
    case 'cancelado':
      return 'Cancelado';
    case 'encerrado':
      return 'Encerrado';
    default:
      return status || 'Ativo';
  }
}

export function mapTipoFilterToApi(
  filter: string,
): string | null {
  switch (filter) {
    case 'Hospedagem':
      return 'Hospedagem';
    case 'Alimentação':
      return 'Alimentação/Lazer';
    case 'Turístico':
      return 'Ponto Turístico';
    default:
      return null;
  }
}

export function shortTipoServico(tipo?: string): string {
  if (tipo === 'Alimentação/Lazer') return 'Alimentação';
  if (tipo === 'Ponto Turístico') return 'Turístico';
  return tipo || 'Serviço';
}

export function iconForTipo(
  tipo?: string,
): 'bed' | 'restaurant' | 'camera' | 'briefcase' {
  if (tipo === 'Hospedagem') return 'bed';
  if (tipo === 'Alimentação/Lazer') return 'restaurant';
  if (tipo === 'Ponto Turístico') return 'camera';
  return 'briefcase';
}

export function colorForTipo(tipo?: string): string {
  if (tipo === 'Hospedagem') return '#3B82F6';
  if (tipo === 'Alimentação/Lazer') return '#F97316';
  if (tipo === 'Ponto Turístico') return '#198754';
  return '#0D6EFD';
}
