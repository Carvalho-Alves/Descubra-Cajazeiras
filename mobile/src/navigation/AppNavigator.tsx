/**
 * AppNavigator.tsx — Stack Navigator raiz
 *
 * Hierarquia de navegação:
 *
 *   NavigationContainer
 *   └── Stack (RootStackParamList)
 *       ├── Login              ← rota inicial (headerShown: false)
 *       ├── Tabs               ← Bottom Tab Navigator (headerShown: false)
 *       ├── GerenciarEventos
 *       ├── NovoServico
 *       ├── GerenciarServicos
 *       ├── Avaliacoes
 *       └── Sobre
 *
 * Instale as dependências antes de rodar:
 *   npx expo install \
 *     @react-navigation/native \
 *     @react-navigation/native-stack \
 *     @react-navigation/bottom-tabs \
 *     react-native-screens \
 *     react-native-safe-area-context \
 *     @expo/vector-icons
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { GerenciarEventosScreen } from '../screens/GerenciarEventosScreen';
import { NovoServicoScreen } from '../screens/NovoServicoScreen';
import { GerenciarServicosScreen } from '../screens/GerenciarServicosScreen';
import { AvaliacoesScreen } from '../screens/AvaliacoesScreen';
import { SobreScreen } from '../screens/SobreScreen';
import { DetalhesScreen } from '@/screens/DetalhesScreen';

import { Colors } from '../theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Opções padrão de cabeçalho aplicadas a todas as telas Stack */
const DEFAULT_HEADER_OPTIONS = {
  headerStyle: {
    backgroundColor: Colors.surface,
  },
  headerTintColor: Colors.primary,
  headerTitleStyle: {
    fontFamily: 'Poppins_600SemiBold',
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: Colors.background,
  },
} as const;

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={DEFAULT_HEADER_OPTIONS}
      >
        {/* ── Telas sem cabeçalho ───────────────────────────────── */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        {/* ── Telas com cabeçalho padrão ───────────────────────── */}
        <Stack.Screen
          name="GerenciarEventos"
          component={GerenciarEventosScreen}
          options={{ title: 'Gerenciar Eventos' }}
        />
        <Stack.Screen
          name="NovoServico"
          component={NovoServicoScreen}
          options={{ title: 'Novo Serviço' }}
        />
        <Stack.Screen
          name="GerenciarServicos"
          component={GerenciarServicosScreen}
          options={{ title: 'Gerenciar Serviços' }}
        />
        <Stack.Screen
          name="Avaliacoes"
          component={AvaliacoesScreen}
          options={{ title: 'Avaliações' }}
        />
        <Stack.Screen
          name="Sobre"
          component={SobreScreen}
          options={{ title: 'Sobre' }}
        />
        <Stack.Screen
        name="Detalhes"
        component={DetalhesScreen}
        options={{ title: 'Detalhes'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
