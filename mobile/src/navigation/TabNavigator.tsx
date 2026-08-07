/**
 * TabNavigator — abas do Figma Make:
 *   Mapa | Serviços | Eventos | Perfil
 * Ativo: amarelo #FFD500 | Inativo: #9CA3AF
 */
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { FavoritosScreen } from '../screens/FavoritosScreen';
import { ServicosTabScreen } from '../screens/ServicosTabScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { Colors } from '../theme/colors';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof TabParamList, [IoniconName, IoniconName]> = {
  Mapa: ['location', 'location-outline'],
  Servicos: ['briefcase', 'briefcase-outline'],
  Eventos: ['calendar', 'calendar-outline'],
  Perfil: ['person', 'person-outline'],
};

const TAB_LABELS: Record<keyof TabParamList, string> = {
  Mapa: 'Mapa',
  Servicos: 'Serviços',
  Eventos: 'Eventos',
  Perfil: 'Perfil',
};

export function TabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom ?? 0;

  return (
    <Tab.Navigator
      initialRouteName="Mapa"
      screenOptions={({ route }) => {
        const routeName = route.name as keyof TabParamList;
        const [activeIcon, inactiveIcon] = TAB_ICONS[routeName];

        return {
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? activeIcon : inactiveIcon}
              size={size}
              color={focused ? Colors.highlight : Colors.muted}
            />
          ),
          tabBarActiveTintColor: Colors.highlight,
          tabBarInactiveTintColor: Colors.muted,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: '#E5E7EB',
            borderTopWidth: 1,
            height: (Platform.OS === 'ios' ? 84 : 64) + bottomInset,
            paddingBottom: (Platform.OS === 'ios' ? 24 : 8) + bottomInset,
            paddingTop: 8,
          },
          tabBarSafeAreaInsets: {
            bottom: 0,
          },
          tabBarLabel: TAB_LABELS[routeName],
          tabBarLabelStyle: {
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 10,
          },
        };
      }}
    >
      <Tab.Screen name="Mapa" component={HomeScreen} />
      <Tab.Screen name="Servicos" component={ServicosTabScreen} />
      <Tab.Screen name="Eventos" component={FavoritosScreen} />
      <Tab.Screen name="Perfil" component={DashboardScreen} />
    </Tab.Navigator>
  );
}
