import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { listServicos, Servico } from '../services/servicoService';
import { ApiError } from '../services/apiClient';
import {
  colorForTipo,
  iconForTipo,
  mapTipoFilterToApi,
  shortTipoServico,
} from '../utils/format';
import type { HomeScreenProps } from '../navigation/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_URI =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1080&q=80';
const CATEGORIES = ['Todos', 'Hospedagem', 'Alimentação', 'Turístico'];

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await listServicos();
      setServicos(Array.isArray(data) ? data : []);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Falha ao carregar serviços da API.';
      Alert.alert('Erro', message);
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

  const filtered = servicos.filter(item => {
    const apiTipo = mapTipoFilterToApi(activeCategory);
    const matchCat = !apiTipo || item.tipo_servico === apiTipo;
    const matchSearch =
      !search.trim() ||
      item.nome.toLowerCase().includes(search.trim().toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: MAP_URI }} style={styles.map} resizeMode="cover">
        <View style={styles.mapOverlay} />
      </ImageBackground>

      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar pontos em Cajazeiras..."
              placeholderTextColor={Colors.muted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => load(true)}>
            <Ionicons name="refresh" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.fabs} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fabYellow}
          onPress={() => navigation.navigate('NovoServico')}
        >
          <Ionicons name="add" size={28} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {CATEGORIES.map(category => {
            const active = activeCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveCategory(category)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={Colors.primary} />
        ) : (
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
            }
          >
            {filtered.length === 0 ? (
              <Text style={styles.empty}>Nenhum serviço encontrado.</Text>
            ) : (
              filtered.map(location => (
                <TouchableOpacity
                  key={location._id}
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate('Avaliacoes', {
                      tipo: 'servico',
                      referenciaId: location._id,
                      titulo: location.nome,
                    })
                  }
                >
                  <View
                    style={[
                      styles.cardIcon,
                      { backgroundColor: colorForTipo(location.tipo_servico) },
                    ]}
                  >
                    <Ionicons
                      name={iconForTipo(location.tipo_servico)}
                      size={22}
                      color={Colors.surface}
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{location.nome}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {shortTipoServico(location.tipo_servico)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E5E7EB' },
  map: { ...StyleSheet.absoluteFillObject },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 48,
    ...Shadow.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.text,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  fabs: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: SCREEN_HEIGHT * 0.34,
    zIndex: 15,
  },
  fabYellow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.3,
    minHeight: 250,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 20,
    ...Shadow.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  chips: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  chipActive: { backgroundColor: Colors.highlight },
  chipText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  chipTextActive: { fontFamily: FontFamily.headingSemiBold },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontFamily: FontFamily.bodyRegular,
    marginTop: Spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  cardIcon: {
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.text,
  },
});
