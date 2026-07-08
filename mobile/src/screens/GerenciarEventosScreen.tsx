import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import type { GerenciarEventosScreenProps } from '../navigation/types';

// ── Tipos ────────────────────────────────────────────────────────
type EventoStatus = 'Ativo' | 'Pendente';

type Evento = {
  id: string;
  nome: string;
  status: EventoStatus;
  data: string;
};

// ── Configuração dos badges de status ────────────────────────────
const STATUS_CONFIG: Record<EventoStatus, { bg: string; text: string }> = {
  Ativo:    { bg: '#D1FAE5', text: '#065F46' }, // verde claro
  Pendente: { bg: '#FEF3C7', text: '#92400E' }, // amarelo claro
};

// ── Dados mock ───────────────────────────────────────────────────
const MOCK_EVENTOS: Evento[] = [
  { id: '1', nome: 'Festival de Inverno de Cajazeiras', status: 'Ativo',    data: '22 Mai 2026' },
  { id: '2', nome: 'Feira Gastronômica Regional',       status: 'Pendente', data: '30 Mai 2026' },
  { id: '3', nome: 'Noite Cultural no Centro Histórico',status: 'Ativo',    data: '05 Jun 2026' },
];

// ── Empty State ──────────────────────────────────────────────────
function EmptyState({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="calendar-outline" size={52} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Nenhum evento ainda</Text>
      <Text style={styles.emptyBody}>
        Você ainda não cadastrou eventos.{'\n'}Comece criando o seu primeiro!
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.emptyButtonText}>Criar primeiro evento</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Tela principal ───────────────────────────────────────────────
export function GerenciarEventosScreen({ navigation }: GerenciarEventosScreenProps) {
  const [eventos, setEventos] = useState<Evento[]>(MOCK_EVENTOS);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Oculta o cabeçalho padrão do Stack para usar o nosso custom
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const openSheet = useCallback((evento: Evento) => {
    setSelectedEvento(evento);
    setSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    // Pequeno delay para o modal fechar antes de limpar o state
    setTimeout(() => setSelectedEvento(null), 250);
  }, []);

  const handleCreate = () =>
    Alert.alert('Criar evento', 'Formulário em desenvolvimento.');

  const handleEdit = useCallback(() => {
    const nome = selectedEvento?.nome;
    closeSheet();
    setTimeout(() => Alert.alert('Editar', `Editar "${nome}"`), 300);
  }, [selectedEvento, closeSheet]);

  const handleDelete = useCallback(() => {
    const toDelete = selectedEvento;
    closeSheet();
    setTimeout(() => {
      Alert.alert(
        'Excluir evento',
        `Deseja remover "${toDelete?.nome}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () =>
              setEventos(prev => prev.filter(e => e.id !== toDelete?.id)),
          },
        ],
      );
    }, 300);
  }, [selectedEvento, closeSheet]);

  // ── Card de evento ─────────────────────────────────────────────
  const renderEvento: ListRenderItem<Evento> = ({ item }) => {
    const badge = STATUS_CONFIG[item.status];
    return (
      <View style={styles.card}>
        {/* Conteúdo principal */}
        <View style={styles.cardBody}>
          <Text style={styles.cardNome} numberOfLines={2}>
            {item.nome}
          </Text>
          <View style={styles.cardMeta}>
            {/* Badge de status */}
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {item.status}
              </Text>
            </View>
            {/* Data */}
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.cardData}>{item.data}</Text>
            </View>
          </View>
        </View>

        {/* Botão 3 pontos */}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => openSheet(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={`Opções para ${item.nome}`}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Meus Eventos</Text>
        <View style={styles.headerSide} />
      </View>

      {/* ── Lista ou Empty State ────────────────────────────────── */}
      <View style={styles.content}>
        {eventos.length === 0 ? (
          <EmptyState onPress={handleCreate} />
        ) : (
          <FlatList
            data={eventos}
            keyExtractor={item => item.id}
            renderItem={renderEvento}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* ── FAB ──────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreate}
          activeOpacity={0.85}
          accessibilityLabel="Criar novo evento"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={30} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      {/* ── Action Sheet (Modal) ────────────────────────────────── */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={closeSheet}>
          {/* stopPropagation via Pressable wrapping the sheet */}
          <Pressable style={styles.sheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Título do evento selecionado */}
            <Text style={styles.sheetEventTitle} numberOfLines={1}>
              {selectedEvento?.nome}
            </Text>

            {/* Opção: Editar */}
            <TouchableOpacity style={styles.sheetOption} onPress={handleEdit}>
              <Ionicons name="pencil-outline" size={20} color={Colors.text} />
              <Text style={styles.sheetOptionText}>Editar</Text>
            </TouchableOpacity>

            <View style={styles.sheetDivider} />

            {/* Opção: Excluir */}
            <TouchableOpacity style={styles.sheetOption} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
              <Text style={[styles.sheetOptionText, styles.sheetOptionDestructive]}>
                Excluir
              </Text>
            </TouchableOpacity>

            {/* Cancelar */}
            <TouchableOpacity style={styles.sheetCancelButton} onPress={closeSheet}>
              <Text style={styles.sheetCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
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

  // ── Lista ─────────────────────────────────────────────────────
  listContent: {
    padding: Spacing.containerPadding,
    paddingBottom: 100, // espaço para o FAB não cobrir o último item
  },

  // ── Card de evento ────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  cardBody: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardNome: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,           // 16px
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xxs,          // 10px
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardData: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,           // 12px
    color: Colors.textSecondary,
  },
  moreButton: {
    padding: Spacing.xs,
  },

  // ── Empty State ───────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#EFF6FF',      // azul muito claro
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.xl,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.5,
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.surface,
  },

  // ── FAB ───────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.containerPadding,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,  // #0D6EFD
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },

  // ── Action Sheet ──────────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.containerPadding,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetEventTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  sheetOptionText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  sheetOptionDestructive: {
    color: Colors.error,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  sheetCancelButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sheetCancelText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
