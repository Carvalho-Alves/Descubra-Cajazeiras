/**
 * Paleta de cores do Design System — Descubra+ Cajazeiras
 * Proporção de referência: 390 × 844 px (iPhone 14)
 */
export const Colors = {
  // ── Identidade ─────────────────────────────────────────────
  /** Amarelo de destaque / marca */
  highlight: '#FFD500',

  /** Azul vibrante — ação primária / CTA */
  primary: '#0D6EFD',

  // ── Superfícies ─────────────────────────────────────────────
  /** Fundo geral das telas */
  background: '#F0F8FF',

  /** Superfície branca (cards, inputs, modais) */
  surface: '#FFFFFF',

  // ── Tipografia ──────────────────────────────────────────────
  /** Texto principal — títulos e corpo */
  text: '#212529',

  /** Texto secundário / placeholders */
  textSecondary: '#6C757D',

  // ── Suporte ─────────────────────────────────────────────────
  /** Bordas e divisores */
  border: '#E9ECEF',

  /** Erro / ação destrutiva */
  error: '#DC3545',

  /** Sucesso */
  success: '#198754',

  /** Aviso */
  warning: '#FFC107',
} as const;

export type ColorKey = keyof typeof Colors;
