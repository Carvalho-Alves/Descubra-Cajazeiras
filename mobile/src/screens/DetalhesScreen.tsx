import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export function DetalhesScreen() {
  const route = useRoute<any>();
  // "Pescando" o item passado pela HomeScreen
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.category}>{item.category}</Text>
        
        {item.date && (
          <Text style={styles.date}>
            <Ionicons name="calendar-outline" size={14} /> {item.date}
          </Text>
        )}
        
        {/* MAPA FOCADO NO DESTINO */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: item.latitude,
              longitude: item.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={true} 
            showsPointsOfInterest={false}
          >
            <Marker 
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              title={item.title}
              pinColor="red"
            />
          </MapView>
        </View>

        {/*BOTÃO DE ROTA */}
        <TouchableOpacity style={styles.routeButton} activeOpacity={0.8}>
          <Ionicons name="navigate" size={20} color={Colors.surface} />
          <Text style={styles.routeButtonText}>Mostrar Rota</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
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
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  map: {
    flex: 1,
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