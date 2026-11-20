// Карточки «продолжить» на главной: следующий шаг «Пути арабского»
// и последний открытый урок «Основ».

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../Card';
import Pill from '../Pill';
import Icon from '../Icon';
import ProgressBar from '../ProgressBar';
import SectionHeader from '../SectionHeader';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { getNextUnit, allUnits } from '../../data/arabicPath';
import { findLesson } from '../../data/modules';

const PATH_COLOR = '#1E9C76';

// Показывается, если путь уже начат или цель профиля — арабский/Коран
export function PathProgressCard({ completedUnits = {}, goal, onOpen }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const done = Object.keys(completedUnits).length;
  const show = done > 0 || goal === 'arabic' || goal === 'quran';
  const nextUnit = show ? getNextUnit(completedUnits) : null;
  if (!nextUnit) return null;

  return (
    <>
      <SectionHeader title="Путь арабского" />
      <Card onPress={() => onOpen(nextUnit.id)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.iconBox}>
            <Icon name="map" size={22} color={PATH_COLOR} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Шаг {done + 1} из {allUnits.length}</Text>
            <Text style={styles.title} numberOfLines={1}>{nextUnit.title}</Text>
          </View>
          <Icon name="chevronRight" size={20} color={colors.textMuted} />
        </View>
        <View style={{ marginTop: spacing.sm }}>
          <ProgressBar value={done} max={allUnits.length} color={PATH_COLOR} height={6} />
        </View>
      </Card>
    </>
  );
}

export function ContinueLessonCard({ lessonId, onOpen }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const last = lessonId ? findLesson(lessonId) : null;
  if (!last) return null;

  return (
    <>
      <SectionHeader title="Продолжить" />
      <Card onPress={() => onOpen(last.lesson.id)}>
        <Pill label={last.module.title} background={last.module.color + '15'} textColor={last.module.color} />
        <Text style={[styles.lessonTitle, { marginTop: spacing.sm }]}>{last.lesson.title}</Text>
        <Text style={styles.lessonText} numberOfLines={2}>{last.lesson.summary}</Text>
      </Card>
    </>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: PATH_COLOR + '15',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  label: { ...typography.caption, color: colors.textSecondary },
  title: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: 2 },
  lessonTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  lessonText: { ...typography.small, color: colors.textSecondary, lineHeight: 20, marginBottom: 4 },
});
