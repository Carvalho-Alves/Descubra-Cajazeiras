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
import { getServicoById, Servico } from '../services/servicoService';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { firstImage } from '../utils/resolveAssetUrl';
import { shortTipoServico } from '../utils/format';
import type { GerenciarServicosDetailScreenProps } from '../navigation/types';

export function GerenciarServicosDetailScreen({
  navigation,
  route,
}: GerenciarServicosDetailScreenProps) {
  const { token } = useAuth();
  const { servicoId } = route.params;
  const [servico, setServico] = useState<Servico | null>(null);
  const [loading, setLoading] = useState(true);
  const [endereco, setEndereco] = useState<string>('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getServicoById(servicoId, token);
      setServico(data);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError
          ? error.message
          : 'Falha ao carregar serviço.',
      );
    } finally {
      setLoading(false);
    }
  }, [servicoId, token]);

  useEffect(() => {
    if (servico && servico.localizacao) {
      const reverseGeocode = async () => {
        try {
          // CORREÇÃO: O Typescript sabe que servico.localizacao existe por causa do IF acima
          const result = await Location.reverseGeocodeAsync({
            latitude: servico.localizacao!.latitude,
            longitude: servico.localizacao!.longitude,
          });
          if (result.length > 0) {
            const addr = result[0];
            const addressStr = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || 'Cajazeiras'}`.trim();
            setEndereco(addressStr);
          }
        } catch (error) {
          setEndereco(`${servico.localizacao!.latitude.toFixed(4)}, ${servico.localizacao!.longitude.toFixed(4)}`);
        }
      };
      reverseGeocode();
    }
  }, [servico]);

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

  if (!servico) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Serviço não encontrado</Text>
      </View>
    );
  }

  const image = firstImage(servico.imagem);
  const avgRating = servico.avaliacao_media || 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {image ? (
          <Image source={{ uri: image }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroImageFallback]}>
            <Ionicons name="storefront" size={48} color={Colors.muted} />
          </View>
        )}

        <View style={styles.titleSection}>
          <Text style={styles.title}>{servico.nome}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {shortTipoServico(servico.tipo_servico)}
            </Text>
          </View>
        </View>

        <View style={styles.ratingSection}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={20} color="#FFB800" />
            <Text style={styles.ratingValue}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>({servico.total_avaliacoes || 0})</Text>
          </View>
        </View>

        {servico.descricao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Text style={styles.description}>{servico.descricao}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          {servico.telefone && (
            <TouchableOpacity style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{servico.telefone}</Text>
            </TouchableOpacity>
          )}
          {servico.horario && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{servico.horario}</Text>
            </View>
          )}
        </View>

        {/* CORREÇÃO: Usando a exclamação "!" para garantir ao TypeScript que o dado existe e apagar as linhas vermelhas */}
        {servico.localizacao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localização</Text>

            {MapView ? (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  region={{
                    latitude: servico.localizacao!.latitude,
                    longitude: servico.localizacao!.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: servico.localizacao!.latitude,
                      longitude: servico.localizacao!.longitude,
                    }}
                    title={servico.nome}
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
          </View>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() =>
            navigation.navigate('Avaliacoes', {
              tipo: 'servico',
              referenciaId: servico._id,
              titulo: servico.nome,
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
    backgroundColor: '#FFD50033',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  badgeText: { fontFamily: FontFamily.headingSemiBold, fontSize: FontSize.sm, color: Colors.text },
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
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  infoText: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: Colors.text },
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
}); 