import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { loginSchema, registerSchema } from '../hooks/useFormValidation';
import type { LoginScreenProps } from '../navigation/types';

type AuthTab = 'entrar' | 'cadastrar';

type LoginForm = {
  email: string;
  senha: string;
};

type RegisterForm = {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
};

export function LoginScreen(_props: LoginScreenProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>('entrar');
  const [senhaVisible, setSenhaVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCadastrar = activeTab === 'cadastrar';

  const loginForm = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '' },
  });

  useEffect(() => {
    loginForm.clearErrors();
    registerForm.clearErrors();
  }, [activeTab, loginForm, registerForm]);

  const onSubmitLogin = loginForm.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.senha);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError
          ? error.message
          : 'Não foi possível autenticar. Verifique a API e tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  });

  const onSubmitRegister = registerForm.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await register({
        nome: values.nome,
        email: values.email,
        senha: values.senha,
      });
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError
          ? error.message
          : 'Não foi possível cadastrar. Verifique a API e tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  });

  const handleSubmit = isCadastrar ? onSubmitRegister : onSubmitLogin;
  const loginErrors = loginForm.formState.errors;
  const registerErrors = registerForm.formState.errors;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.highlight, Colors.highlightDark]}
        style={styles.hero}
      >
        <SafeAreaView edges={['top']} style={styles.heroSafe}>
          <Image
            source={require('../../assets/logotipo.png')}
            style={styles.logoImage}
          />
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
              {isCadastrar ? (
                <>
                  <View style={styles.inputRow}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={Colors.muted}
                      style={styles.inputIcon}
                    />
                    <Controller
                      control={registerForm.control}
                      name="nome"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="Nome completo"
                          placeholderTextColor={Colors.muted}
                          value={value}
                          onChangeText={onChange}
                          autoCapitalize="words"
                        />
                      )}
                    />
                  </View>
                  {registerErrors.nome ? (
                    <Text style={styles.fieldError}>{registerErrors.nome.message}</Text>
                  ) : null}

                  <View style={styles.inputRow}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={Colors.muted}
                      style={styles.inputIcon}
                    />
                    <Controller
                      control={registerForm.control}
                      name="email"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="E-mail"
                          placeholderTextColor={Colors.muted}
                          value={value}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                        />
                      )}
                    />
                  </View>
                  {registerErrors.email ? (
                    <Text style={styles.fieldError}>{registerErrors.email.message}</Text>
                  ) : null}

                  <View style={styles.inputRow}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={Colors.muted}
                      style={styles.inputIcon}
                    />
                    <Controller
                      control={registerForm.control}
                      name="senha"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="Senha"
                          placeholderTextColor={Colors.muted}
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!senhaVisible}
                        />
                      )}
                    />
                    <TouchableOpacity onPress={() => setSenhaVisible(v => !v)}>
                      <Ionicons
                        name={senhaVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={Colors.muted}
                      />
                    </TouchableOpacity>
                  </View>
                  {registerErrors.senha ? (
                    <Text style={styles.fieldError}>{registerErrors.senha.message}</Text>
                  ) : null}

                  <View style={styles.inputRow}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={Colors.muted}
                      style={styles.inputIcon}
                    />
                    <Controller
                      control={registerForm.control}
                      name="confirmarSenha"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="Confirmar senha"
                          placeholderTextColor={Colors.muted}
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!senhaVisible}
                        />
                      )}
                    />
                  </View>
                  {registerErrors.confirmarSenha ? (
                    <Text style={styles.fieldError}>
                      {registerErrors.confirmarSenha.message}
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <View style={styles.inputRow}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={Colors.muted}
                      style={styles.inputIcon}
                    />
                    <Controller
                      control={loginForm.control}
                      name="email"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="E-mail"
                          placeholderTextColor={Colors.muted}
                          value={value}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                        />
                      )}
                    />
                  </View>
                  {loginErrors.email ? (
                    <Text style={styles.fieldError}>{loginErrors.email.message}</Text>
                  ) : null}

                  <View style={styles.inputRow}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={Colors.muted}
                      style={styles.inputIcon}
                    />
                    <Controller
                      control={loginForm.control}
                      name="senha"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="Senha"
                          placeholderTextColor={Colors.muted}
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!senhaVisible}
                        />
                      )}
                    />
                    <TouchableOpacity onPress={() => setSenhaVisible(v => !v)}>
                      <Ionicons
                        name={senhaVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={Colors.muted}
                      />
                    </TouchableOpacity>
                  </View>
                  {loginErrors.senha ? (
                    <Text style={styles.fieldError}>{loginErrors.senha.message}</Text>
                  ) : null}
                </>
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
    minHeight: 320,
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.md,
  },
  heroSafe: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
  },
  logoImage: {
    width: 220,
    height: 160,
    resizeMode: 'contain',
    marginBottom: Spacing.md,
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
  form: { gap: Spacing.sm, marginBottom: Spacing.lg },
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
  fieldError: {
    color: '#DC3545',
    fontSize: 12,
    fontFamily: FontFamily.bodyRegular,
    marginLeft: Spacing.lg,
    marginBottom: Spacing.sm,
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
