import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItem,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import {
  Avaliacao,
  createAvaliacaoRequest,
  listAvaliacoes,
  listAvaliacoesByRef,
} from '../services/avaliacaoService';
import { ApiError } from '../services/apiClient';
import { formatRelativeDate } from '../utils/format';
import type { AvaliacoesScreenProps } from '../navigation/types';

function Stars({
  rating,
  size = 16,
  onPress,
}: {
  rating: number;
  size?: number;
  onPress?: (value: number) => void;
}) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          disabled={!onPress}
          onPress={() => onPress?.(star)}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? Colors.warning : '#D1D5DB'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function userName(item: Avaliacao): string {
  if (item.usuarioId && typeof item.usuarioId === 'object') {
    return item.usuarioId.nome || 'Usuário';
  }
  return 'Usuário';
}

function initials(nome: string) {
  return nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AvaliacoesScreen({ navigation, route }: AvaliacoesScreenProps) {
  const { token, isAuthenticated } = useAuth();
  const params = route.params;
  const [items, setItems] = useState<Avaliacao[]>([]);
  const [media, setMedia] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [comentario, setComentario] = useState('');
  const [nota, setNota] = useState(5);
  const [sending, setSending] = useState(false);

  const title = params?.titulo || 'Avaliações';

  const load = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        if (params?.tipo && params?.referenciaId) {
          const res = await listAvaliacoesByRef(
            params.tipo,
            params.referenciaId,
          );
          setItems(res.items || []);
          setMedia(res.stats?.media ?? 0);
          setTotal(res.stats?.total ?? 0);
        } else {
          const res = await listAvaliacoes();
          const list = Array.isArray(res) ? res : [];
          setItems(list);
          setTotal(list.length);
          const avg =
            list.length > 0
              ? list.reduce((acc, a) => acc + a.nota, 0) / list.length
              : 0;
          setMedia(Number(avg.toFixed(1)));
        }
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof ApiError
            ? error.message
            : 'Falha ao carregar avaliações.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [params?.tipo, params?.referenciaId],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleSend = async () => {
    if (!params?.tipo || !params?.referenciaId) {
      Alert.alert(
        'Atenção',
        'Abra as avaliações a partir de um serviço ou evento para comentar.',
      );
      return;
    }
    if (!isAuthenticated) {
      Alert.alert('Atenção', 'Faça login para avaliar.');
      return;
    }

    setSending(true);
    try {
      await createAvaliacaoRequest(
        {
          tipo: params.tipo,
          referenciaId: params.referenciaId,
          nota,
          comentario: comentario.trim() || undefined,
        },
        token,
      );
      setComentario('');
      setNota(5);
      await load(true);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError
          ? error.message
          : 'Não foi possível enviar a avaliação.',
      );
    } finally {
      setSending(false);
    }
  };

  const renderItem: ListRenderItem<Avaliacao> = ({ item }) => {
    const nome = userName(item);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(nome)}</Text>
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.cardName}>{nome}</Text>
            <Text style={styles.cardDate}>
              {formatRelativeDate(item.criadoEm || item.createdAt)}
            </Text>
          </View>
          <Stars rating={item.nota} size={14} />
        </View>
        {!!item.comentario && (
          <Text style={styles.cardComment}>{item.comentario}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerBtn}>
            <Ionicons name="star" size={22} color={Colors.warning} />
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.summary}>
        <Text style={styles.summaryScore}>
          {Number.isFinite(media) ? media.toFixed(1) : '0.0'}
        </Text>
        <Stars rating={Math.round(media || 0)} size={24} />
        <Text style={styles.summaryCount}>{total} avaliações</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhuma avaliação ainda.</Text>
          }
        />
      )}

      {params?.tipo && params?.referenciaId ? (
        <SafeAreaView edges={['bottom']} style={styles.composerSafe}>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Sua nota:</Text>
            <Stars rating={nota} size={22} onPress={setNota} />
          </View>
          <View style={styles.composer}>
            <TextInput
              style={styles.composerInput}
              placeholder="Adicione um comentário..."
              placeholderTextColor={Colors.muted}
              value={comentario}
              onChangeText={setComentario}
            />
            <TouchableOpacity
              style={[styles.sendBtn, sending && { opacity: 0.7 }]}
              onPress={handleSend}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Ionicons name="send" size={18} color={Colors.surface} />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  headerSafe: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  summary: {
    alignItems: 'center',
    paddingVertical: Spacing.containerPadding,
    backgroundColor: '#FFFBEB',
  },
  summaryScore: {
    fontFamily: FontFamily.headingBold,
    fontSize: 48,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  summaryCount: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: '#4B5563',
  },
  stars: { flexDirection: 'row', gap: 2 },
  list: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontFamily: FontFamily.bodyRegular,
    marginTop: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: '#4B5563',
  },
  cardMeta: { flex: 1 },
  cardName: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  cardDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  cardComment: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: '#374151',
    lineHeight: 20,
  },
  composerSafe: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: Colors.surface,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  ratingLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  composerInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
