import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ListRenderItem,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { listEventos, Evento } from '../services/eventoService';
import { ApiError } from '../services/apiClient';
import { formatDateBR, labelEventoStatus } from '../utils/format';
import type { EventosTabScreenProps } from '../navigation/types';

const FILTERS = ['Todos', 'Ativo', 'Cancelado', 'Encerrado'] as const;

function statusColor(status?: string) {
  switch ((status || 'ativo').toLowerCase()) {
    case 'ativo':
      return Colors.success;
    case 'cancelado':
      return Colors.error;
    case 'encerrado':
      return Colors.textSecondary;
    default:
      return Colors.textSecondary;
  }
}

export function EventosTabScreen({ navigation }: EventosTabScreenProps) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('Todos');

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

  const filtered = eventos.filter((evento) => {
    if (activeFilter === 'Todos') return true;
    return labelEventoStatus(evento.status) === activeFilter;
  });

  const handleEventoPress = (evento: Evento) => {
    setSelectedEvento(evento);
    setModalVisible(true);
  };

  const handleNavigate = (screen: 'Detalhes' | 'Avaliacoes') => {
    setModalVisible(false);
    if (!selectedEvento) return;

    if (screen === 'Detalhes') {
      navigation.navigate('GerenciarEventosDetail', {
        eventoId: selectedEvento._id,
      });
    } else {
      navigation.navigate('Avaliacoes', {
        tipo: 'evento',
        referenciaId: selectedEvento._id,
        titulo: selectedEvento.nome,
      });
    }
  };

  const renderItem: ListRenderItem<Evento> = ({ item }) => {
    const color = statusColor(item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleEventoPress(item)}
      >
        <View style={[styles.iconCircle, { backgroundColor: Colors.highlight }]}>
          <Ionicons name="calendar" size={24} color={Colors.surface} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardDate}>{formatDateBR(item.data)}</Text>
          <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.badgeText, { color }]}>
              {labelEventoStatus(item.status)}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eventos</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NovoEvento')}
        >
          <Ionicons name="add" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        {FILTERS.map(filter => {
          const active = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                active && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  active && styles.filterButtonTextActive,
                ]}
                numberOfLines={1}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
            <Text style={styles.empty}>Nenhum evento cadastrado ainda.</Text>
          }
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedEvento?.nome}</Text>
            <Text style={styles.modalSubtitle}>O que você deseja acessar?</Text>

            <TouchableOpacity style={styles.modalOption} onPress={() => handleNavigate('Detalhes')}>
              <Ionicons name="map-outline" size={24} color={Colors.primary} />
              <Text style={styles.modalOptionText}>Ver Detalhes e Rota</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={() => handleNavigate('Avaliacoes')}>
              <Ionicons name="star-outline" size={24} color={Colors.primary} />
              <Text style={styles.modalOptionText}>Ver Avaliações</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.lg,
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
    backgroundColor: Colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  filterButton: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.highlight,
    borderColor: Colors.highlight,
  },
  filterButtonText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.text,
  },
  filterButtonTextActive: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 11,
    color: Colors.text,
  },
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
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: 4,
  },
  cardDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '80%',
    ...Shadow.lg,
  },
  modalTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F9FAFB',
    marginBottom: Spacing.md,
  },
  modalOptionText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  modalCancel: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
