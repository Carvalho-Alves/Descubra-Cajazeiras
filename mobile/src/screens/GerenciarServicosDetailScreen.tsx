import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { Servico, getServicoById } from '../services/servicoService';
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

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getServicoById(servicoId);
      setServico(data);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError ? error.message : 'Falha ao carregar serviço.',
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [servicoId, navigation, token]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  if (loading || !servico) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const image = firstImage(servico.imagem);
  const estrelas = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={styles.headerBtn} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {image ? (
          <Image source={{ uri: image }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]}>
            <Ionicons name="storefront" size={48} color={Colors.muted} />
          </View>
        )}

        <View style={styles.mainContent}>
          <Text style={styles.title}>{servico.nome}</Text>

          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {shortTipoServico(servico.tipo_servico)}
              </Text>
            </View>
          </View>

          {servico.descricao && (
            <Text style={styles.description}>{servico.descricao}</Text>
          )}

          {/* Avaliações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="star" size={16} color={Colors.warning} /> Avaliações
            </Text>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingNumber}>
                {(servico.mediaAvaliacoes || 0).toFixed(1)}
              </Text>
              <View>
                <View style={styles.starsContainer}>
                  {estrelas.map(star => (
                    <Ionicons
                      key={star}
                      name={
                        star <= (servico.mediaAvaliacoes || 0)
                          ? 'star'
                          : 'star-outline'
                      }
                      size={14}
                      color={Colors.warning}
                    />
                  ))}
                </View>
                <Text style={styles.reviewCount}>
                  {servico.totalAvaliacoes || 0} avaliações
                </Text>
              </View>
            </View>
          </View>

          {/* Contato */}
          {(servico.telefone || servico.instagram) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="call" size={16} color={Colors.primary} /> Contato
              </Text>

              {servico.telefone && (
                <TouchableOpacity style={styles.contactItem}>
                  <Ionicons name="call-outline" size={18} color={Colors.primary} />
                  <Text style={styles.contactText}>{servico.telefone}</Text>
                </TouchableOpacity>
              )}

              {servico.instagram && (
                <TouchableOpacity style={styles.contactItem}>
                  <Ionicons
                    name="logo-instagram"
                    size={18}
                    color={Colors.primary}
                  />
                  <Text style={styles.contactText}>@{servico.instagram}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Localização */}
          {servico.endereco && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="location" size={16} color={Colors.success} /> Localização
              </Text>
              <View style={styles.locationBox}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={Colors.success}
                />
                <Text style={styles.locationText}>{servico.endereco}</Text>
              </View>
            </View>
          )}

          {/* Botões de Ação */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() =>
                navigation.navigate('Avaliacoes', {
                  tipo: 'servico',
                  referenciaId: servicoId,
                  titulo: servico.nome,
                })
              }
            >
              <Ionicons name="chatbubbles-outline" size={18} color="white" />
              <Text style={styles.primaryButtonText}>Ver Avaliações</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() =>
                Alert.alert('Editar', 'Funcionalidade em desenvolvimento')
              }
            >
              <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.highlight,
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
    color: Colors.text,
  },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  heroFallback: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {},
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  badgeContainer: { flexDirection: 'row', marginBottom: Spacing.lg },
  badge: {
    backgroundColor: '#FFD50033',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  badgeText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  description: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  ratingNumber: {
    fontFamily: FontFamily.headingBold,
    fontSize: 32,
    color: Colors.primary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: Spacing.xs,
  },
  reviewCount: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  contactText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#D1FAE533',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  locationText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  actionButtons: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  primaryButton: { backgroundColor: Colors.primary },
  primaryButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.primary,
  },
});
