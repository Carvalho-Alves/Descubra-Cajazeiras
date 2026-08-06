/**
 * Paleta de cores do Design System — Descubra+ Cajazeiras
 * Proporção de referência: 390 × 844 px (iPhone 14)
 */
export const Colors = {
  // ── Identidade ─────────────────────────────────────────────
  /** Amarelo de destaque / marca */
  highlight: '#FFD500',

  /** Amarelo escuro do gradiente do header */
  highlightDark: '#E6C200',

  /** Azul vibrante — ação primária / CTA */
  primary: '#0D6EFD',

  // ── Superfícies ─────────────────────────────────────────────
  /** Fundo geral das telas */
  background: '#F0F8FF',

  /** Fundo cinza claro (perfil / listas) */
  backgroundMuted: '#F9FAFB',

  /** Superfície branca (cards, inputs, modais) */
  surface: '#FFFFFF',

  /** Fundo de input */
  inputBackground: '#F9FAFB',

  // ── Tipografia ──────────────────────────────────────────────
  /** Texto principal — títulos e corpo */
  text: '#212529',

  /** Texto secundário / placeholders */
  textSecondary: '#6C757D',

  /** Ícone/tab inativo */
  muted: '#9CA3AF',

  // ── Suporte ─────────────────────────────────────────────────
  /** Bordas e divisores */
  border: '#E9ECEF',

  /** Divisor de menu */
  divider: '#F0F0F0',

  /** Erro / ação destrutiva */
  error: '#DC3545',

  /** Sucesso */
  success: '#198754',

  /** Aviso */
  warning: '#FFC107',

  /** Accent coral (média geral) */
  coral: '#FF6B6B',
} as const;

export type ColorKey = keyof typeof Colors;
