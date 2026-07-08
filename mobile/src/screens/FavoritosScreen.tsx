import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Container } from '../components/Container';
import { Colors } from '../theme/colors';
import { TextVariants } from '../theme/typography';
import type { FavoritosScreenProps } from '../navigation/types';

export function FavoritosScreen(_props: FavoritosScreenProps) {
  return (
    <Container>
      <Text style={styles.title}>Favoritos</Text>
      <Text style={styles.body}>Seus locais favoritos aparecerão aqui.</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TextVariants.h1,
    color: Colors.text,
    marginTop: 32,
  },
  body: {
    ...TextVariants.body,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
