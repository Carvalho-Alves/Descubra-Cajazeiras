import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import type { DashboardScreenProps } from '../navigation/types';

// ── Tipos ───────────────────────────────────────────────────────
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type MenuItem = {
  id: string;
  label: string;
  icon: IoniconName;
  onPress: () => void;
};

type StatItem = {
  id: string;
  label: string;
  value: number;
  icon: IoniconName;
};

// ── Dados estáticos ─────────────────────────────────────────────
const STATS: StatItem[] = [
  { id: '1', label: 'Eventos salvos', value: 12, icon: 'heart' },
  { id: '2', label: 'Avaliações',     value: 5,  icon: 'star'  },
];

// ── Subcomponentes ──────────────────────────────────────────────
function StatCard({ item }: { item: StatItem }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={item.icon} size={22} color={Colors.highlight} />
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={item.onPress}
      activeOpacity={0.65}
    >
      <View style={styles.menuIconWrapper}>
        <Ionicons name={item.icon} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

// ── Tela principal ──────────────────────────────────────────────
export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const menuItems: MenuItem[] = [
    {
      id: 'edit',
      label: 'Editar Dados',
      icon: 'pencil-outline',
      onPress: () => Alert.alert('Em breve', 'Edição de perfil em desenvolvimento.'),
    },
    {
      id: 'servicos',
      label: 'Meus Serviços Turísticos',
      icon: 'storefront-outline',
      onPress: () => navigation.navigate('GerenciarServicos'),
    },
    {
      id: 'eventos',
      label: 'Meus Eventos',
      icon: 'calendar-outline',
      onPress: () => navigation.navigate('GerenciarEventos'),
    },
    {
      id: 'config',
      label: 'Configurações',
      icon: 'settings-outline',
      onPress: () => Alert.alert('Em breve', 'Configurações em desenvolvimento.'),
    },
    {
      id: 'sobre',
      label: 'Sobre o Projeto',
      icon: 'information-circle-outline',
      onPress: () => navigation.navigate('Sobre'),
    },
  ];

  const handleLogout = () =>
    Alert.alert('Sair da conta', 'Deseja mesmo sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => navigation.replace('Login') },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Cabeçalho ─────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
            accessibilityLabel="Voltar para Início"
          >
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Meu Perfil</Text>

          {/* Spacer simétrico para centralizar o título */}
          <View style={styles.backButton} />
        </View>

        {/* ── Informações do usuário ────────────────────────── */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.userName}>João da Silva</Text>
          <Text style={styles.userEmail}>joao.silva@email.com</Text>
        </View>

        {/* ── Estatísticas ──────────────────────────────────── */}
        <View style={styles.statsRow}>
          {STATS.map(stat => (
            <StatCard key={stat.id} item={stat} />
          ))}
        </View>

        {/* ── Menu ─────────────────────────────────────────── */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={item.id}>
              <MenuRow item={item} />
              {index < menuItems.length - 1 && (
                <View style={styles.menuDivider} />
              )}
            </View>
          ))}
        </View>

        {/* ── Botão Logout ──────────────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Cabeçalho ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,           // 18px
    color: Colors.text,
  },

  // ── Card de usuário ─────────────────────────────────────────
  userCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.containerPadding,
    marginHorizontal: Spacing.containerPadding,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,                // círculo perfeito
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  userName: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,           // 20px
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,           // 14px
    color: Colors.textSecondary,
  },

  // ── Estatísticas ────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerPadding,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    ...Shadow.sm,
  },
  statValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxl,          // 24px
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,           // 12px
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },

  // ── Menu ────────────────────────────────────────────────────
  menuCard: {
    marginHorizontal: Spacing.containerPadding,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  menuIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,           // 16px
    color: Colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg + 32 + Spacing.md, // alinha com o texto
  },

  // ── Botão Logout ────────────────────────────────────────────
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.containerPadding,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.error,       // vermelho #DC3545
    gap: Spacing.sm,
  },
  logoutText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.error,
  },
});
