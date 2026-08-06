import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { getEstatisticas } from '../services/statsService';
import { listMyServicos } from '../services/servicoService';
import { listMyEventos } from '../services/eventoService';
import { ApiError } from '../services/apiClient';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import type { DashboardScreenProps } from '../navigation/types';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type MenuItem = {
  id: string;
  label: string;
  icon: IoniconName;
  color: string;
  onPress: () => void;
};

type StatItem = {
  id: string;
  label: string;
  value: string;
  color: string;
  onPress?: () => void;
};

function StatCard({ item }: { item: StatItem }) {
  return (
    <TouchableOpacity
      style={styles.statCard}
      activeOpacity={item.onPress ? 0.75 : 1}
      onPress={item.onPress}
      disabled={!item.onPress}
    >
      <Text style={styles.statLabel}>{item.label}</Text>
      <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
    </TouchableOpacity>
  );
}

function MenuRow({
  item,
  isLast,
}: {
  item: MenuItem;
  isLast: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, !isLast && styles.menuRowBorder]}
      onPress={item.onPress}
      activeOpacity={0.65}
    >
      <Ionicons name={item.icon} size={20} color={item.color} />
      <Text style={[styles.menuLabel, { color: item.color }]}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
    </TouchableOpacity>
  );
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    servicos: 0,
    eventos: 0,
    avaliacoes: 0,
    media: 0,
  });

  const load = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const [estatisticas, meusServicos, meusEventos] = await Promise.all([
          getEstatisticas(),
          listMyServicos(token).catch(() => []),
          listMyEventos(token).catch(() => []),
        ]);

        setStats({
          servicos: Array.isArray(meusServicos)
            ? meusServicos.length
            : estatisticas.totalPontos,
          eventos: Array.isArray(meusEventos)
            ? meusEventos.length
            : estatisticas.totalEventos,
          avaliacoes: estatisticas.totalAvaliacoes,
          media: estatisticas.mediaGeral,
        });
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof ApiError
            ? error.message
            : 'Falha ao carregar o perfil.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const statItems: StatItem[] = [
    {
      id: '1',
      label: 'Meus Serviços',
      value: String(stats.servicos),
      color: Colors.primary,
      onPress: () => navigation.navigate('GerenciarServicos'),
    },
    {
      id: '2',
      label: 'Meus Eventos',
      value: String(stats.eventos),
      color: Colors.success,
      onPress: () => navigation.navigate('GerenciarEventos'),
    },
    {
      id: '3',
      label: 'Total Avaliações',
      value: String(stats.avaliacoes),
      color: Colors.warning,
      onPress: () => navigation.navigate('Avaliacoes'),
    },
    {
      id: '4',
      label: 'Média Geral',
      value: Number(stats.media || 0).toFixed(1),
      color: Colors.coral,
      onPress: () => navigation.navigate('Avaliacoes'),
    },
  ];

  const menuItems: MenuItem[] = [
    {
      id: 'info',
      label: 'Minhas Informações',
      icon: 'person-outline',
      color: Colors.text,
      onPress: () => navigation.navigate('MinhasInformacoes'),
    },
    {
      id: 'servicos',
      label: 'Meus Serviços',
      icon: 'briefcase-outline',
      color: Colors.text,
      onPress: () => navigation.navigate('GerenciarServicos'),
    },
    {
      id: 'eventos',
      label: 'Meus Eventos',
      icon: 'calendar-outline',
      color: Colors.text,
      onPress: () => navigation.navigate('GerenciarEventos'),
    },
    {
      id: 'notif',
      label: 'Notificações',
      icon: 'notifications-outline',
      color: Colors.text,
      onPress: () => navigation.navigate('Notificacoes'),
    },
    {
      id: 'sobre',
      label: 'Sobre Cajazeiras',
      icon: 'information-circle-outline',
      color: Colors.text,
      onPress: () => navigation.navigate('Sobre'),
    },
    {
      id: 'sair',
      label: 'Sair da Conta',
      icon: 'log-out-outline',
      color: Colors.error,
      onPress: () =>
        Alert.alert('Sair da conta', 'Deseja mesmo sair?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => logout(),
          },
        ]),
    },
  ];

  const foto = resolveAssetUrl(user?.foto);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
      >
        <LinearGradient
          colors={[Colors.highlight, Colors.highlightDark]}
          style={styles.hero}
        >
          <SafeAreaView edges={['top']} style={styles.heroInner}>
            <View style={styles.avatarRing}>
              {foto ? (
                <Image source={{ uri: foto }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person" size={40} color="#4B5563" />
                </View>
              )}
            </View>
            <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </SafeAreaView>
        </LinearGradient>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              {statItems.map(stat => (
                <View key={stat.id} style={styles.statCell}>
                  <StatCard item={stat} />
                </View>
              ))}
            </View>

            <View style={styles.menuCard}>
              {menuItems.map((item, index) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  isLast={index === menuItems.length - 1}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundMuted },
  scrollContent: { paddingBottom: Spacing.xxxl },
  hero: {
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.containerPadding,
  },
  heroInner: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    padding: 4,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  avatar: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  userName: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: Colors.text,
    textAlign: 'center',
  },
  userEmail: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    marginTop: -32,
    gap: Spacing.md,
    marginBottom: Spacing.containerPadding,
  },
  statCell: { width: '47.5%', flexGrow: 1 },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  statLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: 28,
  },
  menuCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    textAlign: 'left',
  },
});
