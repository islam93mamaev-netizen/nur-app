// Виджет «Следующий намаз» для главного экрана.
// Показывает: имя и время ближайшего намаза, обратный отсчёт, город и дату хиджры.
// Геолокацию НЕ запрашивает сам (без всплывающих диалогов на главной):
//  - использует разрешение, если оно уже выдано (экран «Намазы» его запрашивает);
//  - иначе берёт последние сохранённые координаты из AsyncStorage;
//  - иначе — Мекка по умолчанию.
// Метод расчёта и мазхаб читаются из тех же ключей, что использует экран «Намазы».

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { spacing, radii, typography, shadows } from '../constants/theme';
import { useTheme } from '../store/themeStore';
import {
  getNextPrayer,
  formatTime,
  PRAYER_NAMES_RU,
  PRAYER_STORAGE,
  MECCA_COORDS,
} from '../services/prayerService';
import { formatHijri } from '../utils/hijri';
import Icon from './Icon';
import PatternBackground from './PatternBackground';

export default function NextPrayerCard({ onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState('');
  const [method, setMethod] = useState('MuslimWorldLeague');
  const [madhab, setMadhab] = useState('Shafi');
  // «Тикер»: раз в 30 секунд пересчитываем отсчёт
  const [, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [c, m, mz] = await Promise.all([
          AsyncStorage.getItem(PRAYER_STORAGE.COORDS),
          AsyncStorage.getItem(PRAYER_STORAGE.METHOD),
          AsyncStorage.getItem(PRAYER_STORAGE.MADHAB),
        ]);
        if (!alive) return;
        if (m) setMethod(m);
        if (mz === 'Shafi' || mz === 'Hanafi') setMadhab(mz);

        let saved = null;
        if (c) {
          try { saved = JSON.parse(c); } catch { /* ignore */ }
        }
        if (saved?.latitude) {
          setCoords({ latitude: saved.latitude, longitude: saved.longitude });
          setCity(saved.city || '');
        }

        // Только если разрешение уже выдано — уточняем позицию (без диалога).
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status === 'granted') {
          const loc =
            (await Location.getLastKnownPositionAsync()) ||
            (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
          if (alive && loc) {
            const next = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setCoords(next);
            AsyncStorage.setItem(
              PRAYER_STORAGE.COORDS,
              JSON.stringify({ ...next, city: saved?.city || '' })
            ).catch(() => {});
          }
        } else if (!saved?.latitude) {
          setCoords(MECCA_COORDS);
          setCity('Мекка');
        }
      } catch {
        if (alive) {
          setCoords((prev) => prev || MECCA_COORDS);
          setCity((prev) => prev || 'Мекка');
        }
      }
    })();

    const t = setInterval(() => setTick((v) => v + 1), 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  let next = null;
  let countdown = '';
  if (coords) {
    try {
      next = getNextPrayer({ ...coords, method, madhab });
      const diffMin = Math.max(0, Math.ceil((next.time - new Date()) / 60000));
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      countdown = h > 0 ? `через ${h} ч ${m} мин` : `через ${m} мин`;
    } catch { /* координаты некорректны — не показываем */ }
  }

  if (!next) return null;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <PatternBackground from={colors.primary} to={colors.primaryDark} />
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Следующий намаз</Text>
        <View style={styles.row}>
          <Text style={styles.prayer}>{PRAYER_NAMES_RU[next.name]}</Text>
          <Text style={styles.time}>{formatTime(next.time)}</Text>
        </View>
        <Text style={styles.countdown}>
          {countdown}
          {city ? `  ·  ${city}` : ''}
        </Text>
      </View>
      <View style={styles.right}>
        <Icon name="moon" size={18} color={colors.accentLight} />
        <Text style={styles.hijri}>{formatHijri()}</Text>
        <Icon name="chevronRight" size={18} color="rgba(255,255,255,0.55)" style={{ marginTop: spacing.sm }} />
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary, // запасной цвет под SVG-градиентом
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    overflow: 'hidden', // обрезаем градиент и орнамент по скруглению
    ...shadows.md,
  },
  label: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  prayer: { ...typography.h2, color: '#FFFFFF' },
  time: { ...typography.h3, color: colors.accentLight, marginLeft: spacing.md },
  countdown: { ...typography.small, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  right: { alignItems: 'flex-end', marginLeft: spacing.md },
  hijri: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    maxWidth: 120,
    textAlign: 'right',
  },
});
