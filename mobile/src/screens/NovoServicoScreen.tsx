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
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker, MapPressEvent, MarkerDragStartEndEvent } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://192.168.1.74:3333';

const CATEGORIES = ['Eventos', 'Hospedagem', 'Alimentação/Lazer', 'Ponto Turístico'];

const CAJAZEIRAS_INITIAL_REGION = {
  latitude: -6.8889,
  longitude: -38.5606,
};

export function NovoServicoScreen() {
  const navigation = useNavigation();
  const { token } = useAuth(); 

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Eventos');
  const [descricao, setDescricao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);
  const [dateText, setDateText] = useState('');
  const [operatingHours, setOperatingHours] = useState('');

  const [latitude, setLatitude] = useState(CAJAZEIRAS_INITIAL_REGION.latitude.toString());
  const [longitude, setLongitude] = useState(CAJAZEIRAS_INITIAL_REGION.longitude.toString());
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [saving, setSaving] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') setShowPicker(false);
    
    if (event.type === 'set' && selectedDate) {
      setDate(currentDate);
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      setDateText(`${day}/${month}/${year} · ${hours}h${minutes}`);
    }
  };

  const showMode = (currentMode: 'date' | 'time') => {
    setShowPicker(true);
    setMode(currentMode);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão', 'Precisamos acessar sua galeria para escolher uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    } catch {
      Alert.alert('Erro', 'Não foi possível obter sua localização atual.');
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
    if (!title.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o nome do local ou evento.');
      return;
    }
    if (category === 'Eventos' && !dateText) {
      Alert.alert('Atenção', 'Por favor, selecione a data e o horário do evento.');
      return;
    }
    if (category !== 'Eventos' && !operatingHours.trim()) {
      Alert.alert('Atenção', 'Por favor, digite os dias e horário de funcionamento.');
      return;
    }
    if (!image) {
      Alert.alert('Atenção', 'Por favor, escolha uma foto.');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('nome', title.trim());
      
      if (descricao.trim()) formData.append('descricao', descricao.trim());
      if (telefone.trim()) formData.append('telefone', telefone.trim());

      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('imagem', {
        uri: image,
        name: filename || 'foto.jpg',
        type: type,
      } as any);

      let endpoint = '';

      if (category === 'Eventos') {
        endpoint = `${BASE_URL}/api/eventos`;
        formData.append('data', date.toISOString());
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        formData.append('categoria', category); 
      } else {
        endpoint = `${BASE_URL}/api/servicos`;
        formData.append('horario', operatingHours);
        formData.append('tipo_servico', category);
        formData.append('localizacao', JSON.stringify({ 
          latitude: Number(latitude), 
          longitude: Number(longitude) 
        }));
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, 
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      Alert.alert('Sucesso!', 'Cadastro realizado no banco com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
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
        <Text style={styles.headerTitle}>Novo Cadastro</Text>
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
            <Text style={styles.label}>Nome do Estabelecimento / Evento</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome"
              placeholderTextColor={Colors.muted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {category === 'Eventos' ? (
            <View style={styles.field}>
              <Text style={styles.label}>Data e Horário</Text>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.input, { flex: 1, marginRight: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }]} onPress={() => showMode('date')}>
                  <Ionicons name="calendar-outline" size={20} color={dateText ? Colors.primary : Colors.textSecondary} />
                  <Text style={{ color: dateText ? Colors.text : Colors.textSecondary }}>
                    {dateText ? dateText.split(' · ')[0] : 'Data'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.input, { flex: 1, marginLeft: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }]} onPress={() => showMode('time')}>
                  <Ionicons name="time-outline" size={20} color={dateText ? Colors.primary : Colors.textSecondary} />
                  <Text style={{ color: dateText ? Colors.text : Colors.textSecondary }}>
                    {dateText ? dateText.split(' · ')[1] : 'Hora'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode={mode}
                  is24Hour={true}
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>
          ) : (
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
          )}

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
                  onDragEnd={handleMarkerDragEnd}
                  title="Localização"
                />
              </MapView>
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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
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