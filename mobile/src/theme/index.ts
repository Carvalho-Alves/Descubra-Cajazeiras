/**
 * Barrel do Design System — Descubra+ Cajazeiras
 *
 * Importe tudo a partir daqui:
 *   import { theme, Colors, FontFamily, Spacing } from '@/theme';
 */
export { Colors } from './colors';
export type { ColorKey } from './colors';

export {
  FontFamily,
  FontSize,
  LineHeight,
  TextVariants,
} from './typography';
export type { FontFamilyKey, FontSizeKey } from './typography';

export {
  Spacing,
  BorderRadius,
  Shadow,
  BASE_WIDTH,
  BASE_HEIGHT,
} from './spacing';
export type { SpacingKey } from './spacing';

// ── Objeto de tema unificado (opcional — útil com ThemeContext) ──
import { Colors } from './colors';
import { FontFamily, FontSize, LineHeight, TextVariants } from './typography';
import { Spacing, BorderRadius, Shadow, BASE_WIDTH, BASE_HEIGHT } from './spacing';

export const theme = {
  colors: Colors,
  fonts: FontFamily,
  fontSize: FontSize,
  lineHeight: LineHeight,
  textVariants: TextVariants,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadow: Shadow,
  screen: {
    baseWidth: BASE_WIDTH,
    baseHeight: BASE_HEIGHT,
  },
} as const;

export type Theme = typeof theme;
