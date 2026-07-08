/**
 * Espaçamentos e dimensões base — Descubra+ Cajazeiras
 *
 * Proporção de referência: 390 × 844 px
 * Grid base: múltiplos de 8 px
 */

// ── Dimensões de referência ─────────────────────────────────────
export const BASE_WIDTH = 390;
export const BASE_HEIGHT = 844;

// ── Escala de espaçamento (grid de 8 px) ────────────────────────
export const Spacing = {
  /** 2 px */
  nano: 2,
  /** 4 px */
  xs: 4,
  /** 8 px */
  sm: 8,
  /** 12 px */
  md: 12,
  /** 16 px */
  lg: 16,
  /** 24 px — padding horizontal padrão do Container */
  containerPadding: 24,
  /** 32 px */
  xl: 32,
  /** 40 px */
  xxl: 40,
  /** 48 px */
  xxxl: 48,
  /** 64 px */
  huge: 64,
} as const;

export type SpacingKey = keyof typeof Spacing;

// ── Raios de borda ───────────────────────────────────────────────
export const BorderRadius = {
  /** 4 px — inputs e chips */
  sm: 4,
  /** 8 px — cards e botões */
  md: 8,
  /** 12 px — modais e drawers */
  lg: 12,
  /** 16 px — sheets */
  xl: 16,
  /** 999 px — pill / fully rounded */
  full: 999,
} as const;

// ── Sombras ─────────────────────────────────────────────────────
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
