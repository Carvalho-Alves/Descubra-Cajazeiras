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
import { Evento, listEventos } from '../services/eventoService';
import { ApiError } from '../services/apiClient';
import { firstImage } from '../utils/resolveAssetUrl';
import { formatDateBR, labelEventoStatus } from '../utils/format';
import type { FavoritosScreenProps } from '../navigation/types';

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

export function FavoritosScreen({ navigation }: FavoritosScreenProps) {
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTERS)[number]>('Todos');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await listEventos();
      setEventos(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError ? error.message : 'Falha ao carregar eventos.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    if (activeFilter === 'Todos') return eventos;
    return eventos.filter(
      e => labelEventoStatus(e.status) === activeFilter,
    );
  }, [activeFilter, eventos]);

  const renderItem: ListRenderItem<Evento> = ({ item }) => {
    const color = statusColor(item.status);
    const image = firstImage(item.imagem);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Avaliacoes', {
            tipo: 'evento',
            referenciaId: item._id,
            titulo: item.nome,
          })
        }
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Ionicons name="calendar" size={24} color={Colors.muted} />
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardDate}>{formatDateBR(item.data)}</Text>
          <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.badgeText, { color }]}>
              {labelEventoStatus(item.status)}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>Eventos</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NovoEvento')}
        >
          <Ionicons name="add" size={24} color={Colors.text} />
        </TouchableOpacity>
      </SafeAreaView>

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
            <Text style={styles.empty}>Nenhum evento encontrado.</Text>
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
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  filters: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
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
    paddingBottom: Spacing.xxxl,
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
});
