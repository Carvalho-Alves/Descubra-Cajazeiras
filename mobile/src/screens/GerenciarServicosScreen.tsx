import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ListRenderItem,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import type { GerenciarServicosScreenProps } from '../navigation/types';

// ── Tipos ────────────────────────────────────────────────────────
type Servico = {
  id: string;
  nome: string;
  avaliacao: number;
  imagem: string;
  aberto: boolean;
};

// ── Dados mock ───────────────────────────────────────────────────
const MOCK_SERVICOS: Servico[] = [
  {
    id: '1',
    nome: 'Restaurante Sabor do Sertão',
    avaliacao: 4.7,
    imagem: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
    aberto: true,
  },
  {
    id: '2',
    nome: 'Pousada Serra Verde',
    avaliacao: 4.3,
    imagem: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=200',
    aberto: false,
  },
  {
    id: '3',
    nome: 'Mirante do Vale Encantado',
    avaliacao: 4.9,
    imagem: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
    aberto: true,
  },
];

// ── Tela principal ───────────────────────────────────────────────
export function GerenciarServicosScreen({ navigation }: GerenciarServicosScreenProps) {
  const [servicos, setServicos] = useState<Servico[]>(MOCK_SERVICOS);

  // Oculta cabeçalho padrão do Stack
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // ── Alterna status Aberto/Fechado de um serviço ───────────────
  const handleToggle = useCallback((id: string, value: boolean) => {
    setServicos(prev =>
      prev.map(s => (s.id === id ? { ...s, aberto: value } : s)),
    );
  }, []);

  // ── Excluir com confirmação ───────────────────────────────────
  const handleDelete = useCallback((item: Servico) => {
    Alert.alert(
      'Excluir serviço',
      `Deseja remover "${item.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () =>
            setServicos(prev => prev.filter(s => s.id !== item.id)),
        },
      ],
    );
  }, []);

  // ── Card de serviço ───────────────────────────────────────────
  const renderServico: ListRenderItem<Servico> = ({ item }) => (
    <View style={styles.card}>
      {/* ── Parte superior: miniatura + info + switch ─────────── */}
      <View style={styles.cardTop}>
        {/* Miniatura */}
        <Image
          source={{ uri: item.imagem }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Nome e avaliação */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome} numberOfLines={2}>
            {item.nome}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={Colors.highlight} />
            <Text style={styles.ratingText}>{item.avaliacao.toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>· avaliação média</Text>
          </View>
        </View>

        {/* Switch Aberto/Fechado */}
        <View style={styles.switchWrapper}>
          <Text style={[
            styles.switchLabel,
            { color: item.aberto ? Colors.success : Colors.textSecondary },
          ]}>
            {item.aberto ? 'Aberto' : 'Fechado'}
          </Text>
          <Switch
            value={item.aberto}
            onValueChange={val => handleToggle(item.id, val)}
            trackColor={{
              false: Colors.border,
              true: Colors.primary,
            }}
            thumbColor={Colors.surface}
            ios_backgroundColor={Colors.border}
          />
        </View>
      </View>

      {/* ── Divider ───────────────────────────────────────────── */}
      <View style={styles.cardDivider} />

      {/* ── Ações: Editar | Excluir ───────────────────────────── */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            Alert.alert('Editar', `Editar "${item.nome}"`)
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
          <Text style={styles.actionEdit}>Editar</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={14} color={Colors.error} />
          <Text style={styles.actionDelete}>Excluir</Text>
        </TouchableOpacity>
      </View>
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
        <Text style={styles.headerTitle}>Meus Serviços</Text>
        <View style={styles.headerSide} />
      </View>

      {/* ── Lista ──────────────────────────────────────────────── */}
      <View style={styles.flex}>
        <FlatList
          data={servicos}
          keyExtractor={item => item.id}
          renderItem={renderServico}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="storefront-outline"
                size={52}
                color={Colors.primary}
              />
              <Text style={styles.emptyTitle}>Nenhum serviço cadastrado</Text>
              <Text style={styles.emptyBody}>
                Toque no botão + para adicionar seu primeiro serviço turístico.
              </Text>
            </View>
          }
        />

        {/* ── FAB ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('NovoServico')}
          activeOpacity={0.85}
          accessibilityLabel="Adicionar novo serviço"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={30} color={Colors.surface} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
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
    paddingBottom: 100,            // espaço para o FAB
  },

  // ── Card ──────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },

  // ── Parte superior do card ────────────────────────────────────
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  cardNome: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,         // 16px
    color: Colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,         // 12px
    color: Colors.text,
  },
  ratingLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // ── Switch ───────────────────────────────────────────────────
  switchWrapper: {
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 0,
  },
  switchLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xxs,        // 10px
  },

  // ── Divider ───────────────────────────────────────────────────
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  // ── Ações ─────────────────────────────────────────────────────
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  actionEdit: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,         // 14px
    color: Colors.primary,
  },
  actionDelete: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.error,           // vermelho #DC3545
  },

  // ── Empty State ───────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingTop: Spacing.huge,
  },
  emptyTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.xl,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyBody: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.5,
  },

  // ── FAB ───────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.containerPadding,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
});
