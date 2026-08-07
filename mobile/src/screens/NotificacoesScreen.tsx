import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { listEventos } from '../services/eventoService';
import { listAvaliacoes } from '../services/avaliacaoService';
import { ApiError } from '../services/apiClient';
import { formatRelativeDate } from '../utils/format';
import type { NotificacoesScreenProps } from '../navigation/types';

type Notificacao = {
  id: string;
  titulo: string;
  mensagem: string;
  tempo: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

/**
 * Não há endpoint de notificações no backend.
 * Montamos um feed a partir de eventos e avaliações recentes da API.
 */
export function NotificacoesScreen({ navigation }: NotificacoesScreenProps) {
  const [items, setItems] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [eventos, avaliacoes] = await Promise.all([
        listEventos().catch(() => []),
        listAvaliacoes(1, 10).catch(() => []),
      ]);

      const fromEventos: Notificacao[] = (Array.isArray(eventos) ? eventos : [])
        .slice(0, 5)
        .map(evento => ({
          id: `evt-${evento._id}`,
          titulo: 'Novo evento',
          mensagem: evento.nome,
          tempo: formatRelativeDate(evento.createdAt || evento.data),
          icon: 'calendar-outline' as const,
        }));

      const fromAvals: Notificacao[] = (
        Array.isArray(avaliacoes) ? avaliacoes : []
      )
        .slice(0, 5)
        .map(av => ({
          id: `av-${av._id}`,
          titulo: 'Nova avaliação',
          mensagem: av.comentario || `Nota ${av.nota} em ${av.tipo}`,
          tempo: formatRelativeDate(av.criadoEm || av.createdAt),
          icon: 'star-outline' as const,
        }));

      setItems([...fromEventos, ...fromAvals]);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError
          ? error.message
          : 'Falha ao carregar notificações.',
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

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.surface} />
        </Pressable>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.headerBtn}>
          <Ionicons name="notifications" size={22} color={Colors.highlight} />
        </View>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
          }
        >
          {items.length === 0 ? (
            <Text style={styles.empty}>Nenhuma notificação no momento.</Text>
          ) : (
            items.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={styles.iconWrap}>
                  <Ionicons name={item.icon} size={22} color={Colors.primary} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  <Text style={styles.cardMessage}>{item.mensagem}</Text>
                  <Text style={styles.cardTime}>{item.tempo}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundMuted },
  header: {
    backgroundColor: Colors.primary,
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
    color: Colors.surface,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.textSecondary,
    fontFamily: FontFamily.bodyRegular,
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E7F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: Colors.text,
    marginBottom: 4,
  },
  cardMessage: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 6,
  },
  cardTime: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
