import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

// MapView: web usa placeholder, mobile nativo usa MapView
let MapView: any = null;
let Marker: any = null;
let MapPressEvent: any = null;
let MarkerDragStartEndEvent: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { createServicoRequest } from '../services/servicoService';
import { ApiError } from '../services/apiClient';
import { useFormValidation, servicoSchema } from '../hooks/useFormValidation';
import { CAJAZEIRAS_CENTER, CAJAZEIRAS_BOUNDS } from '../config/api';

const CATEGORIES = ['Hospedagem', 'Alimentação/Lazer', 'Ponto Turístico'];

const CAJAZEIRAS_INITIAL_REGION = {
  latitude: CAJAZEIRAS_CENTER.latitude,
  longitude: CAJAZEIRAS_CENTER.longitude,
};

export function NovoServicoScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const { validateField } = useFormValidation();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [descricao, setDescricao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [latitude, setLatitude] = useState(CAJAZEIRAS_INITIAL_REGION.latitude.toString());
  const [longitude, setLongitude] = useState(CAJAZEIRAS_INITIAL_REGION.longitude.toString());
  const [endereco, setEndereco] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão', 'Precisamos acessar sua galeria para escolher uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão', 'Precisamos de permissão do GPS para pegar sua localização.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude.toFixed(6));
      setLongitude(loc.coords.longitude.toFixed(6));

      // Buscar endereço reverso
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (addresses.length > 0) {
          const addr = addresses[0];
          const enderecoFormatado = `${addr.street || ''} ${addr.streetNumber || ''}`.trim();
          setEndereco(enderecoFormatado);
        }
      } catch (err) {
        console.warn('Erro ao buscar endereço reverso:', err);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível obter sua localização atual.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleGeocodeAddress = async () => {
    if (!endereco.trim()) {
      Alert.alert('Atenção', 'Digite um endereço para buscar.');
      return;
    }

    try {
      setLoadingLocation(true);
      const results = await Location.geocodeAsync(endereco.trim());

      if (results.length === 0) {
        Alert.alert('Não encontrado', 'Endereço não encontrado. Tente outro.');
        return;
      }

      const { latitude: lat, longitude: lng } = results[0];

      // Verificar se está dentro dos bounds de Cajazeiras
      if (
        lat >= CAJAZEIRAS_BOUNDS.minLat &&
        lat <= CAJAZEIRAS_BOUNDS.maxLat &&
        lng >= CAJAZEIRAS_BOUNDS.minLng &&
        lng <= CAJAZEIRAS_BOUNDS.maxLng
      ) {
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        Alert.alert('Sucesso', 'Localização atualizada!');
      } else {
        Alert.alert('Atenção', 'Este endereço está fora de Cajazeiras. Use um endereço na cidade.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível geocodificar este endereço.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude: lat, longitude: long } = e.nativeEvent.coordinate;
    setLatitude(lat.toFixed(6));
    setLongitude(long.toFixed(6));
  };

  const handleMarkerDragEnd = (e: MarkerDragStartEndEvent) => {
    const { latitude: lat, longitude: long } = e.nativeEvent.coordinate;
    setLatitude(lat.toFixed(6));
    setLongitude(long.toFixed(6));
  };

  const handleSave = async () => {
    if (!image) {
      Alert.alert('Atenção', 'Por favor, escolha uma foto.');
      return;
    }

    // Validar dados com Yup
    const { isValid, errors: validationErrors } = await validateField(servicoSchema, {
      nome: title.trim(),
      tipo_servico: category,
      descricao: descricao.trim(),
      telefone: telefone.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    if (!isValid) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      Alert.alert('Validação', firstError || 'Preencha os campos corretamente');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await createServicoRequest(
        {
          nome: title.trim(),
          descricao: descricao.trim() || undefined,
          tipo_servico: category,
          telefone: telefone.trim() || undefined,
          horario: operatingHours.trim() || undefined,
          latitude: Number(latitude),
          longitude: Number(longitude),
          imageUri: image,
        },
        token,
      );

      Alert.alert('Sucesso!', 'Serviço cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar os dados do serviço.',
      );
    } finally {
      setSaving(false);
    }
  };

  const parsedLat = parseFloat(latitude) || CAJAZEIRAS_INITIAL_REGION.latitude;
  const parsedLong = parseFloat(longitude) || CAJAZEIRAS_INITIAL_REGION.longitude;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={styles.cancel}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Serviço</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.save}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity style={styles.upload} onPress={handlePickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.preview} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={48} color={Colors.muted} />
                <Text style={styles.uploadText}>Toque para adicionar uma foto</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.field}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nome do Estabelecimento</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome"
              placeholderTextColor={Colors.muted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Dias e Horários de Funcionamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Seg a Sáb · 08h às 18h"
              placeholderTextColor={Colors.muted}
              value={operatingHours}
              onChangeText={setOperatingHours}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descrição (Opcional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Descreva os detalhes..."
              placeholderTextColor={Colors.muted}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telefone (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={Colors.muted}
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Endereço (Opcional)</Text>
            <View style={styles.addressInputContainer}>
              <TextInput
                style={styles.addressInput}
                placeholder="Rua, número, bairro..."
                placeholderTextColor={Colors.muted}
                value={endereco}
                onChangeText={setEndereco}
              />
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={handleGeocodeAddress}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <ActivityIndicator color={Colors.primary} size={20} />
                ) : (
                  <Ionicons name="search" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Digite o endereço e clique na lupa. Deve estar em Cajazeiras!
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Localização no Mapa</Text>
            <Text style={styles.helperText}>
              Toque no botão abaixo para usar o GPS ou segure o pino para mover.
            </Text>

            <TouchableOpacity style={styles.gpsButton} onPress={handleGetCurrentLocation} disabled={loadingLocation}>
              {loadingLocation ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="location-outline" size={18} color={Colors.primary} />
                  <Text style={styles.gpsButtonText}>Usar Minha Localização Atual</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.mapContainer}>
              {MapView ? (
                <MapView
                  style={styles.map}
                  region={{
                    latitude: parsedLat,
                    longitude: parsedLong,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={handleMapPress}
                  minZoomLevel={11}
                  maxZoomLevel={18}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker
                    draggable
                    coordinate={{ latitude: parsedLat, longitude: parsedLong }}
                    onDragEnd={handleMarkerDragEnd}
                    title="Localização"
                  />
                </MapView>
              ) : (
                <View style={[styles.map, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: Colors.textSecondary }}>Mapa disponível apenas em mobile</Text>
                  <Text style={{ color: Colors.textSecondary, fontSize: 12, marginTop: 8 }}>
                    {endereco || 'Endereço não definido'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  cancel: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: '#4B5563' },
  headerTitle: { fontFamily: FontFamily.headingSemiBold, fontSize: 17, color: Colors.text },
  save: { fontFamily: FontFamily.headingSemiBold, fontSize: FontSize.md, color: Colors.primary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  upload: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: 160 },
  uploadText: { marginTop: Spacing.md, fontFamily: FontFamily.bodyRegular, fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  field: { gap: Spacing.sm },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: FontSize.sm, color: '#4B5563' },
  helperText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  addressInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F0E6FF',
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  textarea: { minHeight: 96 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E5E5E5' },
  categoryButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontSize: 14, color: Colors.textSecondary },
  categoryTextActive: { color: Colors.surface, fontFamily: 'Poppins_600SemiBold' },
  gpsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#F0E6FF', borderWidth: 1, borderColor: Colors.primary, marginBottom: 8, gap: 6 },
  gpsButtonText: { color: Colors.primary, fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
  mapContainer: { height: 180, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E5E5' },
  map: { flex: 1 },
});