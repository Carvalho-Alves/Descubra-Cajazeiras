import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { createEventoRequest } from '../services/eventoService';
import { ApiError } from '../services/apiClient';
import type { NovoEventoScreenProps } from '../navigation/types';

export function NovoEventoScreen({ navigation }: NovoEventoScreenProps) {
  const { token } = useAuth();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão', 'Autorize o acesso à galeria para enviar foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do evento.');
      return;
    }
    if (!data.trim()) {
      Alert.alert(
        'Campo obrigatório',
        'Informe a data (ex.: 2026-08-20 ou 20/08/2026).',
      );
      return;
    }

    // Aceita DD/MM/YYYY ou YYYY-MM-DD
    let isoDate = data.trim();
    const brMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(isoDate);
    if (brMatch) {
      isoDate = `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
    }

    setSaving(true);
    try {
      await createEventoRequest(
        {
          nome: nome.trim(),
          descricao: descricao.trim() || undefined,
          data: isoDate,
          horario: horario.trim() || undefined,
          imageUri,
        },
        token,
      );
      Alert.alert('Sucesso', 'Evento cadastrado!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar o evento.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={styles.cancel}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Evento</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.save}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.upload} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={48} color={Colors.muted} />
                <Text style={styles.uploadText}>
                  Toque para adicionar uma foto do evento
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.field}>
            <Text style={styles.label}>Nome do Evento</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome"
              placeholderTextColor={Colors.muted}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={Colors.muted}
              value={data}
              onChangeText={setData}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Horário</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: 19:00"
              placeholderTextColor={Colors.muted}
              value={horario}
              onChangeText={setHorario}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Descreva o evento..."
              placeholderTextColor={Colors.muted}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.mapBtn}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.mapBtnText}>
              Localização padrão: centro de Cajazeiras
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  cancel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: '#4B5563',
  },
  headerTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 17,
    color: Colors.text,
  },
  save: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  upload: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: 160 },
  uploadText: {
    marginTop: Spacing.md,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  field: { gap: Spacing.sm },
  label: {
    fontFamily: FontFamily.bodyRegular,
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
  textarea: { minHeight: 96 },
  mapBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  mapBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
});
