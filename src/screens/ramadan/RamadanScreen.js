// Режим Рамадана:
//  - сухур (до фаджра) и ифтар (магриб) по координатам пользователя + отсчёт
//  - трекер 30 дней поста (сетка, тап = отметка)
//  - отметки таравиха
//  - дуа разговения, подсказка о Лейлят аль-Кадр в последнюю декаду
//
// Данные хранятся по хиджри-году: { year, fasts: {1:true,...}, taraweeh: {...} }

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import PatternBackground from '../../components/PatternBackground';
import Icon from '../../components/Icon';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { gregorianToHijri } from '../../utils/hijri';
import {
  getPrayerTimes,
  formatTime,
  PRAYER_STORAGE,
  MECCA_COORDS,
} from '../../services/prayerService';
import * as haptics from '../../utils/haptics';

const STORAGE_KEY = '@nur_app/ramadan_v1';

const IFTAR_DUA = {
  ar: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
  tr: 'Захаба-з-зама́у ва-бталляти-ль-ʿуру́ку ва сабата-ль-аджру ин ша́а-Ллах',
  ru: 'Ушла жажда, наполнились влагой жилы и утвердилась награда, если пожелает Аллах.',
  source: 'Абу Дауд 2357',
};

export default function RamadanScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const hijri = gregorianToHijri(new Date());
  const isRamadan = hijri.month === 9;

  const [data, setData] = useState({ year: hijri.year, fasts: {}, taraweeh: {} });
  const [coords, setCoords] = useState(null);
  const [method, setMethod] = useState('MuslimWorldLeague');
  const [madhab, setMadhab] = useState('Shafi');
  const [, setTick] = useState(0);

  // Загрузка отметок + настроек намаза (общие с виджетом и экраном «Намазы»)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [raw, c, m, mz] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(PRAYER_STORAGE.COORDS),
          AsyncStorage.getItem(PRAYER_STORAGE.METHOD),
          AsyncStorage.getItem(PRAYER_STORAGE.MADHAB),
        ]);
        if (!alive) return;
        if (raw) {
          const saved = JSON.parse(raw);
          // Новый год хиджры — трекер начинается заново
          if (saved?.year === hijri.year) setData(saved);
        }
        if (m) setMethod(m);
        if (mz === 'Shafi' || mz === 'Hanafi') setMadhab(mz);
        if (c) {
          try {
            const p = JSON.parse(c);
            if (p?.latitude) setCoords({ latitude: p.latitude, longitude: p.longitude });
          } catch { /* ignore */ }
        }
        setCoords((prev) => prev || MECCA_COORDS);
      } catch { /* ignore */ }
    })();
    const t = setInterval(() => setTick((v) => v + 1), 30000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const persist = (next) => {
    setData(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const toggleFast = (day) => {
    haptics.tap();
    const fasts = { ...data.fasts };
    if (fasts[day]) delete fasts[day];
    else fasts[day] = true;
    persist({ ...data, year: hijri.year, fasts });
  };

  const toggleTaraweeh = (day) => {
    haptics.tap();
    const taraweeh = { ...data.taraweeh };
    if (taraweeh[day]) delete taraweeh[day];
    else taraweeh[day] = true;
    persist({ ...data, year: hijri.year, taraweeh });
  };

  // Времена сухура/ифтара на сегодня
  let suhoor = null;
  let iftar = null;
  let countdown = '';
  if (coords) {
    try {
      const t = getPrayerTimes({ ...coords, method, madhab });
      suhoor = t.fajr;
      iftar = t.maghrib;
      const now = new Date();
      const target = now < iftar ? iftar : null;
      if (target) {
        const diff = Math.max(0, Math.ceil((target - now) / 60000));
        countdown = `до ифтара ${Math.floor(diff / 60)} ч ${diff % 60} мин`;
      } else if (now < suhoor) {
        const diff = Math.max(0, Math.ceil((suhoor - now) / 60000));
        countdown = `до конца сухура ${Math.floor(diff / 60)} ч ${diff % 60} мин`;
      }
    } catch { /* ignore */ }
  }

  const fastCount = Object.keys(data.fasts).length;
  const taraweehCount = Object.keys(data.taraweeh).length;
  const lastTen = isRamadan && hijri.day >= 21;

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <PatternBackground from={colors.primary} to={colors.primaryDark} />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Рамадан</Text>
        <Text style={styles.subtitle}>
          {isRamadan
            ? `Сегодня ${hijri.day}-й день месяца Рамадан ${hijri.year} г.х.`
            : `Сейчас не Рамадан (${hijri.year} г.х.) — трекер доступен заранее`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Сухур и ифтар */}
        <Card>
          <View style={styles.timesRow}>
            <View style={styles.timeBox}>
              <Icon name="sunrise" size={20} color={colors.accentDark} />
              <Text style={styles.timeLabel}>Сухур до</Text>
              <Text style={styles.timeValue}>{formatTime(suhoor) || '—'}</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeBox}>
              <Icon name="moon" size={20} color={colors.primary} />
              <Text style={styles.timeLabel}>Ифтар в</Text>
              <Text style={styles.timeValue}>{formatTime(iftar) || '—'}</Text>
            </View>
          </View>
          {countdown ? <Text style={styles.countdown}>{countdown}</Text> : null}
          <Text style={styles.timesHint}>
            Время по вашим настройкам из экрана «Намазы» (метод и мазхаб — общие).
          </Text>
        </Card>

        {/* Подсказка о Лейлят аль-Кадр */}
        {lastTen && (
          <Card style={{ marginTop: spacing.md, backgroundColor: colors.accent + '15', borderLeftWidth: 4, borderLeftColor: colors.accent }}>
            <Text style={styles.qadrTitle}>✨ Последняя декада</Text>
            <Text style={styles.qadrText}>
              Ищите Ночь Предопределения (Лейлят аль-Кадр) в нечётные ночи: 21, 23, 25, 27, 29.
              Она лучше тысячи месяцев (сура «Аль-Кадр», 97:3).
            </Text>
          </Card>
        )}

        {/* Трекер поста */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Пост</Text>
          <Text style={styles.sectionCount}>{fastCount} из 30</Text>
        </View>
        <ProgressBar value={fastCount} max={30} />
        <View style={styles.grid}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const done = !!data.fasts[day];
            const isToday = isRamadan && day === hijri.day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => toggleFast(day)}
                style={[
                  styles.dayCell,
                  done && styles.dayCellDone,
                  isToday && styles.dayCellToday,
                ]}
              >
                <Text style={[styles.dayText, done && styles.dayTextDone]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Трекер таравиха */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Таравих</Text>
          <Text style={styles.sectionCount}>{taraweehCount} из 30</Text>
        </View>
        <ProgressBar value={taraweehCount} max={30} color={colors.accent} />
        <View style={styles.grid}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const done = !!data.taraweeh[day];
            const isToday = isRamadan && day === hijri.day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => toggleTaraweeh(day)}
                style={[
                  styles.dayCell,
                  done && { backgroundColor: colors.accent, borderColor: colors.accent },
                  isToday && styles.dayCellToday,
                ]}
              >
                <Text style={[styles.dayText, done && styles.dayTextDone]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Дуа разговения */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Дуа при разговении</Text>
        <Card style={{ marginTop: spacing.sm }}>
          <Text style={styles.duaAr}>{IFTAR_DUA.ar}</Text>
          <Text style={styles.duaTr}>{IFTAR_DUA.tr}</Text>
          <Text style={styles.duaRu}>{IFTAR_DUA.ru}</Text>
          <Text style={styles.duaSource}>{IFTAR_DUA.source}</Text>
        </Card>

        <Card style={{ marginTop: spacing.md, backgroundColor: colors.info + '10' }}>
          <Text style={styles.note}>
            Не забудьте про шесть дней поста в Шаввале после Ид аль-Фитра — вместе с
            Рамаданом это как пост в течение всего года (Муслим 1164).
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  back: { ...typography.bodyMedium, color: '#fff' },
  title: { ...typography.h1, color: '#fff', marginTop: spacing.sm },
  subtitle: { ...typography.small, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  timesRow: { flexDirection: 'row', alignItems: 'center' },
  timeBox: { flex: 1, alignItems: 'center', gap: 4 },
  timeDivider: { width: 1, height: 48, backgroundColor: colors.divider },
  timeLabel: { ...typography.caption, color: colors.textSecondary },
  timeValue: { ...typography.h2, color: colors.textPrimary },
  countdown: {
    ...typography.bodyMedium,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '700',
  },
  timesHint: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },

  qadrTitle: { ...typography.bodyMedium, color: colors.accentDark, fontWeight: '700' },
  qadrText: { ...typography.small, color: colors.textPrimary, marginTop: 4, lineHeight: 20 },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  sectionCount: { ...typography.small, color: colors.textSecondary },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  dayCell: {
    width: '15%',
    aspectRatio: 1,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayCellToday: { borderColor: colors.accent, borderWidth: 2.5 },
  dayText: { ...typography.bodyMedium, color: colors.textSecondary },
  dayTextDone: { color: '#fff', fontWeight: '700' },

  duaAr: { ...typography.arabic, color: colors.textPrimary, textAlign: 'right' },
  duaTr: { ...typography.small, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing.sm },
  duaRu: { ...typography.body, color: colors.textPrimary, marginTop: spacing.sm },
  duaSource: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },

  note: { ...typography.small, color: colors.textPrimary, lineHeight: 20 },
});
