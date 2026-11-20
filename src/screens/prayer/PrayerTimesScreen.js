import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import * as Location from 'expo-location';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { spacing, typography, radii } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPrayerTimes, getNextPrayer, PRAYER_NAMES_RU, formatTime, METHODS, PRAYER_STORAGE, MECCA_COORDS,
} from '../../services/prayerService';
import { schedulePrayerReminders, requestPermissions } from '../../services/notificationService';
import { useTheme } from '../../store/themeStore';
import { findCity } from '../../data/cities';
import CityPickerModal from '../../components/CityPickerModal';
import Icon from '../../components/Icon';
import { notify } from '../../utils/dialogs';

export default function PrayerTimesScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState('');
  // Местоположение: 'auto' — GPS, 'manual' — город выбран вручную
  const [mode, setMode] = useState('auto');
  const [manualCity, setManualCity] = useState(null); // объект из data/cities
  const [pickerOpen, setPickerOpen] = useState(false);
  const [method, setMethod] = useState('MuslimWorldLeague');
  const [madhab, setMadhab] = useState('Shafi');
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);

  // Часовой пояс для отображения: у ручного города — его пояс, у GPS — пояс устройства
  const tz = mode === 'manual' ? manualCity?.tz : undefined;

  // Запасной вариант без GPS: Мекка. Сохраняем, чтобы виджет и Рамадан
  // не продолжали показывать ранее выбранный вручную город.
  const fallbackToMecca = () => {
    setCoords(MECCA_COORDS);
    setCity('Мекка');
    AsyncStorage.setItem(PRAYER_STORAGE.COORDS, JSON.stringify({ ...MECCA_COORDS, city: 'Мекка' })).catch(() => {});
  };

  // Определение позиции по GPS
  const detectByGps = async () => {
    setLoading(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        notify(
          'Нет доступа к местоположению',
          'Пока используется Мекка. Можно выбрать свой город вручную — кнопка «Вручную» вверху.'
        );
        fallbackToMecca();
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const next = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setCoords(next);
      let cityName = '';
      try {
        const r = await Location.reverseGeocodeAsync(loc.coords);
        if (r?.[0]) cityName = [r[0].city, r[0].country].filter(Boolean).join(', ');
      } catch {/* ignore */}
      setCity(cityName || 'Текущее местоположение');
      // Сохраняем для виджета «Следующий намаз» и Рамадана
      AsyncStorage.setItem(PRAYER_STORAGE.COORDS, JSON.stringify({ ...next, city: cityName })).catch(() => {});
    } catch {
      fallbackToMecca();
    } finally {
      setLoading(false);
    }
  };

  // Применение вручную выбранного города
  const applyManualCity = (c) => {
    setManualCity(c);
    setCoords({ latitude: c.latitude, longitude: c.longitude });
    setCity(`${c.name}, ${c.country}`);
  };

  useEffect(() => {
    (async () => {
      let savedMode = 'auto';
      let saved = null;
      try {
        const [m, mz, lm, c] = await Promise.all([
          AsyncStorage.getItem(PRAYER_STORAGE.METHOD),
          AsyncStorage.getItem(PRAYER_STORAGE.MADHAB),
          AsyncStorage.getItem(PRAYER_STORAGE.LOCATION_MODE),
          AsyncStorage.getItem(PRAYER_STORAGE.COORDS),
        ]);
        if (m && METHODS[m]) setMethod(m);
        if (mz === 'Shafi' || mz === 'Hanafi') setMadhab(mz);
        if (lm === 'manual') savedMode = 'manual';
        try { saved = c ? JSON.parse(c) : null; } catch {/* ignore */}
      } catch {/* ignore */}

      const savedCity = saved?.cityId ? findCity(saved.cityId) : null;
      if (savedMode === 'manual' && savedCity) {
        // Ручной режим: GPS не запрашиваем вообще
        setMode('manual');
        applyManualCity(savedCity);
      } else {
        setMode('auto');
        await detectByGps();
      }
    })();
  }, []);

  // Пользователь выбрал город в списке → ручной режим
  const onPickCity = (c) => {
    setPickerOpen(false);
    setMode('manual');
    applyManualCity(c);
    AsyncStorage.multiSet([
      [PRAYER_STORAGE.LOCATION_MODE, 'manual'],
      [PRAYER_STORAGE.COORDS, JSON.stringify({
        latitude: c.latitude, longitude: c.longitude,
        city: `${c.name}, ${c.country}`, tz: c.tz, cityId: c.id,
      })],
    ]).catch(() => {});
  };

  // Возврат к автоматическому определению
  const switchToAuto = () => {
    if (mode === 'auto') return;
    setMode('auto');
    setManualCity(null);
    AsyncStorage.setItem(PRAYER_STORAGE.LOCATION_MODE, 'auto').catch(() => {});
    detectByGps();
  };

  // Сохраняем выбор метода/мазхаба — виджет на главной использует те же настройки
  const setMethodPersist = (m) => {
    setMethod(m);
    AsyncStorage.setItem(PRAYER_STORAGE.METHOD, m).catch(() => {});
  };
  const setMadhabPersist = (m) => {
    setMadhab(m);
    AsyncStorage.setItem(PRAYER_STORAGE.MADHAB, m).catch(() => {});
  };

  useEffect(() => {
    if (!coords) return;
    try {
      const t = getPrayerTimes({
        latitude: coords.latitude,
        longitude: coords.longitude,
        method,
        madhab,
      });
      setTimes(t);
    } catch (e) {
      notify('Ошибка', 'Не удалось вычислить времена намазов.');
    } finally {
      setLoading(false);
    }
  }, [coords, method, madhab]);

  const enableNotifications = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      notify('Уведомления', 'Разрешите уведомления в настройках устройства.');
      return;
    }
    if (times) {
      await schedulePrayerReminders({
        fajr: times.fajr,
        dhuhr: times.dhuhr,
        asr: times.asr,
        maghrib: times.maghrib,
        isha: times.isha,
      });
      setNotifEnabled(true);
      notify('Готово', 'Напоминания о намазах включены на сегодня.');
    }
  };

  // Следующий намаз без восхода; после иши — завтрашний фаджр (как в виджете на главной)
  let next = null;
  if (coords) {
    try { next = getNextPrayer({ ...coords, method, madhab }); } catch {/* ignore */}
  }

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>Времена намазов</Text>
        {city ? <Text style={styles.city}>{city}</Text> : null}
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Местоположение: автоматически по GPS или город вручную */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={styles.locLabel}>Местоположение</Text>
          <View style={styles.segment}>
            {[
              { id: 'auto', label: 'Автоматически' },
              { id: 'manual', label: 'Вручную' },
            ].map((o) => {
              const active = mode === o.id;
              return (
                <TouchableOpacity
                  key={o.id}
                  onPress={() => (o.id === 'auto' ? switchToAuto() : setPickerOpen(true))}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {mode === 'manual' && manualCity ? (
            <TouchableOpacity onPress={() => setPickerOpen(true)} style={styles.cityRow} accessibilityRole="button">
              <View style={{ flex: 1 }}>
                <Text style={styles.cityName}>{manualCity.name}</Text>
                <Text style={styles.cityMeta}>{manualCity.country} · время по местному поясу города</Text>
              </View>
              <Text style={styles.cityChange}>Изменить</Text>
              <Icon name="chevronRight" size={16} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.locHint}>По GPS устройства. Если определяется неверно — выберите город вручную.</Text>
          )}
        </Card>

        {loading || !times ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {next && (
              <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.primary }}>
                <Text style={[styles.nextLabel, { color: '#fff', opacity: 0.85 }]}>Следующий намаз</Text>
                <Text style={[styles.nextName, { color: '#fff' }]}>{PRAYER_NAMES_RU[next.name]}</Text>
                <Text style={[styles.nextTime, { color: colors.accent }]}>{formatTime(next.time, tz)}</Text>
              </Card>
            )}

            {['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map((key) => (
              <Card key={key} style={{ marginBottom: spacing.sm }}>
                <View style={styles.row}>
                  <Text style={styles.prayerName}>{PRAYER_NAMES_RU[key]}</Text>
                  <Text style={styles.prayerTime}>{formatTime(times[key], tz)}</Text>
                </View>
              </Card>
            ))}

            <Text style={styles.label}>Метод расчёта</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {Object.entries(METHODS).map(([k, v]) => (
                <TouchableOpacity
                  key={k}
                  onPress={() => setMethodPersist(k)}
                  style={[styles.chip, method === k && styles.chipActive]}
                >
                  <Text style={[styles.chipText, method === k && styles.chipTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Мазхаб (расчёт Аср)</Text>
            <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
              {['Shafi', 'Hanafi'].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMadhabPersist(m)}
                  style={[styles.chip, madhab === m && styles.chipActive, { marginRight: spacing.sm }]}
                >
                  <Text style={[styles.chipText, madhab === m && styles.chipTextActive]}>
                    {m === 'Shafi' ? 'Шафи‘и (стандарт)' : 'Ханафи (поздний)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {Platform.OS !== 'web' && (
              <Button
                title={notifEnabled ? 'Напоминания включены ✓' : 'Включить напоминания'}
                onPress={enableNotifications}
                disabled={notifEnabled}
              />
            )}
          </>
        )}
      </ScrollView>

      <CityPickerModal
        visible={pickerOpen}
        selectedId={manualCity?.id}
        onSelect={onPickCity}
        onClose={() => setPickerOpen(false)}
      />
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff' },
  city: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  // Блок местоположения
  locLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', marginBottom: spacing.sm },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 3,
  },
  segmentBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: radii.sm },
  segmentBtnActive: { backgroundColor: colors.primary },
  segmentText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  segmentTextActive: { color: colors.textOnPrimary, fontWeight: '700' },
  locHint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 17 },
  cityRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  cityName: { ...typography.h4, color: colors.textPrimary },
  cityMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  cityChange: { ...typography.small, color: colors.primary, fontWeight: '600', marginRight: 2 },

  nextLabel: { ...typography.caption },
  nextName: { ...typography.h2, marginTop: 4 },
  nextTime: { fontSize: 36, fontWeight: '700', marginTop: spacing.sm },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prayerName: { ...typography.bodyMedium, color: colors.textPrimary },
  prayerTime: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700' },

  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.textOnPrimary },
});
