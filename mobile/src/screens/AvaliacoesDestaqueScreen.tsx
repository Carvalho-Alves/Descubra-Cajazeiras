import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ListRenderItem,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { Avaliacao, listAvaliacoes } from '../services/avaliacaoService';
import { ApiError } from '../services/apiClient';
import { formatRelativeDate } from '../utils/format';
import type { AvaliacoesDestaqueScreenProps } from '../navigation/types';

const TABS = ['Todas', 'Serviços', 'Eventos'] as const;

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color={star <= rating ? Colors.warning : '#D1D5DB'}
        />
      ))}
    </View>
  );
}

function userName(item: Avaliacao): string {
  if (item.usuarioId && typeof item.usuarioId === 'object') {
    return item.usuarioId.nome || 'Usuário';
  }
  return 'Usuário';
}

export function AvaliacoesDestaqueScreen({
  navigation,
}: AvaliacoesDestaqueScreenProps) {
  const { token } = useAuth();
  const [items, setItems] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Todas');

  const load = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const res = await listAvaliacoes();
        setItems(Array.isArray(res) ? res : []);
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof ApiError
            ? error.message
            : 'Falha ao carregar avaliações.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const filtered = useMemo(() => {
    let result = items;

    // Filtro por aba
    if (activeTab === 'Serviços') {
      result = result.filter(a => a.tipo === 'servico');
    } else if (activeTab === 'Eventos') {
      result = result.filter(a => a.tipo === 'evento');
    }

    // Filtro por busca
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter(
        a =>
          userName(a).toLowerCase().includes(search) ||
          a.comentario?.toLowerCase().includes(search),
      );
    }

    return result;
  }, [items, activeTab, searchText]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = items.length;
    const servicos = items.filter(a => a.tipo === 'servico').length;
    const eventos = items.filter(a => a.tipo === 'evento').length;
    const media =
      total > 0 ? (items.reduce((acc, a) => acc + (a.nota || 0), 0) / total).toFixed(1) : 0;

    return { total, servicos, eventos, media };
  }, [items]);

  const renderItem: ListRenderItem<Avaliacao> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName(item)
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userName(item)}</Text>
            <Text style={styles.date}>{formatRelativeDate(item.createdAt)}</Text>
          </View>
        </View>
        <Stars rating={item.nota || 0} size={16} />
      </View>

      {item.comentario && (
        <Text style={styles.comment} numberOfLines={3}>
          {item.comentario}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.likeBtn}>
          <Ionicons name="thumbs-up-outline" size={14} color={Colors.primary} />
          <Text style={styles.likeBtnText}>Útil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avaliações</Text>
        <View style={styles.headerBtn} />
      </SafeAreaView>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Média Geral</Text>
          <Text style={styles.statValue}>{stats.media}</Text>
          <Stars rating={Math.round(parseFloat(stats.media as string))} size={12} />
        </View>
        <View style={styles.statCard}>
          <Ionicons name="storefront" size={18} color={Colors.primary} />
          <Text style={styles.statLabel}>Serviços</Text>
          <Text style={styles.statValue}>{stats.servicos}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={18} color={Colors.primary} />
          <Text style={styles.statLabel}>Eventos</Text>
          <Text style={styles.statValue}>{stats.eventos}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar avaliações..."
          placeholderTextColor={Colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
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

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma avaliação encontrada</Text>
            </View>
          }
        />
      )}
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
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  statLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  statValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.primary,
  },
  searchContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.primary,
  },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  userInfo: { flexDirection: 'row', gap: Spacing.sm, flex: 1 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.xs,
    color: 'white',
  },
  userDetails: { flex: 1, justifyContent: 'center' },
  userName: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  date: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  comment: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.full,
  },
  likeBtnText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
