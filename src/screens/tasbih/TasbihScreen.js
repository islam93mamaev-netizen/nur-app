import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Vibration, Platform, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Button from '../../components/Button';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import IconText from '../../components/IconText';

const KEY = '@nur_app/tasbih';
const SETTINGS_KEY = '@nur_app/tasbih_settings';

const PHRASES = [
  { id: 'subhanallah', ar: 'سُبْحَانَ ٱللَّه', tr: 'Subḥāna llāh', ru: 'Слава Аллаху', target: 33, color: '#0F4C3A' },
  { id: 'alhamdulillah', ar: 'ٱلْحَمْدُ لِلَّه', tr: 'Al-ḥamdu lillāh', ru: 'Хвала Аллаху', target: 33, color: '#1E7B5F' },
  { id: 'allahuakbar', ar: 'ٱللَّهُ أَكْبَر', tr: 'Allāhu akbar', ru: 'Аллах Велик', target: 34, color: '#C9A55B' },
  { id: 'istighfar', ar: 'أَسْتَغْفِرُ ٱللَّه', tr: 'Astaġfiru llāh', ru: 'Прошу прощения у Аллаха', target: 100, color: '#3D6E94' },
  { id: 'salawat', ar: 'ٱللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّد', tr: 'Allāhumma ṣalli ʿalā Muḥammad', ru: 'О Аллах, благослови Мухаммада', target: 100, color: '#2E7D5B' },
  { id: 'lailaha', ar: 'لَا إِلَٰهَ إِلَّا ٱللَّه', tr: 'Lā ilāha illā llāh', ru: 'Нет божества кроме Аллаха', target: 100, color: '#B23A48' },
];

