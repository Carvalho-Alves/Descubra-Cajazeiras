import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MediaViewer } from '../components/MediaViewer';
import { firstImage } from '../utils/resolveAssetUrl';

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Polyline = maps.Polyline;
}

export function DetalhesScreen() {
  const route = useRoute<any>();
  const { item } = route.params;

  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapRef = useRef<any>(null);

  const destLat =
    Number(item?.localizacao?.latitude || item?.latitude) || -6.8889;
  const destLong =
    Number(item?.localizacao?.longitude || item?.longitude) || -38.5606;
  const isEvent = item?.tipo_servico === 'Eventos';
  const mediaUri = firstImage(item?.imagem);

  const horarioServico =
    item?.horario || item?.horario_funcionamento || item?.funcionamento;

  const handleShowRoute = async () => {
    try {
      setLoadingRoute(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão', 'Precisamos do GPS para traçar a rota.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userLat = location.coords.latitude;
      const userLong = location.coords.longitude;

      setUserCoords({ latitude: userLat, longitude: userLong });

      const url = `https://router.project-osrm.org/route/v1/driving/${userLong},${userLat};${destLong},${destLat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].geometry.coordinates.map(
          (coord: number[]) => ({
            latitude: coord[1],
            longitude: coord[0],
          }),
        );

        setRouteCoordinates(points);
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(
            [
              { latitude: userLat, longitude: userLong },
              { latitude: destLat, longitude: destLong },
            ],
            {
              edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
              animated: true,
            },
          );
        }, 100);
      } else {
        Alert.alert(
          'Aviso',
          'Não foi possível calcular a rota para este local!',
        );
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível buscar rota. Verifique sua conexão!');
    } finally {
      setLoadingRoute(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} às ${hours}h${minutes}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.mediaWrap}>
        <MediaViewer uri={mediaUri} style={styles.media} imageStyle={styles.media} />
      </View>

      <Text style={styles.title}>{item?.nome}</Text>
      <Text style={styles.category}>{item?.tipo_servico}</Text>

      {isEvent && item?.data && (
        <Text style={styles.infoText}>
          <Ionicons name="calendar-outline" size={14} /> {formatDate(item.data)}
        </Text>
      )}

      {!isEvent && horarioServico && (
        <Text style={styles.infoText}>
          <Ionicons name="time-outline" size={14} /> {horarioServico}
        </Text>
      )}

      {item?.telefone && (
        <Text style={styles.infoText}>
          <Ionicons name="call-outline" size={14} /> {item.telefone}
        </Text>
      )}

      {item?.descricao && (
        <Text style={styles.description}>{item.descricao}</Text>
      )}

      <View style={styles.mapContainer}>
        {MapView ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: destLat,
              longitude: destLong,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation
            showsPointsOfInterest={false}
          >
            <Marker
              coordinate={{ latitude: destLat, longitude: destLong }}
              title={item?.nome}
              pinColor="red"
            />

            {userCoords && (
              <Marker
                coordinate={userCoords}
                title="Sua Posição"
                pinColor="blue"
              />
            )}

            {routeCoordinates.length > 0 && Polyline && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={5}
                strokeColor={Colors.primary}
              />
            )}
          </MapView>
        ) : (
          <View style={[styles.map, styles.mapFallback]}>
            <Text style={styles.fallbackText}>Mapa indisponível nesta plataforma</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.routeButton, loadingRoute && { opacity: 0.7 }]}
        activeOpacity={0.8}
        onPress={handleShowRoute}
        disabled={loadingRoute}
      >
        {loadingRoute ? (
          <ActivityIndicator color={Colors.surface} />
        ) : (
          <>
            <Ionicons name="navigate" size={20} color={Colors.surface} />
            <Text style={styles.routeButtonText}>
              {routeCoordinates.length > 0 ? 'Recalcular Rota' : 'Mostrar Rota'}
            </Text>
          </>
        )}
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
    paddingBottom: 32,
  },
  mediaWrap: {
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 16,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 23,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: Colors.primary,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontFamily: 'Poppins_400Regular',
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 4,
    marginBottom: 16,
    fontFamily: 'Poppins_400Regular',
  },
  mapContainer: {
    height: 260,
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  map: {
    flex: 1,
  },
  mapFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  fallbackText: {
    color: Colors.textSecondary,
    fontFamily: 'Poppins_400Regular',
  },
  routeButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  routeButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
});
