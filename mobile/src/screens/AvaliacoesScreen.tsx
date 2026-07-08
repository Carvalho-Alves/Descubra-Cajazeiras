import React, { useState, useMemo, useLayoutEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import type { AvaliacoesScreenProps } from '../navigation/types';

// ── Tipos ────────────────────────────────────────────────────────
type Filtro = 'Todas' | 'Positivas' | 'Críticas';

type Avaliacao = {
  id: string;
  avatar: string;
  nome: string;
  data: string;
  nota: number; // 1–5
  texto: string;
};

// ── Dados mock ───────────────────────────────────────────────────
const MOCK_AVALIACOES: Avaliacao[] = [
  {
    id: '1',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
    nome: 'Carlos Mendes',
    data: '12 Mai 2026',
    nota: 5,
    texto: 'Lugar incrível! A comida estava deliciosa e o atendimento foi impecável. Com certeza voltarei em breve.',
  },
  {
    id: '2',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
    nome: 'Ana Beatriz',
    data: '08 Mai 2026',
    nota: 4,
    texto: 'Muito bom! O ambiente é acolhedor e os preços são justos. Recomendo para famílias.',
  },
  {
    id: '3',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    nome: 'Roberto Lima',
    data: '01 Mai 2026',
    nota: 2,
    texto: 'O serviço demorou bastante e o local estava desorganizado. Esperava mais com base nas avaliações.',
  },
  {
    id: '4',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    nome: 'Mariana Costa',
    data: '28 Abr 2026',
    nota: 5,
    texto: 'Experiência maravilhosa! Os guias são muito atenciosos e o roteiro foi perfeito.',
  },
  {
    id: '5',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100',
    nome: 'Paulo Neto',
    data: '20 Abr 2026',
    nota: 3,
    texto: 'Regular. Há espaço para melhorias no atendimento, mas a localização compensa.',
  },
];

const NOTA_GERAL = 4.5;
const TOTAL_AVALIACOES = 128;

// ── Subcomponente: estrelas ───────────────────────────────────────
function StarRow({ nota, size = 14 }: { nota: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(nota);
        const half   = !filled && i < nota;
        return (
          <Ionicons
            key={i}
            name={filled ? 'star' : half ? 'star-half' : 'star-outline'}
            size={size}
            color={Colors.highlight}
          />
        );
      })}
    </View>
  );
}

// ── Tela principal ───────────────────────────────────────────────
export function AvaliacoesScreen({ navigation }: AvaliacoesScreenProps) {
  const [filtro, setFiltro] = useState<Filtro>('Todas');

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Filtragem reativa sem re-criar o array a cada render
  const avaliacoesFiltradas = useMemo(() => {
    if (filtro === 'Positivas') return MOCK_AVALIACOES.filter(a => a.nota >= 4);
    if (filtro === 'Críticas')  return MOCK_AVALIACOES.filter(a => a.nota <= 3);
    return MOCK_AVALIACOES;
  }, [filtro]);

  // ── Card de avaliação ─────────────────────────────────────────
  const renderItem: ListRenderItem<Avaliacao> = ({ item }) => (
    <View style={styles.card}>
      {/* Linha superior: avatar + nome + data */}
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} resizeMode="cover" />
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardNome}>{item.nome}</Text>
          <Text style={styles.cardData}>{item.data}</Text>
        </View>
      </View>

      {/* Estrelas da avaliação */}
      <StarRow nota={item.nota} size={14} />

      {/* Texto do comentário */}
      <Text style={styles.cardTexto}>{item.texto}</Text>

      {/* Botão "Responder" */}
      <TouchableOpacity
        style={styles.responderButton}
        onPress={() => Alert.alert('Responder', `Respondendo a ${item.nome}...`)}
        hitSlop={{ top: 6, bottom: 6 }}
      >
        <Text style={styles.responderText}>Responder</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

      {/* ── Cabeçalho ──────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerSide}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avaliações</Text>
        <View style={styles.headerSide} />
      </View>

      <FlatList
        data={avaliacoesFiltradas}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* ── Visão geral de nota ──────────────────────────── */}
            <View style={styles.overviewCard}>
              <Text style={styles.notaGrande}>{NOTA_GERAL.toFixed(1)}</Text>
              <StarRow nota={NOTA_GERAL} size={24} />
              <Text style={styles.totalText}>
                Baseado em {TOTAL_AVALIACOES} avaliações
              </Text>
            </View>

            {/* ── Abas de filtro ───────────────────────────────── */}
            <View style={styles.filtroRow}>
              {(['Todas', 'Positivas', 'Críticas'] as Filtro[]).map(tab => {
                const active = tab === filtro;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.filtroTab, active && styles.filtroTabActive]}
                    onPress={() => setFiltro(tab)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.filtroText, active && styles.filtroTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Nenhuma avaliação encontrada.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },

  // ── Cabeçalho ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerSide: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,
    color: Colors.text,
  },

  // ── Visão geral ───────────────────────────────────────────────
  overviewCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.containerPadding,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.xl,
    ...Shadow.sm,
  },
  notaGrande: {
    fontFamily: FontFamily.headingBold,
    fontSize: 56,
    color: Colors.text,
    lineHeight: 64,
    marginBottom: Spacing.sm,
  },
  starRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: Spacing.sm,
  },
  totalText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // ── Filtro ────────────────────────────────────────────────────
  filtroRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.containerPadding,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  filtroTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtroTabActive: {
    backgroundColor: Colors.primary,
  },
  filtroText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  filtroTextActive: {
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.surface,
  },

  // ── Card de comentário ────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.containerPadding,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardNome: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,         // 16px
    color: Colors.text,
  },
  cardData: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,         // 12px
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardTexto: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,         // 14px
    color: Colors.text,
    lineHeight: FontSize.sm * 1.6,
    marginTop: Spacing.sm,
  },
  responderButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
  },
  responderText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.primary,         // #0D6EFD Azul Vibrante
  },

  // ── Empty ─────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing.huge,
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
