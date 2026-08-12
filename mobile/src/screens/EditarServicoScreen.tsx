import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';

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
import { useAuth } from '../context/AuthContext';
import { getServicoById, updateServicoRequest } from '../services/servicoService';
import { ApiError } from '../services/apiClient';
import { firstImage } from '../utils/resolveAssetUrl';
import { CAJAZEIRAS_CENTER, CAJAZEIRAS_BOUNDS } from '../config/api';

import { CustomHeader } from '../components/CustomHeader';
import { CustomInput } from '../components/CustomInput';
import { ImagePickerBox } from '../components/ImagePickerBox';

const CATEGORIES = ['Hospedagem', 'Alimentação/Lazer', 'Ponto Turístico'];

export function EditarServicoScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { servicoId } = route.params;
  const { token } = useAuth();

  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [descricao, setDescricao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [latitude, setLatitude] = useState(CAJAZEIRAS_CENTER.latitude.toString());
  const [longitude, setLongitude] = useState(CAJAZEIRAS_CENTER.longitude.toString());
  const [endereco, setEndereco] = useState('');

  const [errorNome, setErrorNome] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getServicoById(servicoId, token);
        setTitle(data.nome);
        setCategory(CATEGORIES.includes(data.tipo_servico) ? data.tipo_servico : CATEGORIES[0]);
        setDescricao(data.descricao || '');
        setTelefone(data.telefone || data.contato?.telefone || '');
        setOperatingHours(data.horario || data.horario_funcionamento || data.funcionamento || '');
        
        if (data.localizacao) {
          setLatitude(data.localizacao.latitude.toString());
          setLongitude(data.localizacao.longitude.toString());
          reverseGeocode(data.localizacao.latitude, data.localizacao.longitude);
        }
        
        const img = firstImage(data.imagem);
        if (img) setImage(img);

      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
        navigation.goBack();
      } finally {
        setLoadingInit(false);
      }
    }
    loadData();
  }, [servicoId]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (result.length > 0) {
        setEndereco(`${result[0].street || ''} ${result[0].streetNumber || ''}`.trim());
      }
    } catch (err) {}
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled && result.assets[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Erro', 'Permissão negada.');
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude.toFixed(6));
      setLongitude(loc.coords.longitude.toFixed(6));
      reverseGeocode(loc.coords.latitude, loc.coords.longitude);
    } catch (err) {} finally { setLoadingLocation(false); }
  };

  const handleGeocodeAddress = async () => {
    if (!endereco.trim()) return;
    setLoadingLocation(true);
    try {
      const results = await Location.geocodeAsync(endereco.trim());
      if (results.length > 0) {
        const { latitude: lat, longitude: lng } = results[0];
        if (lat >= CAJAZEIRAS_BOUNDS.minLat && lat <= CAJAZEIRAS_BOUNDS.maxLat && lng >= CAJAZEIRAS_BOUNDS.minLng && lng <= CAJAZEIRAS_BOUNDS.maxLng) {
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));
        } else {
          Alert.alert('Atenção', 'Endereço fora de Cajazeiras.');
        }
      }
    } catch (err) {} finally { setLoadingLocation(false); }
  };

  const handleMapPress = (e: any) => {
    setLatitude(e.nativeEvent.coordinate.latitude.toFixed(6));
    setLongitude(e.nativeEvent.coordinate.longitude.toFixed(6));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorNome('O nome do serviço é obrigatório.');
      return;
    }
    setErrorNome('');
    setSaving(true);
    try {
      await updateServicoRequest(servicoId, {
        nome: title.trim(),
        descricao: descricao.trim() || undefined,
        tipo_servico: category,
        telefone: telefone.trim() || undefined,
        horario: operatingHours.trim() || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        imageUri: image,
      }, token);
      Alert.alert('Sucesso', 'Serviço atualizado!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Erro', error instanceof ApiError ? error.message : 'Falha ao atualizar.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingInit) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const parsedLat = parseFloat(latitude) || CAJAZEIRAS_CENTER.latitude;
  const parsedLong = parseFloat(longitude) || CAJAZEIRAS_CENTER.longitude;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <CustomHeader title="Editar Serviço" onCancel={() => navigation.goBack()} onSave={handleSave} isSaving={saving} saveText="Atualizar" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ImagePickerBox imageUri={image} onPress={handlePickImage} />

          <View style={styles.field}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat} style={[styles.categoryButton, category === cat && styles.categoryButtonActive]} onPress={() => setCategory(cat)}>
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <CustomInput label="Nome do Estabelecimento" value={title} onChangeText={(txt: string) => { setTitle(txt); setErrorNome(''); }} error={errorNome} />
          <CustomInput label="Dias e Horários de Funcionamento" value={operatingHours} onChangeText={setOperatingHours} />
          <CustomInput label="Descrição (Opcional)" value={descricao} onChangeText={setDescricao} multiline textAlignVertical="top" style={styles.textarea} />
          <CustomInput label="Telefone (Opcional)" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

          <View style={styles.field}>
            <Text style={styles.label}>Endereço</Text>
            <View style={styles.addressInputContainer}>
              <TextInput style={styles.addressInput} value={endereco} onChangeText={setEndereco} />
              <TouchableOpacity style={styles.searchBtn} onPress={handleGeocodeAddress} disabled={loadingLocation}>
                {loadingLocation ? <ActivityIndicator color={Colors.primary} size={20} /> : <Ionicons name="search" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Localização no Mapa</Text>
            <TouchableOpacity style={styles.gpsButton} onPress={handleGetCurrentLocation} disabled={loadingLocation}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={styles.gpsButtonText}>Usar Minha Localização Atual</Text>
            </TouchableOpacity>
            <View style={styles.mapContainer}>
              {MapView && (
                <MapView style={styles.map} region={{ latitude: parsedLat, longitude: parsedLong, latitudeDelta: 0.01, longitudeDelta: 0.01 }} onPress={handleMapPress}>
                  <Marker draggable coordinate={{ latitude: parsedLat, longitude: parsedLong }} onDragEnd={handleMapPress} />
                </MapView>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, flex: { flex: 1 }, content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.lg }, field: { gap: Spacing.sm }, label: { fontFamily: 'Poppins_600SemiBold', fontSize: FontSize.sm, color: '#4B5563', marginBottom: Spacing.sm }, addressInputContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, addressInput: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: 12, fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: Colors.text }, searchBtn: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: '#F0E6FF', borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, textarea: { minHeight: 96 }, categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, categoryButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E5E5E5' }, categoryButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary }, categoryText: { fontSize: 14, color: Colors.textSecondary }, categoryTextActive: { color: Colors.surface, fontFamily: 'Poppins_600SemiBold' }, gpsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#F0E6FF', borderWidth: 1, borderColor: Colors.primary, marginBottom: 8, gap: 6 }, gpsButtonText: { color: Colors.primary, fontSize: 14, fontFamily: 'Poppins_600SemiBold' }, mapContainer: { height: 180, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E5E5' }, map: { flex: 1 },
});