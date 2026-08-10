import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import {
  deleteEventoRequest,
  Evento,
  listMyEventos,
} from '../services/eventoService';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { firstImage } from '../utils/resolveAssetUrl';
import { formatDateBR, labelEventoStatus } from '../utils/format';
import type { GerenciarEventosScreenProps } from '../navigation/types';

const FILTERS = ['Todos', 'Ativo', 'Cancelado', 'Encerrado'] as const;

function statusColor(status?: string) {
  switch ((status || 'ativo').toLowerCase()) {
    case 'ativo':
      return Colors.success;
    case 'cancelado':
      return Colors.error;
    default:
      return Colors.textSecondary;
  }
}

export function GerenciarEventosScreen({
  navigation,
}: GerenciarEventosScreenProps) {
  const { token } = useAuth();
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTERS)[number]>('Todos');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        const data = await listMyEventos(token);
        setEventos(Array.isArray(data) ? data : []);
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof ApiError
            ? error.message
            : 'Falha ao carregar seus eventos.',
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

  const filtered = useMemo(() => {
    if (activeFilter === 'Todos') return eventos;
    return eventos.filter(e => labelEventoStatus(e.status) === activeFilter);
  }, [activeFilter, eventos]);

  const metrics = useMemo(() => {
    const ativos = eventos.filter(
      e => (e.status || 'ativo').toLowerCase() === 'ativo',
    ).length;
    const encerrados = eventos.filter(
      e => (e.status || '').toLowerCase() === 'encerrado',
    ).length;
    return {
      total: eventos.length,
      ativos,
      encerrados,
    };
  }, [eventos]);

  const handleDelete = (item: Evento) => {
    Alert.alert('Excluir evento', `Remover "${item.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEventoRequest(item._id, token);
            await load(true);
          } catch (error) {
            Alert.alert(
              'Erro',
              error instanceof ApiError
                ? error.message
                : 'Não foi possível excluir.',
            );
          }
        },
      },
    ]);
  };

  const renderItem: ListRenderItem<Evento> = ({ item }) => {
    const color = statusColor(item.status);
    const image = firstImage(item.imagem);
    return (
      <View style={styles.card}>
        {image ? (
          <Image source={{ uri: image }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Ionicons name="calendar" size={24} color={Colors.muted} />
          </View>
        )}
        <TouchableOpacity
          style={styles.cardBody}
          onPress={() =>
            navigation.navigate('Avaliacoes', {
              tipo: 'evento',
              referenciaId: item._id,
              titulo: item.nome,
            })
          }
        >
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardDate}>{formatDateBR(item.data)}</Text>
          <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.badgeText, { color }]}>
              {labelEventoStatus(item.status)}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Eventos</Text>
        <View style={styles.headerBtn} />
      </SafeAreaView>

      <View style={styles.metrics}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total</Text>
          <Text style={styles.metricValue}>{metrics.total}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Ativos</Text>
          <Text style={[styles.metricValue, { color: Colors.success }]}>
            {metrics.ativos}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Encerrados</Text>
          <Text style={[styles.metricValue, { color: Colors.textSecondary }]}>
            {metrics.encerrados}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map(filter => {
          const active = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
            <Text style={styles.empty}>Você ainda não cadastrou eventos.</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NovoEvento')}
      >
        <Ionicons name="add" size={28} color={Colors.text} />
      </TouchableOpacity>
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
  metrics: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  metricLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  filters: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    minHeight: 36,
  },
  chipActive: { backgroundColor: Colors.highlight },
  chipIdle: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  chipTextActive: { fontFamily: FontFamily.headingSemiBold },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
    gap: Spacing.md,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.textSecondary,
    fontFamily: FontFamily.bodyRegular,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  thumb: { width: 64, height: 64, borderRadius: BorderRadius.md },
  thumbFallback: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
  },
  cardDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.xs,
  },
  moreBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.containerPadding,
    bottom: Spacing.containerPadding,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
});
