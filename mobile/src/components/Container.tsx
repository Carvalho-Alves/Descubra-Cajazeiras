/**
 * Container.tsx — componente global de layout
 *
 * Aplica:
 *   • Fundo Azul Claro (#F0F8FF)
 *   • Padding horizontal de 24 px (Spacing.containerPadding)
 *   • Respeito às safe areas do dispositivo via SafeAreaView
 *
 * Props:
 *   children      — conteúdo da tela
 *   style         — estilos extras aplicados sobre o container
 *   edges         — quais bordas do safe area respeitar (default: todas)
 *   scrollable    — envolve o conteúdo em ScrollView quando true
 *   noPadding     — remove o paddingHorizontal (útil para listas full-bleed)
 */
import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

interface ContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Bordas do safe area a respeitar. Padrão: todas as quatro. */
  edges?: Edge[];
  /** Envolve o conteúdo em ScrollView. */
  scrollable?: boolean;
  /** Remove o padding horizontal (ex.: listas full-bleed). */
  noPadding?: boolean;
}

export function Container({
  children,
  style,
  edges = ['top', 'right', 'bottom', 'left'],
  scrollable = false,
  noPadding = false,
}: ContainerProps) {
  const paddingStyle = noPadding ? null : styles.horizontalPadding;

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, paddingStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <SafeAreaView edges={edges} style={[styles.container, !scrollable && paddingStyle, style]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  horizontalPadding: {
    paddingHorizontal: Spacing.containerPadding, // 24 px
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
