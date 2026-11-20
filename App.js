import React, { useEffect } from 'react';
import { Platform } from 'react-native';
// Глобальная подстройка <Text>: масштаб шрифта из настроек + Noto Naskh для арабского.
// Должна загрузиться раньше экранов. См. src/utils/textPatch.web.js / .native.js
import './src/utils/textPatch';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { ProgressProvider } from './src/store/progressStore';
import { ThemeProvider } from './src/store/themeStore';
import { SettingsProvider } from './src/store/settingsStore';
import RootNavigator from './src/navigation/RootNavigator';
import { scheduleDailyAyat, requestPermissions } from './src/services/notificationService';
import { loadReciter } from './src/services/quranService';
import { loadSettings as loadTtsSettings } from './src/services/ttsService';

// Обёртка между ThemeProvider и навигатором.
// При смене fontScale контекст темы обновляется, все экраны-потребители useTheme()
// перерисовываются, и textPatch применяет новый масштаб.
// Намеренно НЕ пересоздаём навигатор через key: это сбрасывало стек навигации
// и выбрасывало пользователя на главный экран при смене размера шрифта.
function ScaledAppShell() {
  return (
    <SettingsProvider>
      <ProgressProvider>
        <RootNavigator />
      </ProgressProvider>
    </SettingsProvider>
  );
}

export default function App() {
  // Загрузка кастомных шрифтов: Manrope (кириллица/латиница) + Amiri (арабский).
  // При ошибке (fontError) приложение продолжает работу на системных шрифтах.
  const [fontsLoaded, fontError] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    // Восстанавливаем выбранного чтеца Корана и настройки TTS (голос, скорость) —
    // раньше они подгружались только при заходе в «Слова»/«Букву».
    loadReciter();
    loadTtsSettings();
    // Запрашиваем разрешение на уведомления и планируем «аят дня» один раз при старте.
    // Для web ничего не делаем.
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        const ok = await requestPermissions();
        if (ok) await scheduleDailyAyat();
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // Пока шрифты грузятся (сотни миллисекунд) — держим пустой экран,
  // чтобы не было «прыжка» типографики. fontError => запускаемся на системных.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ScaledAppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
