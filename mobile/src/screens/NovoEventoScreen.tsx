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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

import { Colors } from '../theme/colors';
import { CAJAZEIRAS_CENTER, CAJAZEIRAS_BOUNDS } from '../config/api';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { createEventoRequest } from '../services/eventoService';
import { ApiError } from '../services/apiClient';

import { CustomHeader } from '../components/CustomHeader';
import { CustomInput } from '../components/CustomInput';
import { ImagePickerBox } from '../components/ImagePickerBox';

const CAJAZEIRAS_INITIAL_REGION = {
  latitude: CAJAZEIRAS_CENTER.latitude,
  longitude: CAJAZEIRAS_CENTER.longitude,
};

export function NovoEventoScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [dataInput, setDataInput] = useState('');
  const [horaInput, setHoraInput] = useState('');
  const [dateObj, setDateObj] = useState(new Date());

  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);

  const [latitude, setLatitude] = useState(CAJAZEIRAS_INITIAL_REGION.latitude.toString());
  const [longitude, setLongitude] = useState(CAJAZEIRAS_INITIAL_REGION.longitude.toString());
  const [endereco, setEndereco] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDataChange = (text: string) => {
    let formatted = text.replace(/\D/g, '');
    if (formatted.length > 2) formatted = formatted.replace(/^(\d{2})(\d)/, '$1/$2');
    if (formatted.length > 5) formatted = formatted.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    setDataInput(formatted);
  };

  const handleHoraChange = (text: string) => {
    let formatted = text.replace(/\D/g, '');
    if (formatted.length > 2) formatted = formatted.replace(/^(\d{2})(\d)/, '$1:$2');
    setHoraInput(formatted);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateObj;
    if (Platform.OS === 'android') setShowPicker(false);

    if (event.type === 'set' && selectedDate) {
      setDateObj(currentDate);
      if (mode === 'date') {
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();
        setDataInput(`${day}/${month}/${year}`);
      } else {
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        setHoraInput(`${hours}:${minutes}`);
      }
    }
  };

  const showMode = (currentMode: 'date' | 'time') => {
    setShowPicker(true);
    setMode(currentMode);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão', 'Autorize o acesso à galeria para enviar foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
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

      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (addresses.length > 0) {
          const addr = addresses[0];
          setEndereco(`${addr.street || ''} ${addr.streetNumber || ''}`.trim());
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
        Alert.alert('Atenção', 'Este endereço está fora de Cajazeiras.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível buscar este endereço.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude: lat, longitude: long } = e.nativeEvent.coordinate;
    setLatitude(lat.toFixed(6));
    setLongitude(long.toFixed(6));
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe o nome do evento.');
      return;
    }
    const dataMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataInput);
    if (!dataMatch) {
      Alert.alert('Atenção', 'Digite ou selecione uma data válida (DD/MM/AAAA).');
      return;
    }

    let dateToSend = new Date();
    dateToSend.setFullYear(Number(dataMatch[3]), Number(dataMatch[2]) - 1, Number(dataMatch[1]));

    if (horaInput.trim()) {
      const horaMatch = /^(\d{2}):(\d{2})$/.exec(horaInput);
      if (!horaMatch) {
        Alert.alert('Atenção', 'Digite ou selecione um horário válido (HH:MM).');
        return;
      }
      dateToSend.setHours(Number(horaMatch[1]), Number(horaMatch[2]), 0, 0);
    } else {
      dateToSend.setHours(0, 0, 0, 0);
    }

    setSaving(true);
    try {
      await createEventoRequest(
        {
          nome: nome.trim(),
          descricao: descricao.trim() || undefined,
          data: dateToSend.toISOString(),
          latitude: Number(latitude),
          longitude: Number(longitude),
          imageUri,
        },
        token
      );
      Alert.alert('Sucesso', 'Evento cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError ? error.message : 'Não foi possível salvar o evento.'
      );
    } finally {
      setSaving(false);
    }
  };

  const parsedLat = parseFloat(latitude) || CAJAZEIRAS_INITIAL_REGION.latitude;
  const parsedLong = parseFloat(longitude) || CAJAZEIRAS_INITIAL_REGION.longitude;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <CustomHeader
        title="Novo Evento"
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        isSaving={saving}
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ImagePickerBox
            imageUri={imageUri}
            onPress={pickImage}
            placeholderText="Toque para adicionar uma foto do evento"
          />

          <CustomInput
            label="Nome do Evento"
            placeholder="Digite o nome"
            value={nome}
            onChangeText={setNome}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Data do Evento</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={Colors.muted}
                  value={dataInput}
                  onChangeText={handleDataChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <TouchableOpacity onPress={() => showMode('date')} style={styles.iconButton}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Horário</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.muted}
                  value={horaInput}
                  onChangeText={handleHoraChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TouchableOpacity onPress={() => showMode('time')} style={styles.iconButton}>
                  <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {showPicker && (
            <DateTimePicker
              value={dateObj}
              mode={mode}
              is24Hour={true}
              display="default"
              onChange={onChangeDate}
            />
          )}

          <CustomInput
            label="Descrição (Opcional)"
            placeholder="Descreva o evento..."
            value={descricao}
            onChangeText={setDescricao}
            multiline
            textAlignVertical="top"
            style={styles.textarea}
          />

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

            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleGetCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <View style={styles.gpsButtonInner}>
                  <Ionicons name="location-outline" size={18} color={Colors.primary} />
                  <Text style={styles.gpsButtonText}>Usar Minha Localização Atual</Text>
                </View>
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
                >
                  <Marker
                    draggable
                    coordinate={{ latitude: parsedLat, longitude: parsedLong }}
                    onDragEnd={handleMapPress}
                    title="Localização do Evento"
                  />
                </MapView>
              ) : (
                <View style={[styles.map, styles.mapFallback]}>
                  <Text style={{ color: Colors.textSecondary }}>Mapa indisponível</Text>
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
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  field: { gap: Spacing.sm },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSize.sm,
    color: '#4B5563',
    marginBottom: Spacing.sm,
  },
  helperText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  inputFlex: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  iconButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textarea: { minHeight: 96 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  addressInputContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
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
  gpsButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F0E6FF',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 8,
  },
  gpsButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  map: { flex: 1 },
  mapFallback: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});