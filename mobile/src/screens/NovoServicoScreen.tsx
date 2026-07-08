import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import type { NovoServicoScreenProps } from '../navigation/types';

// ── Categorias disponíveis ───────────────────────────────────────
const CATEGORIAS = ['Restaurante', 'Pousada', 'Ponto Turístico'] as const;
type Categoria = (typeof CATEGORIAS)[number] | '';

// ── Subcomponente: wrapper de campo com label ────────────────────
function FieldWrapper({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.labelRequired}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

// ── Tela principal ───────────────────────────────────────────────
export function NovoServicoScreen({ navigation }: NovoServicoScreenProps) {
  // ── Estado do formulário ──────────────────────────────────────
  const [nome, setNome]           = useState('');
  const [categoria, setCategoria] = useState<Categoria>('');
  const [descricao, setDescricao] = useState('');
  const [endereco, setEndereco]   = useState('');
  const [horario, setHorario]     = useState('');

  // ── Estado do dropdown customizado ────────────────────────────
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Oculta cabeçalho padrão do Stack
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSave = useCallback(() => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do estabelecimento.');
      return;
    }
    if (!categoria) {
      Alert.alert('Campo obrigatório', 'Selecione uma categoria.');
      return;
    }
    Alert.alert('Sucesso', `Serviço "${nome}" salvo!`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }, [nome, categoria, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

      {/* ── Cabeçalho ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerSide}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Serviço</Text>
        <View style={styles.headerSide} />
      </View>

      {/* ── Formulário com KeyboardAvoidingView ───────────────── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Área de upload de capa ──────────────────────── */}
          <TouchableOpacity
            style={styles.uploadArea}
            activeOpacity={0.7}
            accessibilityLabel="Adicionar imagem de capa"
          >
            <View style={styles.uploadInner}>
              <Ionicons name="camera-outline" size={36} color={Colors.textSecondary} />
              <Text style={styles.uploadText}>Adicionar capa do local</Text>
              <Text style={styles.uploadHint}>JPG ou PNG · máx. 5 MB</Text>
            </View>
          </TouchableOpacity>

          {/* ── Campo: Nome ─────────────────────────────────── */}
          <FieldWrapper label="Nome do Estabelecimento" required>
            <TextInput
              style={styles.input}
              placeholder="Ex: Restaurante Sabor da Terra"
              placeholderTextColor={Colors.textSecondary}
              value={nome}
              onChangeText={setNome}
              returnKeyType="next"
              maxLength={100}
            />
          </FieldWrapper>

          {/* ── Campo: Categoria (dropdown customizado) ──────── */}
          <FieldWrapper label="Categoria" required>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setDropdownVisible(true)}
              activeOpacity={0.75}
              accessibilityLabel="Selecionar categoria"
            >
              <Text
                style={[
                  styles.dropdownText,
                  !categoria && styles.dropdownPlaceholder,
                ]}
              >
                {categoria || 'Selecione uma categoria'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </FieldWrapper>

          {/* ── Campo: Descrição (multiline) ─────────────────── */}
          <FieldWrapper label="Descrição">
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Descreva o local, os serviços e diferenciais..."
              placeholderTextColor={Colors.textSecondary}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{descricao.length}/500</Text>
          </FieldWrapper>

          {/* ── Campo: Endereço ──────────────────────────────── */}
          <FieldWrapper label="Endereço Completo">
            <TextInput
              style={styles.input}
              placeholder="Rua, número, bairro, cidade"
              placeholderTextColor={Colors.textSecondary}
              value={endereco}
              onChangeText={setEndereco}
              returnKeyType="next"
            />
          </FieldWrapper>

          {/* ── Campo: Horário ───────────────────────────────── */}
          <FieldWrapper label="Horário de Funcionamento">
            <TextInput
              style={styles.input}
              placeholder="Ex: Seg–Sex 08h–18h · Sáb 08h–13h"
              placeholderTextColor={Colors.textSecondary}
              value={horario}
              onChangeText={setHorario}
              returnKeyType="done"
            />
          </FieldWrapper>

          {/* Espaço para o footer não cobrir o último campo */}
          <View style={{ height: Spacing.huge }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Rodapé fixo ───────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={Colors.surface} />
          <Text style={styles.saveButtonText}>Salvar Serviço</Text>
        </TouchableOpacity>
      </View>

      {/* ── Modal: Dropdown de Categoria ──────────────────────── */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDropdownVisible(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.dropdownBackdrop}
          onPress={() => setDropdownVisible(false)}
        >
          <Pressable style={styles.dropdownSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.dropdownSheetTitle}>Selecione a Categoria</Text>

            {CATEGORIAS.map((cat, index) => (
              <View key={cat}>
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setCategoria(cat);
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{cat}</Text>
                  {categoria === cat && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
                {index < CATEGORIAS.length - 1 && (
                  <View style={styles.optionDivider} />
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.dropdownCancelButton}
              onPress={() => setDropdownVisible(false)}
            >
              <Text style={styles.dropdownCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.containerPadding,
  },

  // ── Cabeçalho ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerSide: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,
    color: Colors.text,
  },

  // ── Área de upload ────────────────────────────────────────────
  uploadArea: {
    height: 160,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  uploadInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  uploadText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  uploadHint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.border,
  },

  // ── Campos do formulário ──────────────────────────────────────
  fieldWrapper: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,           // 14px
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  labelRequired: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    height: 52,
  },
  inputMultiline: {
    height: 112,
    paddingTop: 14,
  },
  charCount: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xxs,          // 10px
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },

  // ── Dropdown ──────────────────────────────────────────────────
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
  dropdownText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  dropdownPlaceholder: {
    color: Colors.textSecondary,
  },

  // ── Rodapé fixo ───────────────────────────────────────────────
  footer: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 52,
    gap: Spacing.sm,
  },
  saveButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.surface,
  },

  // ── Modal dropdown ────────────────────────────────────────────
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  dropdownSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.containerPadding,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  dropdownSheetTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  dropdownOptionText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  optionDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  dropdownCancelButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dropdownCancelText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
