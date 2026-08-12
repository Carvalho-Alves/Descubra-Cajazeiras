import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, Shadow } from '../theme/spacing';

export function FloatingActionButton({ onPress, iconName = 'add' }: any) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={iconName} size={28} color={Colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.containerPadding,
    bottom: Spacing.containerPadding,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
});