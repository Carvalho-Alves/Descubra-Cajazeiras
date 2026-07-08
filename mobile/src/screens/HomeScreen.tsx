import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ImageBackground,
  Image,
  StyleSheet,
  Dimensions,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import type { HomeScreenProps } from '../navigation/types';

// ── Constantes de layout ────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HIGHLIGHT_CARD_WIDTH = SCREEN_WIDTH * 0.78;
const HIGHLIGHT_GAP = Spacing.md; // 12px

// ── Tipos de dados ──────────────────────────────────────────────
type Highlight = { id: string; title: string; rating: number; image: string };
type Evento    = { id: string; title: string; date: string;   image: string };

// ── Dados estáticos (placeholder) ───────────────────────────────
const CATEGORIES = ['Tudo', 'Eventos', 'Gastronomia', 'Hospedagem'];

const HIGHLIGHTS: Highlight[] = [
  {
    id: '1',
    title: 'Festival de Inverno de Cajazeiras',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c5820?w=500',
  },
  {
    id: '2',
    title: 'Feira da Agricultura Familiar',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500',
  },
  {
    id: '3',
    title: 'Noite Cultural no Centro',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500',
  },
];

const EVENTOS: Evento[] = [
  {
    id: '1',
    title: 'Show de Forró Universitário',
    date: 'Sáb, 22 Mai · 19h',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
  },
  {
    id: '2',
    title: 'Exposição de Arte Local',
    date: 'Dom, 23 Mai · 10h',
    image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=200',
  },
  {
    id: '3',
    title: 'Caminhada Ecológica na Serra',
    date: 'Seg, 24 Mai · 07h',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=200',
  },
];

// ── Subcomponentes ──────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity>
        <Text style={styles.seeAll}>Ver todos</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Tela principal ──────────────────────────────────────────────
export function HomeScreen(_props: HomeScreenProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tudo');

  const renderHighlight: ListRenderItem<Highlight> = ({ item }) => (
    <View style={styles.highlightCard}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.highlightImage}
        imageStyle={{ borderRadius: BorderRadius.lg }}
        resizeMode="cover"
      >
        <View style={styles.highlightOverlay}>
          <Text style={styles.highlightTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={Colors.highlight} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.padded}>
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

          {/* ── Busca ────────────────────────────────────────── */}
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={18}
              color={Colors.textSecondary}
              style={styles.searchIcon}
            />
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

        {/* ── Categorias (sangra até a borda) ──────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          style={styles.categoriesScroll}
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

        {/* ── Destaques ────────────────────────────────────── */}
        <View style={[styles.padded, { marginTop: Spacing.lg }]}>
          <SectionHeader title="Destaques" />
        </View>

        <FlatList
          data={HIGHLIGHTS}
          keyExtractor={item => item.id}
          renderItem={renderHighlight}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={HIGHLIGHT_CARD_WIDTH + HIGHLIGHT_GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.highlightsList}
          ItemSeparatorComponent={() => <View style={{ width: HIGHLIGHT_GAP }} />}
          scrollEventThrottle={16}
        />

        {/* ── Eventos Próximos ─────────────────────────────── */}
        <View style={[styles.padded, { marginTop: Spacing.xl }]}>
          <SectionHeader title="Eventos Próximos" />

          {EVENTOS.map(event => (
            <View key={event.id} style={styles.eventCard}>
              <Image
                source={{ uri: event.image }}
                style={styles.eventImage}
                resizeMode="cover"
              />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <View style={styles.eventDateRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailsButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.detailsButtonText}>Ver detalhes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={{ height: Spacing.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  /** Seções com padding horizontal padrão de 24 px */
  padded: {
    paddingHorizontal: Spacing.containerPadding,
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,         // 20px
    color: Colors.text,
  },
  subGreeting: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,         // 14px
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

  // ── Busca ───────────────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,  // 8px
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: 48,
    marginBottom: Spacing.lg,
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

  // ── Categorias ──────────────────────────────────────────────
  categoriesScroll: {
    marginBottom: Spacing.sm,
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
    backgroundColor: Colors.highlight,   // #FFD500 Amarelo
    borderColor: Colors.highlight,
  },
  pillText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.text,                   // #212529 Cinza Escuro
  },

  // ── Cabeçalho de seção ──────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,               // 18px
    color: Colors.text,
  },
  seeAll: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },

  // ── Destaques — cards horizontais com snap ──────────────────
  highlightsList: {
    paddingLeft: Spacing.containerPadding,
    paddingRight: Spacing.containerPadding,
    paddingBottom: Spacing.sm,           // para sombra não cortar
  },
  highlightCard: {
    width: HIGHLIGHT_CARD_WIDTH,
    height: 220,
    borderRadius: BorderRadius.lg,       // 12px
    overflow: 'hidden',
    ...Shadow.md,
  },
  highlightImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  highlightOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    padding: Spacing.md,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  highlightTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,               // 16px
    color: Colors.surface,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,               // 12px
    color: Colors.surface,
  },

  // ── Eventos Próximos — cards verticais ──────────────────────
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  eventImage: {
    width: 88,
    height: 96,
  },
  eventInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,               // 14px
    color: Colors.text,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,               // 12px
    color: Colors.textSecondary,
  },
  detailsButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,     // #0D6EFD
    borderRadius: BorderRadius.sm,       // 4px
  },
  detailsButtonText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.surface,
  },
});
