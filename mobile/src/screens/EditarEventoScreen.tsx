import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

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
import { getEventoById, updateEventoRequest, EventoStatus } from '../services/eventoService';
import { ApiError } from '../services/apiClient';
import { firstImage } from '../utils/resolveAssetUrl';

import { CustomHeader } from '../components/CustomHeader';
import { CustomInput } from '../components/CustomInput';
import { ImagePickerBox } from '../components/ImagePickerBox';

const STATUS_OPCOES = ['ativo', 'cancelado', 'encerrado'] as const;

export function EditarEventoScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { eventoId } = route.params;
  const { token } = useAuth();

  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [status, setStatus] = useState<EventoStatus>('ativo');

  const [dataInput, setDataInput] = useState('');
  const [horaInput, setHoraInput] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);

  const [latitude, setLatitude] = useState(CAJAZEIRAS_CENTER.latitude.toString());
  const [longitude, setLongitude] = useState(CAJAZEIRAS_CENTER.longitude.toString());
  const [endereco, setEndereco] = useState('');

  const [errorNome, setErrorNome] = useState('');
  const [errorData, setErrorData] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getEventoById(eventoId, token);
        setNome(data.nome);
        setDescricao(data.descricao || '');
        
        const evtDate = new Date(data.data);
        setDateObj(evtDate);
        
        // Lógica para forçar 'encerrado' se a data já passou do dia atual
        const now = new Date();
        if (evtDate < now && data.status !== 'cancelado') {
          setStatus('encerrado');
        } else {
          setStatus(data.status || 'ativo');
        }

        const day = String(evtDate.getDate()).padStart(2, '0');
        const month = String(evtDate.getMonth() + 1).padStart(2, '0');
        setDataInput(`${day}/${month}/${evtDate.getFullYear()}`);
        
        setHoraInput(data.horario || '');

        const rawData = data as any;
        const lat = rawData.localizacao?.latitude || rawData.latitude;
        const lng = rawData.localizacao?.longitude || rawData.longitude;

        if (lat && lng) {
          setLatitude(lat.toString());
          setLongitude(lng.toString());
          reverseGeocode(lat, lng);
        }

        const img = firstImage(data.imagem);
        if (img) setImageUri(img);

      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
        navigation.goBack();
      } finally {
        setLoadingInit(false);
      }
    }
    loadData();
  }, [eventoId]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (result.length > 0) setEndereco(`${result[0].street || ''} ${result[0].streetNumber || ''}`.trim());
    } catch (err) {}
  };

  const handleDataChange = (text: string) => {
    setErrorData('');
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
        setDataInput(`${day}/${month}/${currentDate.getFullYear()}`);
        
        // Verifica status automaticamente ao mudar data
        const now = new Date();
        if (currentDate < now && status !== 'cancelado') setStatus('encerrado');
        else if (currentDate >= now && status === 'encerrado') setStatus('ativo');

      } else {
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        setHoraInput(`${hours}:${minutes}`);
      }
      setErrorData('');
    }
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
        }
      }
    } catch (err) {} finally { setLoadingLocation(false); }
  };

  const handleMapPress = (e: any) => {
    setLatitude(e.nativeEvent.coordinate.latitude.toFixed(6));
    setLongitude(e.nativeEvent.coordinate.longitude.toFixed(6));
  };

  const handleSave = async () => {
    let hasError = false;
    if (!nome.trim()) { setErrorNome('O nome do evento é obrigatório.'); hasError = true; }
    
    const dataMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataInput);
    if (!dataMatch) { setErrorData('A data fornecida é inválida.'); hasError = true; }
    
    if (hasError) return;

    let dateToSend = new Date();
    dateToSend.setFullYear(Number(dataMatch![3]), Number(dataMatch![2]) - 1, Number(dataMatch![1]));
    if (horaInput.trim()) {
      const horaMatch = /^(\d{2}):(\d{2})$/.exec(horaInput);
      if (horaMatch) dateToSend.setHours(Number(horaMatch[1]), Number(horaMatch[2]), 0, 0);
    } else {
      dateToSend.setHours(0, 0, 0, 0);
    }

    setSaving(true);
    try {
      await updateEventoRequest(eventoId, {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        data: dateToSend.toISOString(),
        horario: horaInput.trim() || undefined,
        status: status,
        latitude: Number(latitude),
        longitude: Number(longitude),
        imageUri,
      }, token);
      Alert.alert('Sucesso', 'Evento atualizado!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Erro', error instanceof ApiError ? error.message : 'Falha ao atualizar.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingInit) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const parsedLat = parseFloat(latitude) || CAJAZEIRAS_CENTER.latitude;
  const parsedLong = parseFloat(longitude) || CAJAZEIRAS_CENTER.longitude;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <CustomHeader title="Editar Evento" onCancel={() => navigation.goBack()} onSave={handleSave} isSaving={saving} saveText="Atualizar" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <ImagePickerBox imageUri={imageUri} onPress={async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return;
            const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
            if (!res.canceled && res.assets[0]?.uri) setImageUri(res.assets[0].uri);
          }} />

          {/* NOVO CAMPO: Seleção de Status */}
          <View style={styles.field}>
            <Text style={styles.label}>Status do Evento</Text>
            <View style={styles.statusContainer}>
              {STATUS_OPCOES.map((opt) => (
                <TouchableOpacity 
                  key={opt} 
                  style={[styles.statusButton, status === opt && styles.statusButtonActive]} 
                  onPress={() => setStatus(opt)}
                >
                  <Text style={[styles.statusText, status === opt && styles.statusTextActive]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <CustomInput label="Nome do Evento" value={nome} onChangeText={(txt: string) => { setNome(txt); setErrorNome(''); }} error={errorNome} />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Data</Text>
              <View style={[styles.inputWithIcon, errorData ? { borderColor: '#DC3545'} : null]}>
                <TextInput style={styles.inputFlex} value={dataInput} onChangeText={handleDataChange} keyboardType="numeric" maxLength={10} />
                <TouchableOpacity onPress={() => { setShowPicker(true); setMode('date'); }} style={styles.iconButton}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errorData ? <Text style={styles.errorText}>{errorData}</Text> : null}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Horário</Text>
              <View style={styles.inputWithIcon}>
                <TextInput style={styles.inputFlex} value={horaInput} onChangeText={handleHoraChange} keyboardType="numeric" maxLength={5} />
                <TouchableOpacity onPress={() => { setShowPicker(true); setMode('time'); }} style={styles.iconButton}>
                  <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {showPicker && <DateTimePicker value={dateObj} mode={mode} is24Hour={true} display="default" onChange={onChangeDate} />}

          <CustomInput label="Descrição" value={descricao} onChangeText={setDescricao} multiline textAlignVertical="top" style={styles.textarea} />

          <View style={styles.field}>
            <Text style={styles.label}>Endereço</Text>
            <View style={styles.addressInputContainer}>
              <TextInput style={styles.addressInput} value={endereco} onChangeText={setEndereco} />
              <TouchableOpacity style={styles.searchBtn} onPress={handleGeocodeAddress}>
                <Ionicons name="search" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Localização no Mapa</Text>
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
  safe: { flex: 1, backgroundColor: Colors.background }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, flex: { flex: 1 }, content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.lg }, field: { gap: Spacing.sm }, label: { fontFamily: 'Poppins_600SemiBold', fontSize: FontSize.sm, color: '#4B5563', marginBottom: Spacing.sm }, inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: BorderRadius.md, overflow: 'hidden' }, inputFlex: { flex: 1, paddingHorizontal: Spacing.lg, paddingVertical: 14, fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: Colors.text }, iconButton: { paddingHorizontal: Spacing.md, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' }, textarea: { minHeight: 96 }, row: { flexDirection: 'row', justifyContent: 'space-between' }, addressInputContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, addressInput: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: 12, fontFamily: FontFamily.bodyRegular, fontSize: FontSize.md, color: Colors.text }, searchBtn: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: '#F0E6FF', borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, mapContainer: { height: 180, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E5E5' }, map: { flex: 1 }, errorText: { color: '#DC3545', fontSize: 12, fontFamily: FontFamily.bodyRegular },
  statusContainer: { flexDirection: 'row', gap: 8 },
  statusButton: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  statusButtonActive: { backgroundColor: Colors.highlight, borderColor: Colors.highlight },
  statusText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: Colors.textSecondary },
  statusTextActive: { color: Colors.surface, fontFamily: FontFamily.headingSemiBold },
});