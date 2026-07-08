import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import type { SobreScreenProps } from '../navigation/types';

// ── Dados estáticos ──────────────────────────────────────────────
const VERSAO = '1.0.0';

const MISSAO =
  'O Descubra+ Cajazeiras nasce para conectar moradores e visitantes ao rico ' +
  'patrimônio cultural, gastronômico e turístico da nossa cidade. Nossa missão ' +
  'é fomentar o turismo local de forma sustentável, valorizando empreendedores ' +
  'e fortalecendo a identidade cajazeirense.';

const EQUIPE = [
  { id: '1', funcao: 'Desenvolvimento', nome: 'Equipe PW1 — IFPB Cajazeiras' },
  { id: '2', funcao: 'Design & UX',     nome: 'UI/UX Design Team' },
  { id: '3', funcao: 'Backend / API',   nome: 'API REST Team' },
  { id: '4', funcao: 'Orientação',      nome: 'Prof. Disciplina de PW' },
];

type SocialLink = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  url: string;
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'instagram',
    icon: 'logo-instagram',
    label: 'Instagram',
    color: '#E1306C',
    url: 'https://instagram.com',
  },
  {
    id: 'whatsapp',
    icon: 'logo-whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    url: 'https://wa.me',
  },
  {
    id: 'web',
    icon: 'globe-outline',
    label: 'Website',
    color: Colors.primary,
    url: 'https://cajazeiras.pb.gov.br',
  },
];

// ── Subcomponente: Card de seção ─────────────────────────────────
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ── Tela principal ───────────────────────────────────────────────
export function SobreScreen({ navigation }: SobreScreenProps) {
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const openLink = (url: string, label: string) =>
    Linking.canOpenURL(url)
      .then(can => {
        if (can) Linking.openURL(url);
        else Alert.alert(label, 'Não foi possível abrir o link.');
      })
      .catch(() => Alert.alert(label, 'Erro ao abrir o link.'));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

      {/* ── Cabeçalho ──────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerSide}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Logo ─────────────────────────────────────────────── */}
        <View style={styles.logoBlock}>
          <Text style={styles.logoLine1}>Descubra+</Text>
          <Text style={styles.logoLine2}>Cajazeiras</Text>
          <View style={styles.versaoBadge}>
            <Text style={styles.versaoText}>Versão {VERSAO}</Text>
          </View>
        </View>

        {/* ── Missão ───────────────────────────────────────────── */}
        <SectionCard title="Nosso Propósito">
          <Text style={styles.paragraph}>{MISSAO}</Text>
        </SectionCard>

        {/* ── Equipe / Créditos ─────────────────────────────────── */}
        <SectionCard title="Equipe & Créditos">
          {EQUIPE.map((membro, index) => (
            <View key={membro.id}>
              <View style={styles.membroRow}>
                <Text style={styles.membroFuncao}>{membro.funcao}</Text>
                <Text style={styles.membroNome}>{membro.nome}</Text>
              </View>
              {index < EQUIPE.length - 1 && (
                <View style={styles.rowDivider} />
              )}
            </View>
          ))}
        </SectionCard>

        {/* ── Redes sociais ─────────────────────────────────────── */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Nos siga nas redes</Text>
          <View style={styles.socialRow}>
            {SOCIAL_LINKS.map(link => (
              <TouchableOpacity
                key={link.id}
                style={[styles.socialButton, { backgroundColor: link.color }]}
                onPress={() => openLink(link.url, link.label)}
                activeOpacity={0.8}
                accessibilityLabel={link.label}
              >
                <Ionicons name={link.icon} size={24} color={Colors.surface} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Termos de uso ─────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.termosButton}
          onPress={() =>
            Alert.alert(
              'Termos de Uso e Privacidade',
              'Os termos completos estarão disponíveis em breve.',
            )
          }
        >
          <Text style={styles.termosText}>Termos de Uso e Privacidade</Text>
        </TouchableOpacity>

        {/* Crédito de rodapé */}
        <Text style={styles.rodape}>
          © {new Date().getFullYear()} Descubra+ Cajazeiras{'\n'}Feito com ♥ no Sertão paraibano
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,  // #F0F8FF
  },
  scrollContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.huge,
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

  // ── Logo ──────────────────────────────────────────────────────
  logoBlock: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  logoLine1: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxl,          // 24px — menor que o do login (32px)
    color: Colors.text,              // #212529 Cinza Escuro
    lineHeight: FontSize.xxl * 1.2,
  },
  logoLine2: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.highlight,         // #FFD500 Amarelo
    lineHeight: FontSize.xxl * 1.2,
  },
  versaoBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
  },
  versaoText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,           // 12px
    color: Colors.text,              // Cinza Escuro
  },

  // ── Cards de seção ────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  cardTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,           // 18px
    color: Colors.text,              // #212529 Cinza Escuro
    marginBottom: Spacing.md,
  },

  // ── Missão ────────────────────────────────────────────────────
  paragraph: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,           // 16px
    color: Colors.textSecondary,
    lineHeight: FontSize.md * 1.65,
  },

  // ── Equipe ────────────────────────────────────────────────────
  membroRow: {
    paddingVertical: Spacing.sm,
  },
  membroFuncao: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,           // 12px
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  membroNome: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // ── Redes Sociais ────────────────────────────────────────────
  socialSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  socialTitle: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },

  // ── Termos ────────────────────────────────────────────────────
  termosButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  termosText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },

  // ── Rodapé ────────────────────────────────────────────────────
  rodape: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.xs * 1.8,
  },
});
