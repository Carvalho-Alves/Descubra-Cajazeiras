import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

export function CustomInput({ label, error, style, ...rest }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style, error ? styles.inputError : null]}
        placeholderTextColor={Colors.muted}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.sm, marginBottom: Spacing.sm },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: FontSize.sm, color: '#4B5563' },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: 14, fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: Colors.text },
  inputError: { borderColor: '#DC3545' },
  errorText: { color: '#DC3545', fontSize: 12, fontFamily: FontFamily.bodyRegular }
});