import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ListRenderItem,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import type { HomeScreenProps } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

// ── Configuração de Animação para Android ───────────────────────
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Tipos de dados ──────────────────────────────────────────────
type ServiceOrEvent = {
  id: string; title: string; category: string; date?: string;
  rating?: number; image: string; latitude: number; longitude: number;
};

const CATEGORIES = ['Todos', 'Hospedagem', 'Gastronomia', 'Eventos'];

const ITEMS_DATA: ServiceOrEvent[] = [
  {
    id: '1',
    title: 'Show de Forró Universitário',
    category: 'Eventos',
    date: 'Sáb, 22 Mai · 19h',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    latitude: -6.8889,
    longitude: -38.5606,
    rating: 4.5,
  },
  {
    id: '2',
    title: 'Restaurante Sabor Sertanejo',
    category: 'Gastronomia',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500',
    latitude: -6.8875,
    longitude: -38.5620,
    rating: 4.8,
  },
  {
    id: '3',
    title: 'Pousada Alto da Serra',
    category: 'Hospedagem',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500',
    latitude: -6.8901,
    longitude: -38.5580,
    rating: 4.2,
  },
  {
    id: '4',
    title: 'Caminhada Ecológica na Serra',
    category: 'Eventos',
    date: 'Seg, 24 Mai · 07h',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=200',
    latitude: -6.8950,
    longitude: -38.5550,
  },
];

const handleOpenSettings = () => {
  Linking.openSettings();
};

// ── Tela principal ──────────────────────────────────────────────
export function HomeScreen(_props: HomeScreenProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<String | null>(null);
  
  // Controle de expansão do bottom sheet
  const [isExpanded, setIsExpanded] = useState(false);

  const navigation = useNavigation<any>();

  // Joga itens com data (eventos) pra cima
  const sortedItems = [...ITEMS_DATA].sort((a, b) => {
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return 0;
  });

  const filteredItems = activeCategory === 'Todos'
    ? sortedItems : sortedItems.filter(item => item.category === activeCategory);

  // Limita a quantidade baseada no estado de expansão
  const visibleItems = filteredItems.slice(0, isExpanded ? 4 : 2);

  useEffect(() => {
    async function getLocationPermission() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg('Permissão para acessar localização foi negada!');
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

  const renderServiceItem: ListRenderItem<ServiceOrEvent> = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Detalhes', { item: item })}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} resizeMode='cover' />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.eventCategory}>{item.category}</Text>
        {item.date && (
          <View style={styles.eventDateRow}>
            <Ionicons name='calendar-outline' size={12} color={Colors.textSecondary} />
            <Text style={styles.eventDate}>{item.date}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.border} style={styles.eventChevron} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      
      {/* ── Topo ─────────────────────────────────── */}
      <View style={styles.topContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Visitante 👋</Text>
            <Text style={styles.subGreeting}>Explore Cajazeiras hoje</Text>
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            accessibilityLabel="Notificações"
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos ou locais..."
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* ── Mapa ───────────────────────────────────── */}
      <View style={styles.mapWrapper}>
        {location ? (
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
            {filteredItems.map((item) => (
              <Marker
                key={item.id}
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                title={item.title}
                description={item.category}
              />
            ))}
          </MapView>
        ) : errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Text style={styles.instructionText}>Para usar o mapa, precisamos do seu GPS.</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
              <Text style={styles.settingsButtonText}>Abrir Configurações</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.loadingText}>Buscando sua localização...</Text>
        )}
      </View>

      {/* ── Bottom sheet (aba expansível) ──────────────── */}
      <View style={[styles.bottomSheet, { height: isExpanded ? '65%' : 300 }]}>

        {/* Indicador de arrasto / clica e expande */}
        <TouchableOpacity 
          style={styles.dragHandleContainer} 
          activeOpacity={0.7} 
          onPress={toggleExpand}
        >
          <View style={styles.dragHandle} />
        </TouchableOpacity>

        {/* Categorias */}
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((cat, i) => {
              const active = cat === activeCategory;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.pill,
                    active && styles.pillActive,
                    i > 0 && { marginLeft: Spacing.sm },
                  ]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Lista de serviço/evento */}
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Botão de cadastro de serviço/evento */}
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('NovoServico')}
      >
        <Ionicons name="add" size={32} color={Colors.text} style={styles.fabIcon} />
      </TouchableOpacity>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topContainer: {
    paddingHorizontal: Spacing.containerPadding,
    backgroundColor: Colors.background,
    zIndex: 10, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  subGreeting: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bellButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: 48,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.text,
  },

  // ── Mapa ────────────────────────────────────────────────────
  mapWrapper: {
    flex: 1,
    backgroundColor: Colors.border, 
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 90,
    fontFamily: FontFamily.bodyMedium,
    color: Colors.textSecondary,
  },
  errorText: {
    textAlign: 'center',
    fontFamily: FontFamily.bodyMedium,
    color: '#DC3545',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  instructionText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bodyRegular,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: Spacing.md,
  },
  settingsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  settingsButtonText: {
    color: Colors.surface,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
  },

  // ── Bottom sheet ────────────────────────────────────────────
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Shadow.lg,
    elevation: 20,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },

  // ── Categorias ──────────────────────────────────────────────
  categoriesWrapper: {
    marginBottom: Spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.containerPadding,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.highlight,
    borderColor: Colors.highlight,
  },
  pillText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.text,
  },

  // ── Lista de Eventos ────────────────────────────────────────
  listContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.xl,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
  eventInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  eventTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  eventCategory: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  eventChevron: {
    paddingLeft: Spacing.sm,
  },

  // ── FAB ────────────────────
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.highlight,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
    elevation: 8,
  },
  fabIcon: {
    marginLeft: 2,
  },
});