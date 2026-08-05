import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, MapPressEvent, MarkerDragStartEndEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const CATEGORIES = ['Eventos', 'Gastronomia', 'Hospedagem'];

const CAJAZEIRAS_INITIAL_REGION = {
  latitude: -6.8889,
  longitude: -38.5606,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export function NovoServicoScreen() {
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Eventos');
  const [image, setImage] = useState('');

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);
  const [dateText, setDateText] = useState('');

  const [operatingHours, setOperatingHours] = useState('');

  const [latitude, setLatitude] = useState('-6.8889');
  const [longitude, setLongitude] = useState('-38.5606');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

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
      quality: 0.7,
    });

    if (!result.canceled) {
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

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toFixed(6));
      setLongitude(location.coords.longitude.toFixed(6));
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

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o título.');
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
      Alert.alert('Atenção', 'Por favor, escolha uma foto para o cadastro.');
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert('Atenção', 'Por favor, selecione uma localização no mapa.');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      title: title,
      category: category,
      date: category === 'Eventos' ? dateText : operatingHours,
      image: image,
      latitude: Number.parseFloat(latitude),
      longitude: Number.parseFloat(longitude),
    };

    console.log('NOVO ITEM CADASTRADO:', newItem);
    Alert.alert('Sucesso!', 'Cadastro realizado com sucesso!');
    navigation.goBack();
  };

  const parsedLat = parseFloat(latitude) || CAJAZEIRAS_INITIAL_REGION.latitude;
  const parsedLong = parseFloat(longitude) || CAJAZEIRAS_INITIAL_REGION.longitude;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Novo Cadastro</Text>
      <Text style={styles.headerSubtitle}>Preencha os dados do local ou evento</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Show na Praça"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                category === cat && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {category === 'Eventos' ? (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data e Horário</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.input, { flex: 1, marginRight: 8, alignItems: 'center' }]} 
              onPress={() => showMode('date')}
            >
              <Ionicons name="calendar-outline" size={20} color={dateText ? Colors.primary : Colors.textSecondary} />
              <Text style={{ color: dateText ? Colors.text : Colors.textSecondary, marginTop: 4 }}>
                {dateText ? dateText.split(' · ')[0] : 'Selecionar Data'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.input, { flex: 1, marginLeft: 8, alignItems: 'center' }]} 
              onPress={() => showMode('time')}
            >
              <Ionicons name="time-outline" size={20} color={dateText ? Colors.primary : Colors.textSecondary} />
              <Text style={{ color: dateText ? Colors.text : Colors.textSecondary, marginTop: 4 }}>
                {dateText ? dateText.split(' · ')[1] : 'Selecionar Hora'}
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
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dias e Horários de Funcionamento</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Seg a Sáb · 08h às 18h"
            value={operatingHours}
            onChangeText={setOperatingHours}
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Foto do Local/Evento</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImage}>
          <Ionicons name="images-outline" size={24} color={Colors.primary} />
          <Text style={styles.imagePickerText}>Escolher Foto da Galeria</Text>
        </TouchableOpacity>

        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Localização no Mapa</Text>
        <Text style={styles.helperText}>
          Clique no botão abaixo para usar seu GPS ou toque no mapa para posicionar o marcador.
        </Text>

        <TouchableOpacity
          style={styles.gpsButton}
          onPress={handleGetCurrentLocation}
          disabled={loadingLocation}
        >
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

      <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={handleSave}>
        <Ionicons name="checkmark-circle" size={24} color={Colors.surface} />
        <Text style={styles.saveButtonText}>Salvar Cadastro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.surface,
    fontFamily: 'Poppins_600SemiBold',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F0E6FF',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 12,
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
  map: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 14,
    justifyContent: 'center',
    gap: 8,
  },
  imagePickerText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 12,
  },
});