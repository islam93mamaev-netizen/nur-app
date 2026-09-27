import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';

// Плавное раскрытие/сворачивание списков (Android: старая архитектура требует флага)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import Pill from '../../components/Pill';
import SectionHeader from '../../components/SectionHeader';
import ReferenceText from '../../components/ReferenceText';
import Icon from '../../components/Icon';
import NextPrayerCard from '../../components/NextPrayerCard';
import ContinueReadingCard from '../../components/ContinueReadingCard';
import { spacing, radii, typography } from '../../constants/theme';
import { useProgress } from '../../store/progressStore';
import { getDailyAyat, getRandomAyat } from '../../data/quran';
import { getDailyHadith, getRandomHadith } from '../../data/hadiths';
import { findLesson } from '../../data/modules';
import { sunnahDaily } from '../../data/sunnahDaily';
import { useTheme } from '../../store/themeStore';
import * as haptics from '../../utils/haptics';
import { gregorianToHijri } from '../../utils/hijri';
import { getNextUnit, allUnits } from '../../data/arabicPath';

// ─── Секции быстрых действий ───
// Цвета подобраны средней яркости, чтобы читались и в светлой, и в тёмной теме.
const SECTIONS = [
  {
    id: 'worship',
    title: 'Поклонение',
    items: [
      { icon: 'clock',    title: 'Намазы',     route: 'PrayerTimes', color: '#1E7B5F' },
      { icon: 'compass',  title: 'Кибла',      route: 'Qibla',       color: '#3D6E94' },
      { icon: 'beads',    title: 'Тасбих',     route: 'Tasbih',      color: '#C9A55B' },
      { icon: 'dua',      title: 'Дуа',        route: 'Duas',        color: '#2E7D5B' },
      { icon: 'sunrise',  title: 'Азкары',     route: 'Adhkar',      color: '#A68641' },
      { icon: 'mosque',   title: 'Практика',   route: 'Practice',    color: '#2E7D5B' },
      { icon: 'moon',     title: 'Пост',       route: 'Fasting',     color: '#3D6E94' },
      { icon: 'star',     title: 'Рамадан',    route: 'Ramadan',     color: '#C9A55B' },
    ],
  },
  {
    id: 'language',
    title: 'Изучение языка',
    items: [
      { icon: 'map',      title: 'Путь',       route: 'ArabicPath',  color: '#1E9C76' },
      { icon: 'type',     title: 'Алфавит',    route: 'Alphabet',    color: '#B23A48' },
      { icon: 'pen',      title: 'Грамматика', route: 'Grammar',     color: '#1E7B5F' },
      { icon: 'layers',   title: 'Карточки',   route: 'Flashcards',  color: '#3D6E94' },
      { icon: 'sparkle',  title: '99 имён',    route: 'Asma',        color: '#C9A55B' },
      { icon: 'target',   title: 'Таджвид',    route: 'Tajwid',      color: '#1E7B5F' },
    ],
  },
  {
    id: 'knowledge',
    title: 'Знание',
    items: [
      { icon: 'scroll',     title: 'Хадисы',  route: 'Hadiths', color: '#C9A55B' },
      { icon: 'scale',      title: 'Этика',   route: 'Ethics',  color: '#1E7B5F' },
      { icon: 'helpCircle', title: 'Вопросы', route: 'Faq',     color: '#8C8C8C' },
      { icon: 'feather',    title: 'Сира',    route: 'Sira',    color: '#B23A48' },
      { icon: 'users',      title: 'Сахабы',  route: 'Sahaba',  color: '#1E7B5F' },
      { icon: 'columns',    title: 'Мазхабы', route: 'Mazhabs', color: '#A68641' },
    ],
  },
  {
    id: 'tools',
    title: 'Инструменты',
    items: [
      { icon: 'award',         title: 'Тесты',    route: 'Exams',       color: '#1E7B5F' },
      { icon: 'calendar',      title: 'Хиджра',   route: 'Hijri',       color: '#A68641' },
      { icon: 'bookmark',      title: 'Закладки', route: 'Bookmarks',   color: '#3D6E94' },
      { icon: 'messageCircle', title: 'AI',       route: 'AIAssistant', color: '#2E7D5B' },
      { icon: 'percent',       title: 'Закят',    route: 'Zakat',       color: '#C9A55B' },
    ],
  },
];

