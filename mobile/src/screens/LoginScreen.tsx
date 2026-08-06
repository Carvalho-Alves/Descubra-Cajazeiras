import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import type { LoginScreenProps } from '../navigation/types';

type AuthTab = 'entrar' | 'cadastrar';

export function LoginScreen(_props: LoginScreenProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaVisible, setSenhaVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCadastrar = activeTab === 'cadastrar';

  const handleSubmit = async () => {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Informe e-mail e senha.');
      return;
    }

    if (isCadastrar) {
      if (!nome.trim()) {
        Alert.alert('Atenção', 'Informe seu nome completo.');
        return;
      }
      if (senha.length < 6) {
        Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (senha !== confirmarSenha) {
        Alert.alert('Atenção', 'As senhas não coincidem.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isCadastrar) {
        await register({ nome, email, senha });
      } else {
        await login(email, senha);
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível autenticar. Verifique a API e tente novamente.';
      Alert.alert('Erro', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.highlight, Colors.highlightDark]}
        style={styles.hero}
      >
        <SafeAreaView edges={['top']} style={styles.heroSafe}>
          <View style={styles.logoCircle}>
            <Ionicons name="location" size={40} color={Colors.highlight} />
          </View>
          <Text style={styles.brandTitle}>Descubra+ Cajazeiras</Text>
          <Text style={styles.brandSubtitle}>
            Explore e conecte-se com a cidade
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.tabs}>
              <Pressable
                style={[styles.tab, activeTab === 'entrar' && styles.tabActive]}
                onPress={() => setActiveTab('entrar')}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'entrar' && styles.tabLabelActive,
                  ]}
                >
                  Entrar
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.tab,
                  activeTab === 'cadastrar' && styles.tabActive,
                ]}
                onPress={() => setActiveTab('cadastrar')}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'cadastrar' && styles.tabLabelActive,
                  ]}
                >
                  Cadastrar
                </Text>
              </Pressable>
            </View>

            <View style={styles.form}>
              {isCadastrar && (
                <View style={styles.inputRow}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor={Colors.muted}
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputRow}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor={Colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor={Colors.muted}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!senhaVisible}
                />
                <TouchableOpacity onPress={() => setSenhaVisible(v => !v)}>
                  <Ionicons
                    name={senhaVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.muted}
                  />
                </TouchableOpacity>
              </View>

              {isCadastrar && (
                <View style={styles.inputRow}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Colors.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar senha"
                    placeholderTextColor={Colors.muted}
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    secureTextEntry={!senhaVisible}
                  />
                </View>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.9 },
                isCadastrar && { marginTop: Spacing.lg },
                submitting && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.primaryButtonLabel}>
                  {isCadastrar ? 'Cadastrar' : 'Entrar'}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  hero: {
    minHeight: 260,
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.xl,
  },
  heroSafe: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  brandTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 28,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  brandSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  sheetWrap: { flex: 1, marginTop: -24 },
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Shadow.md,
  },
  sheetContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: Spacing.containerPadding,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.primary },
  tabLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.surface,
  },
  form: { gap: Spacing.lg, marginBottom: Spacing.lg },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 56,
  },
  inputIcon: { marginRight: Spacing.md },
  input: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: 0,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.md,
    color: Colors.surface,
  },
});
