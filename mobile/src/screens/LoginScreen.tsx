import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../components/Container';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import type { LoginScreenProps } from '../navigation/types';

export function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <Container scrollable edges={['top', 'bottom']}>
      {/* ── Logo ──────────────────────────────────────────────── */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoLine1}>Descubra+</Text>
        <Text style={styles.logoLine2}>Cajazeiras</Text>
      </View>

      {/* ── Subtítulo ─────────────────────────────────────────── */}
      <Text style={styles.subtitle}>
        Entre para explorar o melhor da cidade
      </Text>

      {/* ── Formulário ────────────────────────────────────────── */}
      <View style={styles.form}>
        {/* E-mail */}
        <TextInput
          style={styles.input}
          placeholder="Seu e-mail"
          placeholderTextColor={Colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
        />

        {/* Senha */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputInner}
            placeholder="Sua senha"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            autoComplete="password"
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setPasswordVisible(v => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Esqueci a senha */}
        <TouchableOpacity
          style={styles.forgotWrapper}
          onPress={() => { /* TODO: navegar para recuperação */ }}
        >
          <Text style={styles.forgotText}>Esqueci a senha</Text>
        </TouchableOpacity>

        {/* Botão Entrar */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.replace('Tabs')}
          accessibilityRole="button"
          accessibilityLabel="Entrar"
        >
          <Text style={styles.buttonLabel}>Entrar</Text>
        </Pressable>
      </View>

      {/* ── Rodapé ────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Não tem uma conta? </Text>
        <TouchableOpacity onPress={() => { /* TODO: navegar para cadastro */ }}>
          <Text style={styles.footerLink}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  // ── Logo ──────────────────────────────────────────────────────
  logoContainer: {
    marginTop: 80,
    marginBottom: Spacing.sm,
  },
  logoLine1: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.display,      // 32px
    color: Colors.text,              // #212529 Cinza Escuro
    lineHeight: FontSize.display * 1.2,
  },
  logoLine2: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.display,
    color: Colors.highlight,         // #FFD500 Amarelo
    lineHeight: FontSize.display * 1.2,
  },

  // ── Subtítulo ─────────────────────────────────────────────────
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,           // 16px
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,      // 48px
  },

  // ── Formulário ────────────────────────────────────────────────
  form: {
    width: '100%',
    gap: Spacing.md,                 // 12px entre campos
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,   // 8px
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,   // 16px
    paddingVertical: 14,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    height: 52,
  },

  // ── Campo senha com ícone ─────────────────────────────────────
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 52,
    paddingHorizontal: Spacing.lg,
  },
  inputInner: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: 0,             // evita diferença de altura no Android
  },
  eyeButton: {
    paddingLeft: Spacing.sm,
  },

  // ── Link esqueci a senha ──────────────────────────────────────
  forgotWrapper: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,           // 14px
    color: Colors.primary,           // #0D6EFD
  },

  // ── Botão Entrar ──────────────────────────────────────────────
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  buttonPressed: {
    backgroundColor: '#0B5ED7',     // tom mais escuro do primário para feedback
  },
  buttonLabel: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.surface,
  },

  // ── Rodapé ────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xxxl,
    paddingBottom: Spacing.xl,
  },
  footerText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
});
