import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';

let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { getEventoById, Evento } from '../services/eventoService';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { firstImage } from '../utils/resolveAssetUrl';
import { formatDateBR, labelEventoStatus } from '../utils/format';
import type { GerenciarEventosDetailScreenProps } from '../navigation/types';

function statusColor(status?: string) {
  switch ((status || 'ativo').toLowerCase()) {
    case 'ativo':
      return Colors.success;
    case 'cancelado':
      return Colors.error;
    case 'encerrado':
      return Colors.textSecondary;
    default:
      return Colors.textSecondary;
  }
}

export function GerenciarEventosDetailScreen({
  navigation,
  route,
}: GerenciarEventosDetailScreenProps) {
  const { token } = useAuth();
  const { eventoId } = route.params;
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [endereco, setEndereco] = useState<string>('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEventoById(eventoId, token);
      setEvento(data);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError
          ? error.message
          : 'Falha ao carregar evento.',
      );
    } finally {
      setLoading(false);
    }
  }, [eventoId, token]);

  // CORREÇÃO: Extração segura das coordenadas independente da alteração da sua colega
  const getCoordinates = (evt: Evento | null) => {
    const data = evt as any;
    const lat = Number(data?.localizacao?.latitude || data?.latitude) || -6.8889;
    const lng = Number(data?.localizacao?.longitude || data?.longitude) || -38.5606;
    return { lat, lng };
  };

  useEffect(() => {
    if (evento) {
      const { lat, lng } = getCoordinates(evento);
      
      const reverseGeocode = async () => {
        try {
          const result = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lng,
          });
          if (result.length > 0) {
            const addr = result[0];
            const addressStr = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || 'Cajazeiras'}`.trim();
            setEndereco(addressStr);
          }
        } catch (error) {
          setEndereco(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      };
      reverseGeocode();
    }
  }, [evento]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Evento não encontrado</Text>
      </View>
    );
  }

  const image = firstImage(evento.imagem);
  const avgRating = evento.avaliacao_media || 0;
  const statusColor_ = statusColor(evento.status);
  const { lat, lng } = getCoordinates(evento);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Evento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {image ? (
          <Image source={{ uri: image }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroImageFallback]}>
            <Ionicons name="calendar" size={48} color={Colors.muted} />
          </View>
        )}

        <View style={styles.titleSection}>
          <Text style={styles.title}>{evento.nome}</Text>
          <View style={[styles.badge, { backgroundColor: `${statusColor_}20` }]}>
            <Text style={[styles.badgeText, { color: statusColor_ }]}>
              {labelEventoStatus(evento.status)}
            </Text>
          </View>
        </View>

        <View style={styles.ratingSection}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={20} color="#FFB800" />
            <Text style={styles.ratingValue}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>({evento.total_avaliacoes || 0})</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Evento</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data</Text>
              <Text style={styles.infoText}>{formatDateBR(evento.data)}</Text>
            </View>
          </View>

          {evento.horario && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Horário</Text>
                <Text style={styles.infoText}>{evento.horario}</Text>
              </View>
            </View>
          )}

          {evento.local && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Local</Text>
                <Text style={styles.infoText}>{evento.local}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização no Mapa</Text>

          {MapView ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={{
                  latitude: lat,
                  longitude: lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: lat,
                    longitude: lng,
                  }}
                  title={evento.nome}
                />
              </MapView>
            </View>
          ) : (
            <View style={[styles.mapContainer, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: Colors.textSecondary }}>Mapa disponível apenas em mobile</Text>
            </View>
          )}

          <View style={styles.addressBox}>
            <Ionicons name="location-outline" size={18} color={Colors.primary} />
            <Text style={styles.addressText}>{endereco || 'Carregando endereço...'}</Text>
          </View>

          {evento.telefone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Contato</Text>
                <Text style={styles.infoText}>{evento.telefone}</Text>
              </View>
            </View>
          )}
        </View>

        {evento.descricao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre o Evento</Text>
            <Text style={styles.description}>{evento.descricao}</Text>
          </View>
        )}
        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() =>
            navigation.navigate('Avaliacoes', {
              tipo: 'evento',
              referenciaId: evento._id,
              titulo: evento.nome,
            })
          }
        >
          <Ionicons name="star-outline" size={20} color={Colors.surface} />
          <Text style={styles.reviewButtonText}>Ver Avaliações</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  content: { paddingBottom: Spacing.lg },
  heroImage: { width: '100%', height: 240, backgroundColor: '#f0f0f0' },
  heroImageFallback: { justifyContent: 'center', alignItems: 'center' },
  titleSection: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  badgeText: { fontFamily: FontFamily.headingSemiBold, fontSize: FontSize.sm },
  ratingSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  ratingValue: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: Colors.text },
  ratingLabel: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.sm, color: Colors.textSecondary },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sectionTitle: { fontFamily: FontFamily.headingSemiBold, fontSize: FontSize.md, color: Colors.text, marginBottom: Spacing.md },
  description: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: Colors.text, lineHeight: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  infoContent: { flex: 1 },
  infoLabel: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },
  infoText: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: Colors.text },
  errorText: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: Colors.textSecondary },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: Colors.surface,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.highlight,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
  },
  reviewButtonText: { fontFamily: FontFamily.headingSemiBold, fontSize: FontSize.md, color: Colors.surface },
  mapContainer: { height: 200, borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.md, borderWidth: 1, borderColor: '#E5E5E5' },
  map: { flex: 1 },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  addressText: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: Colors.text, flex: 1 },
});