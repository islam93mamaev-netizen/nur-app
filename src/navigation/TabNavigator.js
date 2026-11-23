import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  // Явная height перебивает системный отступ снизу: на iPhone без кнопки «Домой» подписи
  // уезжали в зону скруглённых углов и полоски Home («Главная»/«Профиль» срезались).
  // Поэтому высоту считаем сами: контент таб-бара + нижний safe-area отступ.
  const bottomInset = Platform.OS === 'web' ? 14 : Math.max(insets.bottom, 8);
  // На iPhone с полоской Home контент сдвигаем на 4pt вниз, чтобы отступ от верхней
  // линии таб-бара и до полоски был одинаковым (~18pt). Высота таб-бара та же.
  const hasHomeIndicator = Platform.OS !== 'web' && insets.bottom > 0;
  const shift = hasHomeIndicator ? 4 : 0;
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 54 + bottomInset,
          paddingBottom: bottomInset - shift,
          paddingTop: 6 + shift,
          // Крайние вкладки не прижимаем к закруглённым краям экрана
          paddingHorizontal: 8,
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
