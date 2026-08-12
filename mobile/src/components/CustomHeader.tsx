import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing } from '../theme/spacing';

export function CustomHeader({ title, onCancel, onSave, isSaving, saveText = 'Salvar' }: any) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onCancel} disabled={isSaving}>
        <Text style={styles.cancel}>Cancelar</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={onSave} disabled={isSaving}>
        {isSaving ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Text style={styles.save}>{saveText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  cancel: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: '#4B5563' },
  headerTitle: { fontFamily: FontFamily.headingSemiBold, fontSize: 17, color: Colors.text },
  save: { fontFamily: FontFamily.headingSemiBold, fontSize: FontSize.md, color: Colors.primary },
});