import React, { useEffect } from 'react';
import { Platform, Text, StyleSheet } from 'react-native';
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

// ===== Глобальное масштабирование шрифта =====
// Перехватываем Text.render один раз. Перед возвратом узла читаем текущий
// масштаб из global.__nurFontScale (его пишет ThemeProvider) и домножаем
// fontSize / lineHeight конкретного <Text> на этот множитель.
// Так слайдер «Размер шрифта» в настройках работает во всех экранах сразу,
// без переписывания styles в каждом из ~50 файлов.
// Рекурсивно проверяем, содержит ли children арабский текст.
// Результат для строк кэшируется: одни и те же строки рендерятся сотни раз,
// а патч вызывается для КАЖДОГО <Text> в приложении — это горячий путь.
const AR_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const arCache = new Map();
function isArabicString(s) {
  let v = arCache.get(s);
  if (v === undefined) {
    v = AR_RE.test(s);
    if (arCache.size > 3000) arCache.clear(); // защита от бесконечного роста
    arCache.set(s, v);
  }
  return v;
}
function hasArabic(children, depth = 0) {
  if (depth > 3 || children == null) return false;
  if (typeof children === 'string') return isArabicString(children);
  if (Array.isArray(children)) return children.some((c) => hasArabic(c, depth + 1));
  return false;
}

if (!Text.__nurPatched) {
  Text.__nurPatched = true;
  const origRender = Text.render;
  Text.render = function nurScaledRender(...args) {
    const origin = origRender.apply(this, args);
    // Опт-аут: <Text allowFontScaling={false}> — patch не вмешивается.
    if (origin.props.allowFontScaling === false) return origin;

    const scale = global.__nurFontScale || 1;
    const arabic = hasArabic(origin.props.children);

    // БЫСТРЫЙ ВЫХОД для подавляющего большинства текстов:
    // масштаб 1 и нет арабского — не трогаем стили и НЕ делаем flatten.
    if (scale === 1 && !arabic) return origin;

    const flat = StyleSheet.flatten(origin.props.style) || {};
    const extra = [];

    // 1) Масштаб шрифта из настроек
    if (scale !== 1) {
      if (flat.fontSize)  extra.push({ fontSize:  flat.fontSize  * scale });
      if (flat.lineHeight) extra.push({ lineHeight: flat.lineHeight * scale });
    }

    // 2) Арабская типографика: если fontFamily не задан явно — подставляем
    //    Noto Naskh Arabic (ровный экранный насх, понятнее новичку, чем Amiri).
    if (arabic && !flat.fontFamily) {
      const w = parseInt(flat.fontWeight, 10);
      extra.push({ fontFamily: w >= 600 ? 'NotoNaskhArabic_700Bold' : 'NotoNaskhArabic_400Regular' });
    }

    if (extra.length === 0) return origin;
    // ВАЖНО (web): origin здесь — уже отрендеренный DOM-элемент react-native-web
    // с объектным style. Массив стилей роняет react-dom
    // («Failed to set an indexed property on CSSStyleDeclaration»),
    // поэтому передаём ОДИН объединённый объект. На нативе это тоже корректно.
    return React.cloneElement(origin, { style: { ...flat, ...Object.assign({}, ...extra) } });
  };
}

// Обёртка между ThemeProvider и навигатором.
// При смене fontScale контекст темы обновляется, все экраны-потребители useTheme()
// перерисовываются, и patch Text.render применяет новый масштаб.
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
