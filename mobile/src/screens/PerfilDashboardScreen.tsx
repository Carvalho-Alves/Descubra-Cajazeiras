import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { listMyServicos } from '../services/servicoService';
import { listMyEventos } from '../services/eventoService';
import { listAvaliacoes } from '../services/avaliacaoService';
import type { PerfilDashboardScreenProps } from '../navigation/types';

interface UserStats {
  avaliacoesFez: number;
  favoritos: number;
  visitas: number;
  contribuicao: number;
  mediaNotas: number;
  tipoFavorito: string;
  distintivos: Distintivo[];
  atividades: Atividade[];
  locaisFavoritos: LocalFavorito[];
}

interface Distintivo {
  nome: string;
  icone: string;
  descricao: string;
}

interface Atividade {
  tipo: 'avaliacao' | 'favorito' | 'visita' | 'evento';
  descricao: string;
  data: Date;
}

interface LocalFavorito {
  nome: string;
  tipo: string;
  nota: number;
}

const TABS = ['Resumo', 'Atividades', 'Favoritos', 'Configurações'] as const;

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <Ionicons
          key={star}
          name={star <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={star <= Math.round(rating) ? Colors.warning : '#D1D5DB'}
        />
      ))}
    </View>
  );
}

export function PerfilDashboardScreen({
  navigation,
}: PerfilDashboardScreenProps) {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Resumo');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    avaliacoesFez: 0,
    favoritos: 0,
    visitas: 0,
    contribuicao: 0,
    mediaNotas: 0,
    tipoFavorito: 'Nenhum',
    distintivos: [],
    atividades: [],
    locaisFavoritos: [],
  });

  const loadUserStats = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [meusServicos, meusEventos, todasAvaliacoes] = await Promise.all([
        listMyServicos(token).catch(() => []),
        listMyEventos(token).catch(() => []),
        listAvaliacoes().catch(() => []),
      ]);

      const myId = user?._id || (user as { id?: string })?.id;
      const listAv = Array.isArray(todasAvaliacoes)
        ? todasAvaliacoes
        : (todasAvaliacoes as { items?: typeof todasAvaliacoes })?.items || [];

      const userReviews = myId
        ? listAv.filter((av) => {
            const authorId =
              typeof av.usuarioId === 'object' ? av.usuarioId?._id : av.usuarioId;
            return String(authorId) === String(myId);
          })
        : [];

      const totalNotas = userReviews.reduce((acc, curr) => acc + (curr.nota || 0), 0);
      const mediaNotas =
        userReviews.length > 0 ? totalNotas / userReviews.length : 0;

      setStats({
        avaliacoesFez: userReviews.length,
        favoritos: 0,
        visitas: meusEventos.length,
        contribuicao: meusServicos.length,
        mediaNotas,
        tipoFavorito: meusServicos[0]?.tipo_servico || 'Nenhum',
        distintivos: [],
        atividades: userReviews.map((av) => ({
          tipo: 'avaliacao' as const,
          descricao: `Avaliação ${av.nota}★${av.comentario ? `: ${av.comentario}` : ''}`,
          data: new Date(av.criadoEm || av.createdAt || Date.now()),
        })),
        locaisFavoritos: meusServicos.slice(0, 5).map((s) => ({
          nome: s.nome,
          tipo: s.tipo_servico,
          nota: s.avaliacao_media || 0,
        })),
      });
    } catch (error) {
      console.log('Erro ao carregar stats:', error);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useFocusEffect(
    useCallback(() => {
      loadUserStats();
    }, [loadUserStats]),
  );

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'avaliacao': return 'star';
      case 'favorito': return 'heart';
      case 'visita': return 'location';
      case 'evento': return 'calendar';
      default: return 'circle';
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('MinhasInformacoes')}
        >
          <Ionicons name="pencil-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Perfil Header */}
        <View style={styles.profileHeader}>
          {user?.foto ? (
            <Image source={{ uri: user.foto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="person" size={48} color={Colors.primary} />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.nome || 'Usuário'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user?.role === 'Admin' ? 'Administrador' : 'Turista'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : null}

        {activeTab === 'Resumo' && (
          <>
            {/* Stats Cards - Meus Serviços e Eventos */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <Text style={styles.statNumber}>{stats.contribuicao}</Text>
                <Text style={styles.statLabel}>Meus Serviços</Text>
              </View>
              <View style={[styles.statCard, { flex: 1 }]}>
                <Text style={styles.statNumber}>{stats.visitas}</Text>
                <Text style={styles.statLabel}>Meus Eventos</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'Atividades' && (
          <View style={styles.section}>
            {stats.atividades.length > 0 ? (
              stats.atividades.map((atividade, i) => (
                <View key={i} style={styles.activityItem}>
                  <View
                    style={[
                      styles.activityIcon,
                      {
                        backgroundColor:
                          atividade.tipo === 'avaliacao'
                            ? Colors.warning + '20'
                            : Colors.error + '20',
                      },
                    ]}
                  >
                    <Ionicons
                      name={getActivityIcon(atividade.tipo) as any}
                      size={18}
                      color={
                        atividade.tipo === 'avaliacao'
                          ? Colors.warning
                          : Colors.error
                      }
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityDesc}>{atividade.descricao}</Text>
                    <Text style={styles.activityDate}>
                      {atividade.data.toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhuma atividade</Text>
            )}
          </View>
        )}

        {activeTab === 'Favoritos' && (
          <View style={styles.section}>
            {stats.locaisFavoritos.length > 0 ? (
              stats.locaisFavoritos.map((local, i) => (
                <View key={i} style={styles.favoriteCard}>
                  <View style={styles.favoriteInfo}>
                    <Text style={styles.favoriteName}>{local.nome}</Text>
                    <Text style={styles.favoriteType}>{local.tipo}</Text>
                  </View>
                  <View style={styles.favoriteRating}>
                    <Stars rating={local.nota} size={12} />
                    <Text style={styles.favoriteNote}>{local.nota}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Você ainda não tem favoritos</Text>
            )}
          </View>
        )}

        {activeTab === 'Configurações' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.configItem}
              onPress={() => navigation.navigate('MinhasInformacoes')}
            >
              <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
              <Text style={styles.configItemText}>Alterar Senha</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configItem}
              onPress={() => navigation.navigate('Notificacoes')}
            >
              <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
              <Text style={styles.configItemText}>Notificações</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configItem}
              onPress={() => navigation.navigate('Sobre')}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
              <Text style={styles.configItemText}>Sobre o App</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.configItem, styles.logoutItem]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={[styles.configItemText, { color: Colors.error }]}>
                Sair da Conta
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.highlight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  profileHeader: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarFallback: { backgroundColor: Colors.surface, ...Shadow.sm },
  profileInfo: { flex: 1 },
  profileName: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  roleBadgeText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xs },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statNumber: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  distintivosGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  distinctiveCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  distinctiveIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  distinctiveName: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  distinctiveDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statisticsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  statisticsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statisticsLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  statisticsValue: { alignItems: 'flex-end', gap: Spacing.xs },
  statisticsNumber: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.primary,
  },
  starsContainer: { flexDirection: 'row', gap: 2 },
  typeBadge: {
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  typeBadgeText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: Colors.success,
  },
  activityItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: { flex: 1, justifyContent: 'center' },
  activityDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  activityDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  favoriteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  favoriteInfo: { flex: 1 },
  favoriteName: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  favoriteType: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  favoriteRating: { alignItems: 'flex-end', gap: Spacing.xs },
  favoriteNote: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoutItem: { marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  configItemText: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  loadingBox: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
