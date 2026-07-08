/**
 * Tipografia do Design System — Descubra+ Cajazeiras
 *
 * Fontes:
 *   • Poppins 600 / 700  → títulos e headings
 *   • Open Sans 400 / 500 → corpo de texto e labels
 *
 * As chaves de FontFamily correspondem exatamente aos nomes
 * registrados pelo expo-google-fonts no useFonts().
 */

// ── Famílias ────────────────────────────────────────────────────
export const FontFamily = {
  // Poppins — Títulos
  headingSemiBold: 'Poppins_600SemiBold',
  headingBold: 'Poppins_700Bold',

  // Open Sans — Corpo
  bodyRegular: 'OpenSans_400Regular',
  bodyMedium: 'OpenSans_500Medium',
} as const;

export type FontFamilyKey = keyof typeof FontFamily;

// ── Tamanhos (escala tipográfica base) ──────────────────────────
export const FontSize = {
  /** 10 — legenda / badge */
  xxs: 10,
  /** 12 — auxiliar / aviso */
  xs: 12,
  /** 14 — corpo secundário */
  sm: 14,
  /** 16 — corpo principal */
  md: 16,
  /** 18 — subtítulo */
  lg: 18,
  /** 20 — título de seção */
  xl: 20,
  /** 24 — título de tela */
  xxl: 24,
  /** 28 — heading grande */
  xxxl: 28,
  /** 32 — display / hero */
  display: 32,
} as const;

export type FontSizeKey = keyof typeof FontSize;

// ── Alturas de linha ─────────────────────────────────────────────
export const LineHeight = {
  /** 1.2× — headings compactos */
  tight: 1.2,
  /** 1.5× — corpo padrão */
  normal: 1.5,
  /** 1.75× — leitura longa */
  relaxed: 1.75,
} as const;

// ── Atalhos semânticos prontos para uso ─────────────────────────
export const TextVariants = {
  display: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.display,
    lineHeight: FontSize.display * LineHeight.tight,
  },
  h1: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxxl,
    lineHeight: FontSize.xxxl * LineHeight.tight,
  },
  h2: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl * LineHeight.tight,
  },
  h3: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * LineHeight.normal,
  },
  bodyLg: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * LineHeight.normal,
  },
  body: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * LineHeight.normal,
  },
  bodyMedium: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * LineHeight.normal,
  },
  caption: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
} as const;
