import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import type { SobreScreenProps } from '../navigation/types';

type InfoCard = {
  id: string;
  label: string;
  value: string;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const INFO_CARDS: InfoCard[] = [
  { id: '1', icon: 'people', label: 'População', value: '60k+', color: Colors.primary },
  { id: '2', icon: 'business', label: 'Pontos Turísticos', value: '25+', color: Colors.success },
  { id: '3', icon: 'trending-up', label: 'Turismo Forte', value: '100%', color: Colors.warning },
  { id: '4', icon: 'location', label: 'Localização', value: 'Paraíba', color: Colors.error },
];

const MOTIVOS = [
  'Rica história e cultura nordestina',
  'Gastronomia regional autêntica',
  'Hospitalidade única do povo cajazeirense',
  'Eventos culturais e festas tradicionais',
];

const COVER_URI =
  'https://images.unsplash.com/photo-1768061002212-26797b45b893?auto=format&fit=crop&w=1080&q=80';

export function SobreScreen({ navigation }: SobreScreenProps) {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.surface} />
        </Pressable>
        <Text style={styles.headerTitle}>Descubra+ Cajazeiras</Text>
        <View style={styles.headerBtn} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: COVER_URI }} style={styles.cover} resizeMode="cover" />

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Sobre o Projeto</Text>
          <Text style={styles.paragraph}>
            O <Text style={styles.bold}>Descubra+ Cajazeiras</Text> é uma plataforma
            digital criada para conectar moradores e turistas com os melhores
            serviços, eventos e pontos turísticos da cidade de Cajazeiras, Paraíba.
          </Text>
          <Text style={styles.paragraph}>
            Nossa missão é fortalecer o turismo local, valorizar os empreendedores
            da região e proporcionar experiências inesquecíveis para todos que
            visitam nossa querida cidade.
          </Text>
          <Text style={[styles.paragraph, { marginBottom: Spacing.xl }]}>
            Explore, descubra e se apaixone por Cajazeiras!
          </Text>

          <Text style={styles.subsectionTitle}>Números da Cidade</Text>
          <View style={styles.grid}>
            {INFO_CARDS.map(card => (
              <View key={card.id} style={styles.infoCard}>
                <View
                  style={[
                    styles.infoIcon,
                    { backgroundColor: `${card.color}20` },
                  ]}
                >
                  <Ionicons name={card.icon} size={24} color={card.color} />
                </View>
                <Text style={styles.infoLabel}>{card.label}</Text>
                <Text style={[styles.infoValue, { color: card.color }]}>
                  {card.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.whyBox}>
            <Text style={styles.whyTitle}>Por que visitar Cajazeiras?</Text>
            {MOTIVOS.map(motivo => (
              <View key={motivo} style={styles.whyRow}>
                <Text style={styles.whyBullet}>•</Text>
                <Text style={styles.whyText}>{motivo}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
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
  cover: {
    width: '100%',
    height: 224,
  },
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.containerPadding,
    paddingBottom: Spacing.xxxl,
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  paragraph: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: '#374151',
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  bold: {
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.text,
  },
  subsectionTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    marginBottom: Spacing.containerPadding,
  },
  infoCard: {
    width: '46%',
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: '#4B5563',
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxl,
  },
  whyBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  whyTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  whyBullet: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  whyText: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: '#374151',
    lineHeight: 20,
  },
});