export default function TasbihScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [counts, setCounts] = useState({});
  const [totalEver, setTotalEver] = useState(0);
  const [vibrationOn, setVibrationOn] = useState(true);
  const [autoNext, setAutoNext] = useState(false); // авто-переход к следующей фразе при достижении цели

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const data = JSON.parse(raw);
          setCounts(data.counts || {});
          setTotalEver(data.totalEver || 0);
        }
        const sraw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (sraw) {
          const s = JSON.parse(sraw);
          if (typeof s.vibration === 'boolean') setVibrationOn(s.vibration);
          if (typeof s.autoNext === 'boolean') setAutoNext(s.autoNext);
        }
      } catch {/* ignore */}
    })();
  }, []);

  const persist = async (newCounts, newTotal) => {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify({ counts: newCounts, totalEver: newTotal }));
    } catch {/* ignore */}
  };

  const saveSettings = async (next) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {/* ignore */}
  };

  const toggleVibration = (val) => {
    setVibrationOn(val);
    saveSettings({ vibration: val, autoNext });
  };

  const toggleAutoNext = (val) => {
    setAutoNext(val);
    saveSettings({ vibration: vibrationOn, autoNext: val });
  };

  const phrase = PHRASES[activeIdx];
  const count = counts[phrase.id] || 0;
  const reached = count >= phrase.target;
  const progress = Math.min(1, count / phrase.target);

  const increment = () => {
    const newCount = count + 1;
    if (vibrationOn && Platform.OS !== 'web') {
      // Сильнее вибрация при достижении цели
      if (newCount === phrase.target) {
        Vibration.vibrate([0, 30, 50, 30, 50, 80]);
      } else {
        Vibration.vibrate(15);
      }
    }
    const next = { ...counts, [phrase.id]: newCount };
    const newTotal = totalEver + 1;
    setCounts(next);
    setTotalEver(newTotal);
    persist(next, newTotal);
    // Авто-переход к следующей фразе
    if (autoNext && newCount === phrase.target && activeIdx < PHRASES.length - 1) {
      setTimeout(() => setActiveIdx((i) => i + 1), 600);
    }
  };

  const resetCurrent = () => {
    const next = { ...counts, [phrase.id]: 0 };
    setCounts(next);
    persist(next, totalEver);
  };

  const resetAll = () => {
    const empty = {};
    setCounts(empty);
    persist(empty, totalEver);
  };

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} pattern>
        <View style={styles.headerTop}>
          
          <IconText icon="beads" style={styles.totalCount}>{totalEver}</IconText>
        </View>
        <Text style={styles.title}>Тасбих</Text>
        <Text style={styles.subtitle}>Поминание Аллаха — за всё время вы насчитали {totalEver}</Text>
      </DetailHeader>

      {/* Табы — горизонтальный скролл с фразами */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsRow}
      >
        {PHRASES.map((p, i) => {
          const active = i === activeIdx;
          const cnt = counts[p.id] || 0;
          const done = cnt >= p.target;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => setActiveIdx(i)}
              style={[
                styles.tab,
                active && { backgroundColor: p.color, borderColor: p.color },
                done && !active && styles.tabDone,
              ]}
            >
              <Text style={[styles.tabText, active && { color: '#fff' }]} numberOfLines={1}>
                {done ? '✓ ' : ''}{p.ru}
              </Text>
              <Text style={[styles.tabCount, active && { color: '#fff' }]}>
                {cnt}/{p.target}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Фраза */}
        <View style={[styles.phraseBox, { backgroundColor: phrase.color + '10' }]}>
          <Text style={[styles.phraseAr, { color: phrase.color }]}>{phrase.ar}</Text>
          <Text style={styles.phraseTr}>{phrase.tr}</Text>
          <Text style={[styles.phraseRu, { color: phrase.color }]}>{phrase.ru}</Text>
        </View>

        {/* Главная кнопка-счётчик */}
        <TouchableOpacity
          onPress={increment}
          activeOpacity={0.7}
          style={[
            styles.counter,
            {
              borderColor: phrase.color,
              backgroundColor: reached ? phrase.color : phrase.color + '15',
            },
          ]}
        >
          <Text style={[styles.counterNum, { color: reached ? '#fff' : phrase.color }]}>
            {count}
          </Text>
          <Text style={[styles.counterTarget, { color: reached ? '#fff' : phrase.color }]}>
            из {phrase.target}
          </Text>
          {reached && (
            <Text style={[styles.reached, { color: '#fff' }]}>✓ Цель достигнута</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.tapHint}>Нажимайте, пока не достигнете цели</Text>

        {/* Прогресс-бар */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: phrase.color }]} />
        </View>

        {/* Кнопки сброса */}
        <View style={{ flexDirection: 'row', marginTop: spacing.lg }}>
          <Button title="↺ Сбросить эту" variant="outline" onPress={resetCurrent} style={{ flex: 1, marginRight: spacing.sm }} />
          <Button title="↻ Сбросить все" variant="outline" onPress={resetAll} style={{ flex: 1 }} />
        </View>

        {/* Настройки */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Настройки</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <IconText icon="smartphone" style={styles.settingTitle}>Вибрация</IconText>
              <Text style={styles.settingDesc}>Короткая вибрация при каждом нажатии</Text>
            </View>
            <Switch
              value={vibrationOn}
              onValueChange={toggleVibration}
              trackColor={{ false: colors.border, true: phrase.color }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>⏭ Авто-переход</Text>
              <Text style={styles.settingDesc}>После достижения цели — следующая фраза</Text>
            </View>
            <Switch
              value={autoNext}
              onValueChange={toggleAutoNext}
              trackColor={{ false: colors.border, true: phrase.color }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  totalCount: { ...typography.bodyMedium, color: '#fff', fontWeight: '700' },
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.small, color: '#fff', opacity: 0.85, marginTop: 4 },

  // На iOS у ScrollView по умолчанию flexShrink: 1 — рядом с вертикальным ScrollView
  // полоса чипов сжималась по высоте и счётчик «34/33» вылезал за кнопку.
  tabsScroll: { flexGrow: 0, flexShrink: 0 },
  tabsRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  tab: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  tabDone: { borderColor: colors.success, backgroundColor: colors.success + '10' },
  tabText: { ...typography.caption, color: colors.textPrimary, fontWeight: '700' },
  tabCount: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  body: { padding: spacing.lg, paddingBottom: spacing.xxxl, alignItems: 'center' },

  phraseBox: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    alignSelf: 'stretch',
  },
  phraseAr: { fontSize: 36, lineHeight: 60, fontWeight: '500' },
  phraseTr: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  phraseRu: { ...typography.h4, marginTop: 4 },

  counter: {
    width: 240, height: 240,
    borderRadius: 120,
    borderWidth: 6,
    alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.sm,
  },
  counterNum: { fontSize: 80, fontWeight: '900' },
  counterTarget: { ...typography.body, marginTop: -8, opacity: 0.8 },
  reached: { ...typography.caption, fontWeight: '700', marginTop: 8 },

  tapHint: { ...typography.small, color: colors.textMuted, marginTop: spacing.md },

  progressTrack: {
    alignSelf: 'stretch',
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  settingsCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  settingTitle: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '600' },
  settingDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  settingDivider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
});