// Порядок секций в зависимости от цели, выбранной в онбординге.
// «Инструменты» всегда внизу.
const GOAL_ORDER = {
  salat:  ['worship', 'knowledge', 'language', 'tools'],
  islam:  ['knowledge', 'worship', 'language', 'tools'],
  quran:  ['language', 'worship', 'knowledge', 'tools'],
  arabic: ['language', 'knowledge', 'worship', 'tools'],
};
const DEFAULT_ORDER = ['worship', 'language', 'knowledge', 'tools'];

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, getSunnahDoneToday, toggleSunnahDone } = useProgress();
  const sunnahDone = getSunnahDoneToday();
  const sunnahDoneCount = Object.keys(sunnahDone).length;
  const sunnahTotal = sunnahDaily.length;
  const sunnahPct = Math.round((sunnahDoneCount / sunnahTotal) * 100);
  // Аят и хадис дня — можно обновлять рандомно через кнопку
  const [ayat, setAyat] = useState(() => getDailyAyat());
  const [hadith, setHadith] = useState(() => getDailyHadith());
  // Раскрыть/свернуть список 12 сунн
  const [sunnahExpanded, setSunnahExpanded] = useState(false);

  const last = state.lastOpenedLesson ? findLesson(state.lastOpenedLesson) : null;

  // Порядок секций — по цели из онбординга
  const order = GOAL_ORDER[state.profile.goal] || DEFAULT_ORDER;
  const orderedSections = order
    .map((id) => SECTIONS.find((s) => s.id === id))
    .filter(Boolean);

  return (
    <Screen scroll>
      {/* Приветствие */}
      <View style={styles.greetingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Ассаламу алейкум{state.profile.name ? `, ${state.profile.name}` : ''}</Text>
          <Text style={styles.subgreeting}>Продолжайте свой путь сегодня</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          style={styles.searchBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Поиск по приложению"
        >
          <Icon name="search" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.streak}>
          <Icon name="flame" size={18} color={colors.accentDark} style={{ marginRight: 4 }} />
          <Text style={styles.streakNum}>{state.streak.count}</Text>
        </View>
      </View>

      {/* Следующий намаз + дата хиджры */}
      <NextPrayerCard onPress={() => navigation.navigate('PrayerTimes')} />

      {/* Баннер Рамадана — только в месяц Рамадан */}
      {gregorianToHijri(new Date()).month === 9 && (
        <Card
          onPress={() => navigation.navigate('Ramadan')}
          style={{
            marginTop: spacing.md,
            backgroundColor: colors.accent + '18',
            borderLeftWidth: 4,
            borderLeftColor: colors.accent,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="star" size={22} color={colors.accentDark} style={{ marginRight: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={{ ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' }}>
                Рамадан мубарак!
              </Text>
              <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
                Сегодня {gregorianToHijri(new Date()).day}-й день · трекер поста, сухур и ифтар
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color={colors.textMuted} />
          </View>
        </Card>
      )}

      {/* Цель на сегодня — сунна Пророка ﷺ */}
      <SectionHeader title="Цель за день — сунна" />
      <Card>
        {/* Шапка-кнопка: всегда видна, тап = раскрыть/свернуть */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSunnahExpanded((v) => !v);
          }}
          style={styles.sunnahHeader}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.sunnahTitle}>Сунны Пророка ﷺ</Text>
            <Text style={styles.sunnahSub}>
              {sunnahDoneCount} из {sunnahTotal} • {sunnahPct}%
              {!sunnahExpanded && '  ·  нажмите чтобы открыть'}
            </Text>
          </View>
          <View style={styles.sunnahBadge}>
            <Text style={styles.sunnahBadgeText}>{sunnahPct}%</Text>
          </View>
          <Text style={[styles.sunnahChev, sunnahExpanded && styles.sunnahChevOpen]}>
            ›
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
          <ProgressBar value={sunnahDoneCount} max={sunnahTotal} />
        </View>

        {/* 12 сунн — показываем только если раскрыто */}
        {sunnahExpanded && sunnahDaily.map((item) => {
          const done = !!sunnahDone[item.id];
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => {
                haptics.tap();
                toggleSunnahDone(item.id);
              }}
              style={styles.sunnahRow}
            >
              <View style={[styles.sunnahCheck, done && styles.sunnahCheckDone]}>
                {done && <Text style={styles.sunnahCheckIcon}>✓</Text>}
              </View>
              <Text style={styles.sunnahIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sunnahItemTitle, done && styles.sunnahItemTitleDone]}>{item.title}</Text>
                <Text style={styles.sunnahItemDesc} numberOfLines={2}>{item.desc}</Text>
              </View>
              {item.refRoute && (
                <TouchableOpacity
                  onPress={() => navigation.navigate(item.refRoute, item.refParams)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.sunnahGo}>›</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
        {sunnahExpanded && sunnahPct === 100 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSunnahExpanded(false)}
            style={styles.sunnahDone}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.sunnahDoneText}>🌟 МашаАллах! Все сунны выполнены</Text>
            <Text style={styles.sunnahDoneHint}>(нажмите чтобы свернуть)</Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* Аят дня */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>Аят дня</Text>
        <TouchableOpacity onPress={() => setAyat(getRandomAyat())} style={styles.refreshChip}>
          <Icon name="refresh" size={12} color={colors.primary} style={{ marginRight: 5 }} />
          <Text style={styles.refreshText}>Другой</Text>
        </TouchableOpacity>
      </View>
      <Card>
        <Text style={styles.arabic}>{ayat.ar}</Text>
        <Text style={styles.translit}>{ayat.tr}</Text>
        <Text style={styles.translation}>{ayat.ru}</Text>
        <ReferenceText
          text={ayat.ref}
          style={{ color: colors.accentDark, fontWeight: '600', fontSize: 14 }}
        />
      </Card>

      {/* Хадис дня */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>Хадис дня</Text>
        <TouchableOpacity onPress={() => setHadith(getRandomHadith())} style={styles.refreshChip}>
          <Icon name="refresh" size={12} color={colors.primary} style={{ marginRight: 5 }} />
          <Text style={styles.refreshText}>Другой</Text>
        </TouchableOpacity>
      </View>
      <Card onPress={() => navigation.navigate('HadithDetail', { hadithId: hadith.id })}>
        <Pill label={hadith.theme} background={colors.primary + '15'} textColor={colors.primary} />
        <Text style={[styles.hadithTitle, { marginTop: spacing.sm }]}>{hadith.title}</Text>
        <Text style={styles.hadithText} numberOfLines={3}>{hadith.text}</Text>
        <ReferenceText text={hadith.source} style={styles.source} />
      </Card>

      {/* Путь арабского: продолжить (если начат или выбрана языковая цель) */}
      {(() => {
        const pathDone = Object.keys(state.completedPathUnits || {}).length;
        const showPath = pathDone > 0 || state.profile.goal === 'arabic' || state.profile.goal === 'quran';
        const nextUnit = showPath ? getNextUnit(state.completedPathUnits || {}) : null;
        if (!nextUnit) return null;
        return (
          <>
            <SectionHeader title="Путь арабского" />
            <Card onPress={() => navigation.navigate('PathUnit', { unitId: nextUnit.id })}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.pathIconBox}>
                  <Icon name="map" size={22} color="#1E9C76" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pathLabel}>
                    Шаг {pathDone + 1} из {allUnits.length}
                  </Text>
                  <Text style={styles.pathTitle} numberOfLines={1}>{nextUnit.title}</Text>
                </View>
                <Icon name="chevronRight" size={20} color={colors.textMuted} />
              </View>
              <View style={{ marginTop: spacing.sm }}>
                <ProgressBar value={pathDone} max={allUnits.length} color="#1E9C76" height={6} />
              </View>
            </Card>
          </>
        );
      })()}

      {/* Продолжить чтение Корана */}
      <ContinueReadingCard navigation={navigation} />

      {/* Продолжить */}
      {last && (
        <>
          <SectionHeader title="Продолжить" />
          <Card onPress={() => navigation.navigate('Lesson', { lessonId: last.lesson.id })}>
            <Pill label={last.module.title} background={last.module.color + '15'} textColor={last.module.color} />
            <Text style={[styles.hadithTitle, { marginTop: spacing.sm }]}>{last.lesson.title}</Text>
            <Text style={styles.hadithText} numberOfLines={2}>{last.lesson.summary}</Text>
          </Card>
        </>
      )}

      {/* Секции быстрых действий — порядок зависит от цели пользователя */}
      {orderedSections.map((section) => (
        <View key={section.id}>
          <SectionHeader title={section.title} />
          <View style={styles.miniGrid}>
            {section.items.map((item) => (
              <MiniAction
                key={item.route}
                icon={item.icon}
                title={item.title}
                color={item.color}
                onPress={() => navigation.navigate(item.route)}
              />
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

function MiniAction({ icon, title, color, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.miniCard}>
      <View style={[styles.miniIconBox, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.miniTitle} numberOfLines={1}>{title}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  greeting: { ...typography.h3, color: colors.textPrimary },
  subgreeting: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  searchBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  streakNum: { ...typography.bodyMedium, color: colors.accentDark, fontWeight: '700' },

  arabic: { ...typography.arabic, color: colors.textPrimary, textAlign: 'right', marginBottom: spacing.sm },
  translit: { ...typography.small, color: colors.textMuted, fontStyle: 'italic', marginBottom: spacing.sm },
  translation: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.md, lineHeight: 24 },

  // Шапка для «Аят дня» / «Хадис дня» — заголовок слева, кнопка «🔄 Другой» прижата справа
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  dayTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  refreshChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.primary + '15',
  },
  refreshText: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  hadithTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  hadithText: { ...typography.small, color: colors.textSecondary, lineHeight: 20, marginBottom: 4 },
  source: { ...typography.caption, color: colors.textMuted, marginTop: 4 },

  // Сунны на день
  sunnahHeader: { flexDirection: 'row', alignItems: 'center' },
  sunnahTitle: { ...typography.h4, color: colors.textPrimary },
  sunnahSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  sunnahBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md, paddingVertical: 6,
  },
  sunnahBadgeText: { ...typography.bodyMedium, color: '#fff', fontWeight: '800' },
  sunnahChev: {
    fontSize: 28,
    color: colors.textMuted,
    marginLeft: spacing.sm,
    fontWeight: '700',
  },
  sunnahChevOpen: { transform: [{ rotate: '90deg' }] },
  sunnahRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  sunnahCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sunnahCheckDone: { backgroundColor: colors.success, borderColor: colors.success },
  sunnahCheckIcon: { color: '#fff', fontSize: 14, fontWeight: '900' },
  sunnahIcon: { fontSize: 22, marginRight: spacing.sm },
  sunnahItemTitle: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' },
  sunnahItemTitleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  sunnahItemDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  sunnahGo: { fontSize: 22, color: colors.primary, paddingHorizontal: spacing.sm, fontWeight: '700' },
  sunnahDone: {
    marginTop: spacing.md, padding: spacing.md,
    backgroundColor: colors.success + '15',
    borderRadius: radii.md, alignItems: 'center',
  },
  sunnahDoneText: { ...typography.bodyMedium, color: colors.success, fontWeight: '700' },
  sunnahDoneHint: { ...typography.caption, color: colors.success, marginTop: 4, opacity: 0.8 },

  // Сетка быстрых действий: 4 в ряд, неполные ряды выравниваются влево —
  // пустые ячейки-заглушки больше не нужны.
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm },
  miniCard: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pathIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#1E9C7615',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  pathLabel: { ...typography.caption, color: colors.textSecondary },
  pathTitle: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: 2 },

  miniIconBox: {
    width: 56, height: 56, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  miniTitle: { ...typography.caption, color: colors.textPrimary, textAlign: 'center', fontWeight: '600' },
});
