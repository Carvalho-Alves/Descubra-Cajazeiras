import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Origem da API (sem /api).
 * Prioridade:
 *  1. EXPO_PUBLIC_API_ORIGIN
 *  2. Host do Metro (mesma rede do Expo)
 *  3. Emulador Android → 10.0.2.2
 *  4. Fallback LAN
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
      return `http://${host}:3333`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3333';
  }

  return 'http://192.168.2.1:3333';
}

export const API_ORIGIN = resolveApiOrigin();
export const API_BASE_URL = `${API_ORIGIN}/api`;

/** Centro aproximado de Cajazeiras–PB (dentro dos bounds do backend) */
export const CAJAZEIRAS_CENTER = {
  latitude: -6.89,
  longitude: -38.56,
} as const;
