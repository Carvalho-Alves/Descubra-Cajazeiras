/**
 * TabNavigator.tsx — Bottom Tab Navigator
 *
 * Abas:
 *   • Home      → HomeScreen
 *   • Favoritos → FavoritosScreen
 *   • Perfil    → DashboardScreen
 *
 * Estilo:
 *   • Fundo branco (#FFFFFF)
 *   • Ícone ativo: Azul Vibrante (#0D6EFD)
 *   • Ícone inativo: Cinza (#6C757D)
 *   • Fonte do label: Poppins_600SemiBold
 */
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { FavoritosScreen } from '../screens/FavoritosScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { Colors } from '../theme/colors';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/** Mapeamento de rota → par de ícones (ativo / inativo) */
const TAB_ICONS: Record<keyof TabParamList, [IoniconName, IoniconName]> = {
  Home:      ['home',   'home-outline'],
  Favoritos: ['heart',  'heart-outline'],
  Perfil:    ['person', 'person-outline'],
};

/** Labels das abas */
const TAB_LABELS: Record<keyof TabParamList, string> = {
  Home:      'Início',
  Favoritos: 'Favoritos',
  Perfil:    'Perfil',
};

export function TabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom ?? 0;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => {
        const routeName = route.name as keyof TabParamList;
        const [activeIcon, inactiveIcon] = TAB_ICONS[routeName];

        return {
          headerShown: false,

          // ── Ícone ──────────────────────────────────────────
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? activeIcon : inactiveIcon}
              size={size}
              color={color}
            />
          ),

          // ── Cores ─────────────────────────────────────────
          tabBarActiveTintColor:   Colors.primary,   // #0D6EFD
          tabBarInactiveTintColor: Colors.textSecondary,

          // ── Estilo da barra ───────────────────────────────
          tabBarStyle: {
            backgroundColor: Colors.surface,         // #FFFFFF
            borderTopColor: Colors.border,            // #E9ECEF
            borderTopWidth: 1,
            height: (Platform.OS === 'ios' ? 84 : 64) + bottomInset,
            paddingBottom: (Platform.OS === 'ios' ? 24 : 8) + bottomInset,
            paddingTop: 8,
          },
          tabBarSafeAreaInsets: {
            bottom: 0,
          },

          // ── Label ─────────────────────────────────────────
          tabBarLabel: TAB_LABELS[routeName],
          tabBarLabelStyle: {
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 10,
          },
        };
      }}
    >
      <Tab.Screen name="Home"      component={HomeScreen} />
      <Tab.Screen name="Favoritos" component={FavoritosScreen} />
      <Tab.Screen name="Perfil"    component={DashboardScreen} />
    </Tab.Navigator>
  );
}
