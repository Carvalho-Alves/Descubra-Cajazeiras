/**
 * App.tsx — Descubra+ Cajazeiras
 *
 * Responsabilidades:
 *   1. Prevenir a splash screen nativa de sumir antes das fontes carregarem
 *   2. Carregar Poppins (600, 700) e Open Sans (400, 500) via expo-google-fonts
 *   3. Esconder a splash screen assim que os assets estiverem prontos
 *   4. Renderizar o navegador raiz da aplicação
 *
 * Dependências necessárias:
 *   npx expo install expo-font expo-splash-screen \
 *     @expo-google-fonts/poppins @expo-google-fonts/open-sans \
 *     react-native-safe-area-context react-native-screens
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  OpenSans_400Regular,
  OpenSans_500Medium,
} from '@expo-google-fonts/open-sans';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_600SemiBold,
    Poppins_700Bold,
    OpenSans_400Regular,
    OpenSans_500Medium,
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch {
        // Se já estiver bloqueado, ignora.
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAppReady(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root} onLayout={onLayoutRootView}>
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
