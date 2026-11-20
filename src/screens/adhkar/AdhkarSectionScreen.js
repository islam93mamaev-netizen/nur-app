import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '../../components/Screen';
import CategoryIcon from '../../components/CategoryIcon';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import ReferenceText from '../../components/ReferenceText';
import { spacing, radii, typography } from '../../constants/theme';
import { findAdhkarSection } from '../../data/adhkar';
import { surahs } from '../../data/quran';
import Icon from '../../components/Icon';
import { useTheme } from '../../store/themeStore';
import * as haptics from '../../utils/haptics';
import useAdhkarPlayer from '../../hooks/useAdhkarPlayer';

// Подпись фрагмента quranAudio: название суры или номер аята
function fragmentLabel(q) {
  if (q.ayah != null) return `Аят ${q.ayah}`;
  const s = surahs.find((x) => x.id === q.surah);
  return s ? s.name : `Сура ${q.surah}`;
}

// Длина текста, после которой включается expand/collapse (символов)
const COLLAPSE_THRESHOLD = 220;

// Счётчики повторений сохраняются на текущий день (сбрасываются назавтра):
// { date: 'YYYY-M-D', sections: { [sectionId]: { [itemId]: n } } }
const COUNTS_KEY = '@nur_app/adhkar_counts_v1';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// splitArabic теперь общий — см. utils/arabicParser.js

const TABS = [
  { id: 'ar', label: 'Арабский' },
  { id: 'tr', label: 'Транскрипция' },
  { id: 'ru', label: 'Перевод' },
];

