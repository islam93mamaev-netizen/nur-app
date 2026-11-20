// Блок «Проверь себя» для секционных экранов.
// Принимает массив examIds — рендерит карточки тестов для этого раздела
// прямо на экране (Сира, Этика, Пророки и т.д.), без необходимости идти в общий хаб «Тесты».

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import Pill from './Pill';
import { spacing, radii, typography } from '../constants/theme';
import { exams } from '../data/exams';
import { useProgress } from '../store/progressStore';
import { useTheme } from '../store/themeStore';
import IconText from './IconText';
import CategoryIcon from './CategoryIcon';

export default function SectionTestsBlock({ examIds, title = 'Проверь себя', navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state } = useProgress();
  const available = (examIds || []).map((id) => ({ id, exam: exams[id] })).filter((x) => x.exam);
  if (available.length === 0) return null;

  return (
    <View style={{ marginTop: spacing.xl }}>
      <IconText icon="target" style={styles.sectionTitle}>{title}</IconText>
      <Text style={styles.sectionSub}>Тесты по этому разделу. Каждая попытка — случайные вопросы из пула.</Text>
      {available.map(({ id, exam }) => {
        const result = state.completedQuizzes?.[`exam_${id}_${1}`]; // legacy; reset gives latest
        const lastResult = Object.entries(state.completedQuizzes || {})
          .filter(([k]) => k.startsWith(`exam_${id}_`))
          .sort((a, b) => new Date(b[1].date) - new Date(a[1].date))[0]?.[1];
        const pct = lastResult ? Math.round((lastResult.score / lastResult.total) * 100) : null;

        return (
          <Card
            key={id}
            style={{ marginBottom: spacing.sm }}
            onPress={() => navigation.navigate('Exam', { examId: id, attemptKey: Date.now() })}
          >
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: exam.color + '20' }]}>
                <CategoryIcon icon={exam.icon} textStyle={styles.icon} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.examTitle}>{exam.title}</Text>
                <Text style={styles.examDesc} numberOfLines={2}>{exam.description}</Text>
                <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                  <Pill label={exam.difficulty} background={exam.color + '20'} textColor={exam.color} />
                  {pct !== null && (
                    <Text style={[styles.lastResult, { color: pct >= 70 ? colors.success : colors.warning }]}>
                      {' '}· последний: {pct}%
                    </Text>
                  )}
                </View>
              </View>
              <Text style={styles.chev}>›</Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  sectionSub: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44, height: 44, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: { fontSize: 22 },
  examTitle: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' },
  examDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  lastResult: { ...typography.caption, fontWeight: '600' },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },
});
