// ThemeStore — управляет режимом темы (light | dark | system) и хранит выбор в AsyncStorage.
// Экспортирует ThemeProvider + хуки useTheme() и useThemedStyles(maker).

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Appearance, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes, lightColors, darkColors, spacing, radii, typography, shadows } from '../constants/theme';

const STORAGE_KEY = '@nur_app/theme_mode_v1';
const FONT_SCALE_KEY = '@nur_app/font_scale_v1';

// Доступные масштабы шрифта для настройки
export const FONT_SCALES = [
  { id: 'small',  label: 'Мелкий',  value: 0.9 },
  { id: 'normal', label: 'Обычный', value: 1.0 },
  { id: 'large',  label: 'Крупный', value: 1.15 },
  { id: 'xlarge', label: 'Очень крупный', value: 1.3 },
];

const Ctx = createContext(null);

export function ThemeProvider({ children }) {
  // mode: 'light' | 'dark' | 'system'
  const [mode, setModeState] = useState('system');
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'light');
  const [fontScale, setFontScaleState] = useState(1.0);
  const [loaded, setLoaded] = useState(false);

  // Загружаем сохранённый режим и шрифт
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === 'light' || raw === 'dark' || raw === 'system') {
          setModeState(raw);
        }
        const fs = await AsyncStorage.getItem(FONT_SCALE_KEY);
        const num = parseFloat(fs);
        if (!isNaN(num) && num > 0.5 && num < 2) setFontScaleState(num);
      } catch (e) {
        console.warn('Theme load failed', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setFontScale = useCallback(async (next) => {
    // ВАЖНО: пишем в global СИНХРОННО, до setState — иначе потребители контекста
    // отрендерятся раньше, чем patch Text.render увидит новый масштаб.
    global.__nurFontScale = next;
    setFontScaleState(next);
    try {
      await AsyncStorage.setItem(FONT_SCALE_KEY, String(next));
    } catch (e) { /* ignore */ }
  }, []);

  // Дублируем в global при каждом рендере (в т.ч. после загрузки из AsyncStorage) —
  // его читает monkey-patch Text.render в App.js, домножая fontSize / lineHeight.
  global.__nurFontScale = fontScale;

  // Слушаем системную смену схемы
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => sub.remove();
  }, []);

  const setMode = useCallback(async (next) => {
    setModeState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      console.warn('Theme save failed', e);
    }
  }, []);

  const resolvedScheme = mode === 'system' ? systemScheme : mode;
  const isDark = resolvedScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      loaded, mode, setMode,
      scheme: resolvedScheme, isDark, colors,
      fontScale, setFontScale,
      spacing, radii, typography, shadows, palettes,
    }),
    [loaded, mode, setMode, resolvedScheme, isDark, colors, fontScale, setFontScale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Безопасный fallback на случай, если кто-то использует хук вне провайдера
    return {
      colors: lightColors,
      isDark: false,
      mode: 'system',
      scheme: 'light',
      setMode: () => {},
      fontScale: 1.0,
      setFontScale: () => {},
      spacing, radii, typography, shadows, palettes,
    };
  }
  return ctx;
}

/**
 * useThemedStyles(maker) — хук, возвращающий StyleSheet, перевычисляемый при смене темы.
 *
 * Использование:
 *   const styles = useThemedStyles((t) => ({
 *     box: { backgroundColor: t.colors.surface },
 *   }));
 */
export function useThemedStyles(maker) {
  const t = useTheme();
  return useMemo(() => StyleSheet.create(maker(t)), [t, maker]);
}