export default function AdhkarSectionScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const section = findAdhkarSection(route.params.sectionId);
  const [counts, setCounts] = useState({});
  // Текущий таб для каждого азкара (по id) — по умолчанию арабский
  const [tabs, setTabs] = useState({});
  // Раскрыт ли длинный текст (по id)
  const [expanded, setExpanded] = useState({});
  // Вся логика воспроизведения — в хуке (TTS, Коран-аудио, фрагменты, токены)
  const { playState, getStatus, togglePlay, toggleFragment, resetPlay, stopAll } = useAdhkarPlayer();

  // Загрузка счётчиков за сегодня (вчерашние — сбрасываются)
  const countsLoaded = useRef(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(COUNTS_KEY);
        if (alive && raw) {
          const saved = JSON.parse(raw);
          if (saved?.date === todayStr() && saved.sections?.[route.params.sectionId]) {
            setCounts(saved.sections[route.params.sectionId]);
          }
        }
      } catch { /* ignore */ }
      countsLoaded.current = true;
    })();
    return () => { alive = false; };
  }, [route.params.sectionId]);

  // Сохранение счётчиков (с дебаунсом, после загрузки)
  useEffect(() => {
    if (!countsLoaded.current) return;
    const t = setTimeout(async () => {
      try {
        const raw = await AsyncStorage.getItem(COUNTS_KEY);
        let saved = null;
        try { saved = raw ? JSON.parse(raw) : null; } catch { /* ignore */ }
        const today = todayStr();
        const sections = saved?.date === today ? (saved.sections || {}) : {};
        sections[route.params.sectionId] = counts;
        await AsyncStorage.setItem(COUNTS_KEY, JSON.stringify({ date: today, sections }));
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(t);
  }, [counts, route.params.sectionId]);

  if (!section) return null;

  const getTab = (id) => tabs[id] || 'ar';
  const setTab = (id, t) => setTabs((s) => ({ ...s, [id]: t }));
  const isExpanded = (id) => !!expanded[id];
  const toggleExpand = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const tick = (id, target) => {
    setCounts((c) => {
      const cur = c[id] || 0;
      const next = Math.min(cur + 1, target);
      // Тактильная отдача: лёгкий щелчок, при достижении цели — «успех»
      if (next === target && cur !== target) haptics.success();
      else if (next !== cur) haptics.tap();
      return { ...c, [id]: next };
    });
  };
  const resetCount = (id) => setCounts((c) => ({ ...c, [id]: 0 }));

  const allDone = section.items.every((i) => (counts[i.id] || 0) >= i.times);

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => { stopAll(); navigation.goBack(); }} backLabel="← К азкарам" background={section.color}>
        
        <CategoryIcon icon={section.icon} size={44} color="#fff" style={{ marginBottom: spacing.sm }} />
        <Text style={styles.title}>{section.title}</Text>
        <Text style={styles.subtitle}>{section.items.length} азкаров</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {allDone && (
          <Card style={{ marginBottom: spacing.md, backgroundColor: colors.success + '15', borderLeftWidth: 4, borderLeftColor: colors.success }}>
            <Text style={[styles.done, { color: colors.success }]}>✓ Все азкары выполнены</Text>
          </Card>
        )}

        {section.items.map((it, idx) => {
          const count = counts[it.id] || 0;
          const done = count >= it.times;
          const status = getStatus(it.id);
          const isPlaying = status === 'playing';
          const isPaused = status === 'paused';
          const cur = playState[it.id];
          const progress = cur && cur.chunks?.length
            ? `${cur.idx + (isPlaying ? 1 : 0)}/${cur.chunks.length}`
            : null;

          const tab = getTab(it.id);
          const rawText =
            tab === 'ar' ? it.ar :
            tab === 'tr' ? (it.tr || '— транскрипция не указана') :
                           (it.ru || '— перевод не указан');
          const needsCollapse = rawText && rawText.length > COLLAPSE_THRESHOLD;
          const expandedNow = isExpanded(it.id);
          const shownText = !needsCollapse || expandedNow
            ? rawText
            : rawText.slice(0, COLLAPSE_THRESHOLD).trim() + '…';

          return (
            <Card key={it.id} style={{ marginBottom: spacing.md }}>
              <View style={styles.itHeader}>
                <View style={[styles.num, { backgroundColor: section.color + '15' }]}>
                  <Text style={[styles.numText, { color: section.color }]}>{idx + 1}</Text>
                </View>
                <Text style={styles.itTitle} numberOfLines={2}>{it.title}</Text>
                {(isPlaying || isPaused) && (
                  <TouchableOpacity
                    onPress={() => resetPlay(it)}
                    style={[styles.resetBtn, { borderColor: section.color }]}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={[styles.resetIcon, { color: section.color }]}>⟲</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => togglePlay(it)}
                  accessibilityRole="button"
                  accessibilityLabel={isPlaying ? 'Пауза' : 'Слушать'}
                  style={[
                    styles.playBtn,
                    isPlaying && { backgroundColor: section.color + '30' },
                    isPaused  && { backgroundColor: section.color + '15', borderWidth: 1.5, borderColor: section.color },
                  ]}
                >
                  <Icon name={isPlaying ? 'pause' : 'play'} size={15} color={section.color} />
                </TouchableOpacity>
              </View>

              {(isPlaying || isPaused) && progress && (
                <Text style={[styles.progress, { color: section.color }]}>
                  {isPaused ? '⏸ на паузе' : '▶ воспроизводится'} · фрагмент {progress}
                </Text>
              )}

              {/* Отдельные фрагменты (суры/аяты) — можно слушать по одному */}
              {Array.isArray(it.quranAudio) && it.quranAudio.length > 1 && (
                <View style={styles.fragRow}>
                  {it.quranAudio.map((q, i) => {
                    const activeFrag = cur?.single && cur.idx === i && (isPlaying || isPaused);
                    const fragPlaying = activeFrag && isPlaying;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => toggleFragment(it, i)}
                        style={[
                          styles.fragChip,
                          { flexDirection: 'row', alignItems: 'center' },
                          activeFrag && { backgroundColor: section.color, borderColor: section.color },
                        ]}
                      >
                        <Icon
                          name={fragPlaying ? 'pause' : 'play'}
                          size={10}
                          color={activeFrag ? '#fff' : colors.textSecondary}
                          style={{ marginRight: 5 }}
                        />
                        <Text style={[styles.fragChipText, activeFrag && { color: '#fff' }]}>
                          {fragmentLabel(q)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Табы AR / TR / RU */}
              <View style={styles.tabsRow}>
                {TABS.map((t) => {
                  const active = tab === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setTab(it.id, t.id)}
                      style={[
                        styles.tab,
                        active && { backgroundColor: section.color },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          active && styles.tabTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Текст в выбранном режиме */}
              <Text
                style={[
                  styles.contentText,
                  tab === 'ar' && styles.contentAr,
                  tab === 'tr' && styles.contentTr,
                ]}
              >
                {shownText}
              </Text>

              {/* Expand / Collapse */}
              {needsCollapse && (
                <TouchableOpacity onPress={() => toggleExpand(it.id)} style={styles.expandBtn}>
                  <Text style={[styles.expandText, { color: section.color }]}>
                    {expandedNow ? '↑ Свернуть' : '↓ Развернуть полностью'}
                  </Text>
                </TouchableOpacity>
              )}

              {!!it.benefit && (
                <View style={[styles.benefit, { borderLeftColor: colors.accent }]}>
                  <Text style={styles.benefitLabel}>💎 Польза</Text>
                  <Text style={styles.benefitText}>{it.benefit}</Text>
                </View>
              )}

              {!!it.source && (
                <View style={styles.sourceBox}>
                  <Text style={styles.sourceLabel}>📚 Источник:</Text>
                  <ReferenceText text={it.source} style={styles.sourceText} />
                </View>
              )}

              <TouchableOpacity
                onPress={() => tick(it.id, it.times)}
                activeOpacity={0.85}
                style={[styles.counter, { backgroundColor: done ? colors.success : section.color }]}
              >
                <Text style={styles.counterText}>
                  {done ? '✓ ' : ''}{count} / {it.times}
                </Text>
              </TouchableOpacity>
              {count > 0 && (
                <TouchableOpacity onPress={() => resetCount(it.id)} style={{ marginTop: 6 }}>
                  <Text style={styles.resetLink}>↺ Сбросить счётчик</Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  done: { ...typography.h4, fontWeight: '700', textAlign: 'center' },

  itHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  numText: { ...typography.caption, fontWeight: '700' },
  itTitle: { ...typography.h4, color: colors.textPrimary, flex: 1 },

  resetBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 6,
  },
  resetIcon: { fontSize: 18, fontWeight: '700' },

  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 6,
  },
  progress: { ...typography.caption, fontWeight: '700', marginBottom: spacing.sm },

  // Чипы отдельных фрагментов (суры/аяты)
  fragRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  fragChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fragChipText: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },

  // Табы
  tabsRow: { flexDirection: 'row', marginBottom: spacing.sm, gap: 6 },
  tab: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
  },
  tabText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  // Текст в табе
  contentText: {
    ...typography.body, color: colors.textPrimary,
    lineHeight: 24, flexShrink: 1, flexWrap: 'wrap',
  },
  contentAr: {
    fontSize: 22, lineHeight: 40,
    textAlign: 'right', writingDirection: 'rtl',
  },
  contentTr: {
    fontStyle: 'italic',
    color: colors.textSecondary,
  },

  expandBtn: { marginTop: spacing.sm, alignSelf: 'flex-start' },
  expandText: { ...typography.small, fontWeight: '700' },

  benefit: { marginTop: spacing.sm, paddingLeft: spacing.md, borderLeftWidth: 3 },
  benefitLabel: { ...typography.caption, color: colors.accentDark, fontWeight: '700' },
  benefitText: { ...typography.small, color: colors.textPrimary, marginTop: 2, lineHeight: 18 },

  sourceBox: { marginTop: spacing.sm, padding: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radii.sm },
  sourceLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700', marginBottom: 2 },
  sourceText: { ...typography.caption, color: colors.textPrimary },

  counter: {
    marginTop: spacing.md,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  counterText: { ...typography.h3, color: '#fff', fontWeight: '700' },
  resetLink: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
});
