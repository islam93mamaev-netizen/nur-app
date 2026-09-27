import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../store/themeStore';
import Icon from '../components/Icon';

import HomeScreen from '../screens/home/HomeScreen';
import FoundationsScreen from '../screens/foundations/FoundationsScreen';
import QuranScreen from '../screens/quran/QuranScreen';
import WordsScreen from '../screens/words/WordsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

function tabIcon(name) {
  return ({ color, focused }) => (
    <Icon name={name} size={23} color={color} strokeWidth={focused ? 2.4 : 2} />
  );
}

export default function TabNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          // На вебе нет системных safe-area insets снизу — подписи подрезались,
          // поэтому там высота/отступ больше. На нативе safe-area добавляется сама,
          // и 84px сделали бы таб-бар слишком высоким.
          height: Platform.OS === 'web' ? 72 : 62,
          paddingBottom: Platform.OS === 'web' ? 14 : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          lineHeight: 13, // без явного lineHeight текст подписей обрезался на вебе
          fontWeight: '600',
          marginTop: 2,
          paddingHorizontal: 0,
          includeFontPadding: false,
        },
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarAllowFontScaling: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Главная', tabBarIcon: tabIcon('home') }}
      />
      <Tab.Screen
        name="Foundations"
        component={FoundationsScreen}
        options={{ tabBarLabel: 'Уроки', tabBarIcon: tabIcon('book') }}
      />
      <Tab.Screen
        name="Quran"
        component={QuranScreen}
        options={{ tabBarLabel: 'Коран', tabBarIcon: tabIcon('bookOpen') }}
      />
      <Tab.Screen
        name="Words"
        component={WordsScreen}
        options={{ tabBarLabel: 'Слова', tabBarIcon: tabIcon('type') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Профиль', tabBarIcon: tabIcon('user') }}
      />
    </Tab.Navigator>
  );
}
