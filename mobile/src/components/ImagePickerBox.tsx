import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

export function ImagePickerBox({ imageUri, onPress, placeholderText = "Toque para adicionar uma foto" }: any) {
  return (
    <TouchableOpacity style={styles.upload} onPress={onPress}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <>
          <Ionicons name="camera-outline" size={48} color={Colors.muted} />
          <Text style={styles.uploadText}>{placeholderText}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  upload: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: '#D1D5DB', borderStyle: 'dashed', minHeight: 140, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: Spacing.lg },
  preview: { width: '100%', height: 160 },
  uploadText: { marginTop: Spacing.md, fontFamily: FontFamily.bodyRegular, fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
});