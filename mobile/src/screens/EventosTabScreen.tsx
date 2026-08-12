import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { listEventos, Evento } from '../services/eventoService';
import { formatDateBR, labelEventoStatus } from '../utils/format';
import { FloatingActionButton } from '../components/FloatingActionButton';

const FILTERS = ['Todos', 'Ativo', 'Cancelado', 'Encerrado'] as const;

function statusColor(status?: string) {
  switch ((status || 'ativo').toLowerCase()) {
    case 'ativo': return Colors.success;
    case 'cancelado': return Colors.error;
    default: return Colors.textSecondary;
  }
}

export function EventosTabScreen() {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('Todos');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await listEventos();
      
      const now = new Date();
      const parsedData = (Array.isArray(data) ? data : []).map(e => {
        let realStatus = e.status || 'ativo';
        if (realStatus !== 'cancelado' && e.data && !isNaN(new Date(e.data).getTime())) {
          if (new Date(e.data) < now) {
            realStatus = 'encerrado';
          }
        }
        return { ...e, status: realStatus };
      });

      setEventos(parsedData);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar eventos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    if (activeFilter === 'Todos') return eventos;
    return eventos.filter(e => labelEventoStatus(e.status) === activeFilter);
  }, [activeFilter, eventos]);

  const renderItem: ListRenderItem<Evento> = ({ item }) => {
    const color = statusColor(item.status);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('GerenciarEventosDetail', { eventoId: item._id })}
      >
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardDate}>{formatDateBR(item.data)}</Text>
          <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.badgeText, { color }]}>
              {labelEventoStatus(item.status)}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>Eventos</Text>
      </SafeAreaView>

      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterButtonText, activeFilter === filter && styles.filterButtonTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum evento encontrado.</Text>}
        />
      )}
      
      <FloatingActionButton onPress={() => navigation.navigate('NovoEvento')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.highlight, padding: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { fontFamily: FontFamily.headingBold, fontSize: 24, color: Colors.text },
  filtersWrapper: { paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  filtersContainer: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 6 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#E0E0E0' },
  filterButtonActive: { backgroundColor: Colors.highlight, borderColor: Colors.highlight },
  filterButtonText: { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.text },
  filterButtonTextActive: { fontFamily: FontFamily.headingSemiBold, fontSize: 11, color: Colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 100 },
  empty: { textAlign: 'center', marginTop: 40, color: Colors.textSecondary },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadow.sm },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: FontFamily.headingSemiBold, fontSize: 15, color: Colors.text, marginBottom: 4 },
  cardDate: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.sm, color: Colors.textSecondary },
  badge: { alignSelf: 'flex-start', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2, marginTop: 4 },
  badgeText: { fontFamily: FontFamily.headingSemiBold, fontSize: FontSize.xs },
});