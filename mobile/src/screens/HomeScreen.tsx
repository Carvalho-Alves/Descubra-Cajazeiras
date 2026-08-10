import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  UIManager,
  LayoutAnimation,
  Modal,
  Pressable,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

// MapView só funciona em mobile, comentado para web
// import MapView, { Marker } from 'react-native-maps';
const MapView = null; // Placeholder para web
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import {
  colorForTipo,
  iconForTipo,
  mapTipoFilterToApi,
  shortTipoServico,
} from '../utils/format';

const BASE_URL = 'http://10.220.0.89:3333';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CATEGORIES = ['Todos', 'Eventos', 'Hospedagem', 'Alimentação', 'Turístico'];

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type UnifiedItem = {
  _id: string;
  nome: string;
  tipo_servico: string;
  localizacao?: { latitude: number; longitude: number };
  data?: string;
};

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const headers = { Authorization: `Bearer ${token}` };

      const [resServicos, resEventos] = await Promise.all([
        fetch(`${BASE_URL}/api/servicos`, { headers }),
        fetch(`${BASE_URL}/api/eventos`, { headers })
      ]);

      const servicosData = await resServicos.json();
      const eventosData = await resEventos.json();

      let combined: UnifiedItem[] = [];

      if (Array.isArray(servicosData)) {
        combined = combined.concat(servicosData);
      }

      if (Array.isArray(eventosData)) {
        const eventosFormatados = eventosData.map((e: any) => ({
          ...e,
          nome: e.nome || e.titulo,
          tipo_servico: 'Eventos',
        }));
        combined = combined.concat(eventosFormatados);
      }

      const now = new Date().getTime();

      combined.sort((a, b) => {
        const isAEvent = a.tipo_servico === 'Eventos';
        const isBEvent = b.tipo_servico === 'Eventos';

        if (isAEvent && isBEvent) {
          const dateA = new Date(a.data || 0).getTime();
          const dateB = new Date(b.data || 0).getTime();
          const diffA = dateA >= now ? dateA - now : Infinity;
          const diffB = dateB >= now ? dateB - now : Infinity;

          if (diffA !== Infinity || diffB !== Infinity) {
            return diffA - diffB;
          }
          return dateB - dateA;
        }

        if (isAEvent && !isBEvent) return -1;
        if (!isAEvent && isBEvent) return 1;

        return a.nome.localeCompare(b.nome);
      });

      setItems(combined);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar dados da API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    async function getLocationPermission() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão negada para localização!');
        return;
      }
      let coordonate = await Location.getCurrentPositionAsync({});
      setLocation(coordonate);
    }
    getLocationPermission();
  }, []);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleItemPress = (item: UnifiedItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleNavigate = (screen: 'Detalhes' | 'Avaliacoes') => {
    setModalVisible(false);
    if (!selectedItem) return;

    if (screen === 'Detalhes') {
      navigation.navigate('Detalhes', { item: selectedItem });
    } else {
      navigation.navigate('Avaliacoes', {
        tipo: selectedItem.tipo_servico === 'Eventos' ? 'evento' : 'servico',
        referenciaId: selectedItem._id,
        titulo: selectedItem.nome,
      });
    }
  };

  const filtered = items.filter((item) => {
    let matchCat = false;
    if (activeCategory === 'Todos') {
      matchCat = true;
    } else if (activeCategory === 'Eventos') {
      matchCat = item.tipo_servico === 'Eventos';
    } else {
      const apiTipo = mapTipoFilterToApi(activeCategory);
      matchCat = !apiTipo || item.tipo_servico === apiTipo;
    }

    const matchSearch =
      !search.trim() ||
      item.nome.toLowerCase().includes(search.trim().toLowerCase());

    return matchCat && matchSearch;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} · ${hours}h${minutes}`;
  };

  return (
    <View style={styles.root}>
      <View style={styles.mapContainer}>
        {location ? (
          // MapView só funciona em mobile - comentado para web
          MapView ? (
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.009,
                longitudeDelta: 0.009,
              }}
              showsPointsOfInterest={false}
            >
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Você está aqui!"
              />
              {filtered.map((item) => (
                <Marker
                  key={item._id}
                  coordinate={{
                    latitude: item.localizacao?.latitude || 0,
                    longitude: item.localizacao?.longitude || 0,
                  }}
                  title={item.nome}
                  description={item.tipo_servico}
                />
              ))}
            </MapView>
          ) : (
            <View style={[styles.centeredMapState, { backgroundColor: '#f0f0f0' }]}>
              <Text style={styles.errorText}>Mapa disponível apenas em mobile</Text>
            </View>
          )
        ) : errorMsg ? (
          <View style={styles.centeredMapState}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
          <View style={styles.centeredMapState}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
        <View style={styles.mapOverlay} />
      </View>

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

      <View style={[styles.sheet, { height: isExpanded ? '65%' : SCREEN_HEIGHT * 0.35 }]}>
        <TouchableOpacity
          style={styles.dragArea}
          activeOpacity={0.7}
          onPress={toggleExpand}
        >
          <View style={styles.handle} />
        </TouchableOpacity>

        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {CATEGORIES.map((category) => {
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
        </View>

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
              <Text style={styles.empty}>Nenhum registro encontrado.</Text>
            ) : (
              filtered.map((locationItem) => (
                <TouchableOpacity
                  key={locationItem._id}
                  style={styles.card}
                  onPress={() => handleItemPress(locationItem)}
                >
                  <View
                    style={[
                      styles.cardIcon,
                      { backgroundColor: locationItem.tipo_servico === 'Eventos' ? Colors.highlight : colorForTipo(locationItem.tipo_servico) },
                    ]}
                  >
                    <Ionicons
                      name={locationItem.tipo_servico === 'Eventos' ? 'calendar' : iconForTipo(locationItem.tipo_servico)}
                      size={22}
                      color={Colors.surface}
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{locationItem.nome}</Text>
                    {locationItem.tipo_servico === 'Eventos' && locationItem.data ? (
                      <Text style={styles.cardDate}>{formatDate(locationItem.data)}</Text>
                    ) : null}
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {locationItem.tipo_servico === 'Eventos' ? 'Evento' : shortTipoServico(locationItem.tipo_servico)}
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

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedItem?.nome}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E5E7EB' },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.border,
  },
  centeredMapState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FontFamily.bodyMedium,
    color: '#DC3545',
    textAlign: 'center',
    padding: 20,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
    pointerEvents: 'none',
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
    bottom: SCREEN_HEIGHT * 0.38,
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
    minHeight: 250,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 20,
    ...Shadow.lg,
  },
  dragArea: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  chips: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
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
  cardDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.primary,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: Spacing.containerPadding,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  modalTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  modalOptionText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  modalCancel: {
    alignItems: 'center',
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  modalCancelText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});