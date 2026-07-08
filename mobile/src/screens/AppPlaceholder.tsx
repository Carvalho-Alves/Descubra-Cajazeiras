/**
 * AppPlaceholder — tela temporária exibida durante o desenvolvimento.
 * Substitua pelo AppNavigator quando a navegação estiver pronta.
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Container } from '../components/Container';
import { Colors } from '../theme/colors';
import { TextVariants } from '../theme/typography';

export function AppPlaceholder() {
  return (
    <Container>
      <Text style={styles.title}>Descubra+ Cajazeiras</Text>
      <Text style={styles.subtitle}>Design System carregado com sucesso 🎉</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TextVariants.h1,
    color: Colors.primary,
    marginTop: 32,
  },
  subtitle: {
    ...TextVariants.body,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
