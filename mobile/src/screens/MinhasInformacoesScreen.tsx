import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
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
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import type { MinhasInformacoesScreenProps } from '../navigation/types';

export function MinhasInformacoesScreen({
  navigation,
}: MinhasInformacoesScreenProps) {
  const { user, updateProfile, refreshUser } = useAuth();
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNome(user?.nome || '');
    setEmail(user?.email || '');
  }, [user?.nome, user?.email]);

  const currentFoto = fotoUri || resolveAssetUrl(user?.foto);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão', 'Autorize o acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Nome e e-mail são obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        fotoUri,
      });
      await refreshUser();
      Alert.alert('Salvo', 'Suas informações foram atualizadas.');
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError
          ? error.message
          : 'Não foi possível atualizar o perfil.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.surface} />
        </Pressable>
        <Text style={styles.headerTitle}>Minhas Informações</Text>
        <View style={styles.headerBtn} />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarBlock}>
          {currentFoto ? (
            <Image source={{ uri: currentFoto }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#4B5563" />
            </View>
          )}
          <Pressable style={styles.changePhotoBtn} onPress={pickImage}>
            <Text style={styles.changePhotoText}>Alterar foto</Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nome completo</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={20} color={Colors.muted} />
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholderTextColor={Colors.muted}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.muted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.muted}
            />
          </View>
        </View>

        <Pressable
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.saveLabel}>Salvar alterações</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.surface,
  },
  content: {
    padding: Spacing.containerPadding,
    paddingBottom: Spacing.xxxl,
  },
  avatarBlock: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: Spacing.md,
  },
  changePhotoBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  changePhotoText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  field: { marginBottom: Spacing.lg },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 56,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: 0,
  },
  saveButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.md,
    color: Colors.surface,
  },
});
