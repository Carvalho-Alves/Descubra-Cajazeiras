import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

type FormTextInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  error?: string;
} & TextInputProps;

export function FormTextInput<T extends FieldValues>({
  control,
  name,
  label,
  error,
  style,
  ...rest
}: FormTextInputProps<T>) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, style, error ? styles.inputError : null]}
            placeholderTextColor={Colors.muted}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value ?? ''}
            {...rest}
          />
        )}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.sm, marginBottom: Spacing.sm },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSize.sm,
    color: '#4B5563',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  inputError: { borderColor: '#DC3545' },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    fontFamily: FontFamily.bodyRegular,
  },
});
