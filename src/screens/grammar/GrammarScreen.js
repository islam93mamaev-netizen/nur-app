import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, radii, typography } from '../../constants/theme';
import { grammarLessons, grammarLevels } from '../../data/grammar';
import { useTheme } from '../../store/themeStore';

export default function GrammarScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // По умолчанию — все уровни видны. Можно отфильтровать через таб.
  const [activeLevel, setActiveLevel] = useState('all');

  const filtered = activeLevel === 'all'
    ? grammarLessons
    : grammarLessons.filter((l) => l.level === activeLevel);

  const byLevel = grammarLevels.map((lv) => ({
    ...lv,
    lessons: grammarLessons.filter((l) => l.level === lv.id),
  }));

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.bismi}>تَعَلَّمِ ٱلْعَرَبِيَّة</Text>
        <Text style={styles.title}>Грамматика и разговорник</Text>
        <Text style={styles.subtitle}>
          {grammarLessons.length} уроков • от A1 до B2
        </Text>
      </View>

      {/* Табы по уровням */}
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsInner}
        >
          {[{ id: 'all', code: 'Все', icon: '📚', color: colors.primary }, ...grammarLevels].map((lv) => {
            const active = activeLevel === lv.id;
            const count = lv.id === 'all'
              ? grammarLessons.length
              : grammarLessons.filter((l) => l.level === lv.id).length;
            return (
              <TouchableOpacity
                key={lv.id}
                onPress={() => setActiveLevel(lv.id)}
                style={[styles.tab, active && { backgroundColor: lv.color, borderColor: lv.color }]}
              >
                <Text style={[styles.tabIcon, active && { color: '#fff' }]}>{lv.icon}</Text>
                <Text style={[styles.tabCode, active && { color: '#fff' }]}>
                  {lv.code || lv.id.toUpperCase()}
                </Text>
                <Text style={[styles.tabCount, active && styles.tabCountActive]}>· {count}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.accent + '12' }}>
          <Text style={[styles.tipTitle, { color: colors.accentDark }]}>📚 Путь от A1 до B2</Text>
          <Text style={styles.tipText}>
            • <Text style={styles.bold}>A1</Text> — приветствия, числа, семья, цвета, базовые вопросы{'\n'}
            • <Text style={styles.bold}>A2</Text> — настоящее время, еда, магазин, мечеть, указательные{'\n'}
            • <Text style={styles.bold}>B1</Text> — прошедшее время, корни, иʿраб (падежи), условные предложения{'\n'}
            • <Text style={styles.bold}>B2</Text> — 10 пород глагола, масдар, причастия, идиомы Корана
          </Text>
        </Card>

        {/* Если выбран конкретный уровень — показываем список с заголовком */}
        {activeLevel !== 'all' ? (
          <>
            {(() => {
              const lv = grammarLevels.find((x) => x.id === activeLevel);
              if (!lv) return null;
              return (
                <Card style={{ marginBottom: spacing.md, backgroundColor: lv.color + '12', borderLeftWidth: 4, borderLeftColor: lv.color }}>
                  <Text style={[styles.lvHead, { color: lv.color }]}>{lv.icon} {lv.code} — {lv.title}</Text>
                  <Text style={styles.lvDesc}>{lv.desc}</Text>
                </Card>
              );
            })()}
            {filtered.map((lesson) => renderLessonCard(lesson, navigation, styles, colors))}
          </>
        ) : (
          // Если «Все» — группируем по уровням
          byLevel.map((lv) => (
            <View key={lv.id} style={{ marginBottom: spacing.lg }}>
              <View style={[styles.lvHeader, { borderLeftColor: lv.color }]}>
                <Text style={styles.lvHeaderIcon}>{lv.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lvHead, { color: lv.color }]}>{lv.code} — {lv.title}</Text>
                  <Text style={styles.lvDesc}>{lv.desc} · {lv.lessons.length} уроков</Text>
                </View>
              </View>
              {lv.lessons.map((lesson) => renderLessonCard(lesson, navigation, styles, colors))}
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function renderLessonCard(lesson, navigation, styles, colors) {
  return (
    <TouchableOpacity
      key={lesson.id}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('GrammarLesson', { id: lesson.id })}
    >
      <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: lesson.color }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.icon}>{lesson.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonIntro} numberOfLines={2}>{lesson.intro}</Text>
            <View style={{ flexDirection: 'row', marginTop: spacing.sm, flexWrap: 'wrap', gap: 6 }}>
              <Pill
                label={(lesson.level || '').toUpperCase()}
                background={lesson.color + '15'}
                textColor={lesson.color}
              />
              <Pill
                label={`${lesson.phrases.length} фраз`}
                background={colors.surfaceAlt}
                textColor={colors.textSecondary}
              />
            </View>
          </View>
          <Text style={styles.chev}>›</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  back: { ...typography.bodyMedium, color: '#fff', alignSelf: 'flex-start' },
  bismi: { fontSize: 26, color: colors.accentLight, marginTop: spacing.md },
  title: { ...typography.h1, color: '#fff', marginTop: 4 },
  subtitle: { ...typography.small, color: '#fff', opacity: 0.85, marginTop: 4 },

  tabsWrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingVertical: spacing.sm,
  },
  tabsInner: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIcon: { fontSize: 14, marginRight: 4, color: colors.textPrimary },
  tabCode: { ...typography.small, color: colors.textPrimary, fontWeight: '700' },
  tabCount: { ...typography.caption, color: colors.textMuted, marginLeft: 4 },
  tabCountActive: { color: 'rgba(255,255,255,0.85)' },

  tipTitle: { ...typography.h4, marginBottom: spacing.sm },
  tipText: { ...typography.small, color: colors.textPrimary, lineHeight: 20 },
  bold: { fontWeight: '700' },

  lvHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingLeft: spacing.md, marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  lvHeaderIcon: { fontSize: 24, marginRight: spacing.sm },
  lvHead: { ...typography.h3, fontWeight: '700' },
  lvDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },

  card: { marginBottom: spacing.md },
  icon: { fontSize: 32, marginRight: spacing.md },
  lessonTitle: { ...typography.h4, color: colors.textPrimary },
  lessonIntro: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },
});
