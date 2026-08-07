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
  deleteServicoRequest,
  listMyServicos,
  Servico,
} from '../services/servicoService';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { firstImage } from '../utils/resolveAssetUrl';
import { mapTipoFilterToApi, shortTipoServico } from '../utils/format';
import type { GerenciarServicosScreenProps } from '../navigation/types';

const FILTERS = ['Todos', 'Hospedagem', 'Alimentação', 'Turístico'] as const;

export function GerenciarServicosScreen({
  navigation,
}: GerenciarServicosScreenProps) {
  const { token } = useAuth();
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTERS)[number]>('Todos');
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        const data = await listMyServicos(token);
        setServicos(Array.isArray(data) ? data : []);
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof ApiError
            ? error.message
            : 'Falha ao carregar seus serviços.',
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
    const apiTipo = mapTipoFilterToApi(activeFilter);
    if (!apiTipo) return servicos;
    return servicos.filter(s => s.tipo_servico === apiTipo);
  }, [activeFilter, servicos]);

  const handleDelete = (item: Servico) => {
    Alert.alert('Excluir serviço', `Remover "${item.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteServicoRequest(item._id, token);
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

  const renderItem: ListRenderItem<Servico> = ({ item }) => {
    const image = firstImage(item.imagem);
    return (
      <View style={styles.card}>
        {image ? (
          <Image source={{ uri: image }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Ionicons name="storefront" size={24} color={Colors.muted} />
          </View>
        )}
        <TouchableOpacity
          style={styles.cardBody}
          onPress={() =>
            navigation.navigate('Avaliacoes', {
              tipo: 'servico',
              referenciaId: item._id,
              titulo: item.nome,
            })
          }
        >
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {shortTipoServico(item.tipo_servico)}
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
        <Text style={styles.headerTitle}>Meus Serviços</Text>
        <View style={styles.headerBtn} />
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
            <Text style={styles.empty}>Você ainda não cadastrou serviços.</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NovoServico')}
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
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD50033',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.xs,
    color: Colors.text,
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
