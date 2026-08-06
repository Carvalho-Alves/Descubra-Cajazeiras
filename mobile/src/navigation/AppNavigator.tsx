import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { GerenciarEventosScreen } from '../screens/GerenciarEventosScreen';
import { NovoServicoScreen } from '../screens/NovoServicoScreen';
import { NovoEventoScreen } from '../screens/NovoEventoScreen';
import { GerenciarServicosScreen } from '../screens/GerenciarServicosScreen';
import { AvaliacoesScreen } from '../screens/AvaliacoesScreen';
import { SobreScreen } from '../screens/SobreScreen';
import { MinhasInformacoesScreen } from '../screens/MinhasInformacoesScreen';
import { NotificacoesScreen } from '../screens/NotificacoesScreen';
import { useAuth } from '../context/AuthContext';

import { Colors } from '../theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const DEFAULT_HEADER_OPTIONS = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.primary,
  headerTitleStyle: { fontFamily: 'Poppins_600SemiBold' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: Colors.background },
} as const;

export function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={DEFAULT_HEADER_OPTIONS}>
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Tabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GerenciarEventos"
              component={GerenciarEventosScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NovoServico"
              component={NovoServicoScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NovoEvento"
              component={NovoEventoScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GerenciarServicos"
              component={GerenciarServicosScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Avaliacoes"
              component={AvaliacoesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Sobre"
              component={SobreScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MinhasInformacoes"
              component={MinhasInformacoesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Notificacoes"
              component={NotificacoesScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
