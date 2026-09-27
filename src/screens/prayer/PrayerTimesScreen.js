import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Pill from '../../components/Pill';
import { spacing, typography, radii } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrayerTimes, PRAYER_NAMES_RU, formatTime, METHODS, PRAYER_STORAGE, MECCA_COORDS } from '../../services/prayerService';
import { schedulePrayerReminders, requestPermissions } from '../../services/notificationService';
import { useTheme } from '../../store/themeStore';

export default function PrayerTimesScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState('');
  const [method, setMethod] = useState('MuslimWorldLeague');
  const [madhab, setMadhab] = useState('Shafi');
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      // Восстанавливаем сохранённые метод и мазхаб (общие с виджетом на главной)
      try {
        const [m, mz] = await Promise.all([
          AsyncStorage.getItem(PRAYER_STORAGE.METHOD),
          AsyncStorage.getItem(PRAYER_STORAGE.MADHAB),
        ]);
        if (m && METHODS[m]) setMethod(m);
        if (mz === 'Shafi' || mz === 'Hanafi') setMadhab(mz);
      } catch {/* ignore */}

      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== 'granted') {
          Alert.alert('Разрешение', 'Без доступа к местоположению используется Мекка по умолчанию.');
          setCoords(MECCA_COORDS);
          setCity('Мекка');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const next = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setCoords(next);
        let cityName = '';
        try {
          const r = await Location.reverseGeocodeAsync(loc.coords);
          if (r?.[0]) {
            cityName = [r[0].city, r[0].country].filter(Boolean).join(', ');
            setCity(cityName);
          }
        } catch {/* ignore */}
        // Сохраняем для виджета «Следующий намаз» на главной
        AsyncStorage.setItem(PRAYER_STORAGE.COORDS, JSON.stringify({ ...next, city: cityName })).catch(() => {});
      } catch {
        setCoords(MECCA_COORDS);
        setCity('Мекка');
      }
    })();
  }, []);

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
    setLoading(true);
    try {
      const t = getPrayerTimes({
        latitude: coords.latitude,
        longitude: coords.longitude,
        method,
        madhab,
      });
      setTimes(t);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось вычислить времена намазов.');
    } finally {
      setLoading(false);
    }
  }, [coords, method, madhab]);

  const enableNotifications = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Уведомления', 'Разрешите уведомления в настройках устройства.');
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
      Alert.alert('Готово', 'Напоминания о намазах включены на сегодня.');
    }
  };

  const next = times?.nextPrayer?.();

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Времена намазов</Text>
        {city ? <Text style={styles.city}>{city}</Text> : null}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
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
                <Text style={[styles.nextTime, { color: colors.accent }]}>{formatTime(next.time)}</Text>
              </Card>
            )}

            {['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map((key) => (
              <Card key={key} style={{ marginBottom: spacing.sm }}>
                <View style={styles.row}>
                  <Text style={styles.prayerName}>{PRAYER_NAMES_RU[key]}</Text>
                  <Text style={styles.prayerTime}>{formatTime(times[key])}</Text>
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
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  back: { ...typography.bodyMedium, color: '#fff' },
  title: { ...typography.h1, color: '#fff' },
  city: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

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
