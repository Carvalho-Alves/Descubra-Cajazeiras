import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import { profileSchema } from '../hooks/useFormValidation';
import { FormTextInput } from '../components/FormTextInput';
import type { MinhasInformacoesScreenProps } from '../navigation/types';

type ProfileForm = {
  nome: string;
  email: string;
};

export function MinhasInformacoesScreen({
  navigation,
}: MinhasInformacoesScreenProps) {
  const { user, updateProfile, refreshUser } = useAuth();
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
    },
  });

  useEffect(() => {
    reset({
      nome: user?.nome || '',
      email: user?.email || '',
    });
  }, [user?.nome, user?.email, reset]);

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

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await updateProfile({
        nome: values.nome.trim(),
        email: values.email.trim().toLowerCase(),
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
  });

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
              <Ionicons name="person" size={48} color={Colors.primary} />
            </View>
          )}
          <Pressable style={styles.changePhotoBtn} onPress={pickImage}>
            <Ionicons name="camera-outline" size={18} color={Colors.primary} />
            <Text style={styles.changePhotoText}>Alterar foto</Text>
          </Pressable>
        </View>

        <FormTextInput
          control={control}
          name="nome"
          label="Nome completo"
          placeholder="Seu nome"
          error={errors.nome?.message}
        />

        <FormTextInput
          control={control}
          name="email"
          label="E-mail"
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email?.message}
        />

        <Pressable
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={onSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.saveBtnText}>Salvar alterações</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.surface,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  avatarBlock: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  changePhotoText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  saveBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.md,
    color: Colors.surface,
  },
});
