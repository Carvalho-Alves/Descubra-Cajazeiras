import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = process.env.EXPO_PUBLIC_API_PORT?.trim() || '3333';

/**
 * Origem da API (sem /api).
 * Configure EXPO_PUBLIC_API_ORIGIN no mobile/.env (veja .env.example).
 *
 * Prioridade:
 *  1. EXPO_PUBLIC_API_ORIGIN
 *  2. Host do Metro (mesma rede do Expo)
 *  3. Emulador Android → 10.0.2.2
 *  4. Expo Web → localhost
 */
function resolveApiOrigin(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;

  if (typeof hostUri === 'string' && hostUri.length > 0) {
    const host = hostUri.split(':')[0];
    if (
      host &&
      host !== 'localhost' &&
      host !== '127.0.0.1' &&
      !host.includes('exp.direct')
    ) {
      return `http://${host}:${API_PORT}`;
    }
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  if (Platform.OS === 'web') {
    return `http://localhost:${API_PORT}`;
  }

  // Dispositivo físico sem .env: tenta IP do Metro ou avisa no console
  console.warn(
    '[API] Defina EXPO_PUBLIC_API_ORIGIN no mobile/.env (ex.: http://192.168.x.x:3333)',
  );
  return `http://localhost:${API_PORT}`;
}

export const API_ORIGIN = resolveApiOrigin();
export const API_BASE_URL = `${API_ORIGIN}/api`;

/** Centro aproximado de Cajazeiras–PB (dentro dos bounds do backend) */
export const CAJAZEIRAS_CENTER = {
  latitude: -6.89,
  longitude: -38.56,
} as const;

/** Limites do município de Cajazeiras–PB para restrição do mapa */
export const CAJAZEIRAS_BOUNDS = {
  minLat: -6.98,  // Sul
  maxLat: -6.80,  // Norte
  minLng: -38.65, // Oeste
  maxLng: -38.47, // Leste
} as const;
