import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export function DetalhesScreen() {
    const route = useRoute<any>();
    const { item } = route.params;

    const [loadingRoute, setLoadingRoute] = useState(false);
    const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

    const mapRef = useRef<MapView>(null);

    const handleShowRoute = async () => {
        try {
            setLoadingRoute(true);
            
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão', 'Precisamos do GPS para traçar a rota.');
                setLoadingRoute(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const userLat = location.coords.latitude;
            const userLong = location.coords.longitude;

            setUserCoords({ latitude: userLat, longitude: userLong });

            const url = `https://router.project-osrm.org/route/v1/driving/${userLong},${userLat};${item.longitude},${item.latitude}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const points = data.routes[0].geometry.coordinates.map((coord: number[]) => ({
                    latitude: coord[1],
                    longitude: coord[0],
                }));

                setRouteCoordinates(points);
                setTimeout(() => {
                    mapRef.current?.fitToCoordinates(
                        [
                            { latitude: userLat, longitude: userLong },
                            { latitude: item.latitude, longitude: item.longitude },
                        ],
                        {
                            edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
                            animated: true,
                        }
                    );
                }, 100);
            } else {
                Alert.alert('Aviso', 'Não foi possível calcular a rota para este local!');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível buscar rota. Verifique sua conexão!');
        } finally {
            setLoadingRoute(false);
        }
    };

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
                        ref={mapRef}
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

                        {userCoords && (
                            <Marker
                                coordinate={userCoords}
                                title='Sua Posição'
                                pinColor='blue'
                            />
                        )}

                        {routeCoordinates.length > 0 && (
                            <Polyline
                                coordinates={routeCoordinates}
                                strokeWidth={5}
                                strokeColor={Colors.primary}
                            />
                        )}
                    </MapView>
                </View>

                {/*BOTÃO DE ROTA */}
                <TouchableOpacity style={[styles.routeButton, loadingRoute && { opacity: 0.7 }]}
                    activeOpacity={0.8}
                    onPress={handleShowRoute}
                    disabled={loadingRoute}
                >
                    {loadingRoute ? (
                        <ActivityIndicator color={Colors.surface} />
                    ) : (
                        <>
                            <Ionicons name='navigate' size={20} color={Colors.surface} />
                            <Text style={styles.routeButtonText}>
                                {routeCoordinates.length > 0 ? 'Recaucular Rota' : "Mostrar Rota"}
                            </Text>
                        </>
                    )}
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