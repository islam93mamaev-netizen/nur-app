import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Button from '../../components/Button';
import { spacing, radii, typography } from '../../constants/theme';
import { exams, examLevels, getExamsByLevel } from '../../data/exams';
import { useProgress } from '../../store/progressStore';
import { useTheme } from '../../store/themeStore';
import { confirmAction } from '../../utils/dialogs';

export default function ExamsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, resetQuiz, resetAllQuizzes } = useProgress();

  const confirmResetOne = (id, title) => {
    confirmAction({
      title: 'Сбросить результат?',
      message: `«${title}» — пройти заново. Текущий результат будет удалён.`,
      confirmText: 'Сбросить',
      onConfirm: () => resetQuiz('exam_' + id),
    });
  };

  const confirmResetAll = () => {
    confirmAction({
      title: 'Сбросить все тесты?',
      message: 'Все результаты тестов и экзаменов будут удалены. Прогресс по урокам и словам сохранится.',
      confirmText: 'Сбросить всё',
      onConfirm: resetAllQuizzes,
    });
  };

  const masterExam = exams.master;
  const masterScore = (() => {
    const prev = state.completedQuizzes['exam_master'];
    return prev ? Math.round((prev.score / prev.total) * 100) : null;
  })();

  return (
    <Screen padded={false}>
      <DetailHeader onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>Тесты и экзамены</Text>
        <Text style={styles.subtitle}>
          {Object.keys(exams).length} тестов • 3 уровня сложности
        </Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Общий экзамен — отдельной большой плашкой */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Exam', { examId: 'master' })}
          onLongPress={() => confirmResetOne('master', masterExam.title)}
          delayLongPress={500}
        >
          <Card style={[styles.master, { backgroundColor: masterExam.color }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.masterIcon}>{masterExam.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.masterTitle}>{masterExam.title}</Text>
                <Text style={styles.masterDesc}>{masterExam.description}</Text>
                <Pill
                  label={`${masterExam.questions.length} вопросов`}
                  background="#fff"
                  textColor={masterExam.color}
                />
              </View>
              {masterScore !== null && (
                <View style={styles.masterScore}>
                  <Text style={[styles.masterScoreText, { color: masterExam.color }]}>
                    {masterScore}%
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </TouchableOpacity>

        {/* Тесты по уровням */}
        {examLevels.map((level) => {
          const ids = getExamsByLevel(level.id);
          if (ids.length === 0) return null;
          return (
            <View key={level.id} style={{ marginTop: spacing.xl }}>
              <View style={styles.levelHeader}>
                <View style={[styles.levelDot, { backgroundColor: level.color }]}>
                  <Text style={{ fontSize: 16 }}>{level.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.levelTitle, { color: level.color }]}>
                    {level.title}
                  </Text>
                  <Text style={styles.levelDesc}>{level.description}</Text>
                </View>
                <Pill label={`${ids.length}`} background={level.color + '15'} textColor={level.color} />
              </View>

              {ids.map((id) => {
                const e = exams[id];
                if (!e) return null;
                const prev = state.completedQuizzes['exam_' + id];
                const score = prev ? Math.round((prev.score / prev.total) * 100) : null;
                return (
                  <TouchableOpacity
                    key={id}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Exam', { examId: id })}
                    onLongPress={() => confirmResetOne(id, e.title)}
                    delayLongPress={500}
                  >
                    <Card style={[styles.examCard, { borderLeftColor: e.color }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.examIcon}>{e.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.examTitle}>{e.title}</Text>
                          <Text style={styles.examDesc} numberOfLines={2}>{e.description}</Text>
                          <View style={{ flexDirection: 'row', marginTop: spacing.sm, flexWrap: 'wrap' }}>
                            <Pill
                              label={e.difficulty}
                              background={e.color + '15'}
                              textColor={e.color}
                            />
                            <View style={{ width: 6 }} />
                            <Pill
                              label={`${e.questions.length} ?`}
                              background={colors.surfaceAlt}
                              textColor={colors.textSecondary}
                            />
                          </View>
                        </View>
                        {score !== null && (
                          <View style={[styles.scoreBox, { backgroundColor: e.color + '15' }]}>
                            <Text style={[styles.scoreText, { color: e.color }]}>{score}%</Text>
                          </View>
                        )}
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        <Card style={{ marginTop: spacing.xl, backgroundColor: colors.accent + '15' }}>
          <Text style={styles.tipTitle}>💡 Как проходить тесты</Text>
          <Text style={styles.tipText}>
            • Начните с уровня «Новичок», чтобы знакомиться с темами.{'\n'}
            • Переходите на «Средний», когда основы освоены.{'\n'}
            • «Сложный» — для проверки глубоких знаний.{'\n'}
            • «Общий экзамен» — финальная проверка по всем темам.{'\n'}
            • За правильные ответы вы получаете XP. Лучший результат сохраняется.{'\n'}
            • **Удерживайте тест** ≈ 0.5 сек, чтобы сбросить его результат.
          </Text>
        </Card>

        <View style={{ marginTop: spacing.lg }}>
          <Button
            title="Сбросить все результаты тестов"
            variant="outline"
            onPress={confirmResetAll}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  master: { padding: spacing.lg },
  masterIcon: { fontSize: 40, marginRight: spacing.md },
  masterTitle: { ...typography.h2, color: '#fff' },
  masterDesc: { ...typography.small, color: '#fff', opacity: 0.9, marginVertical: spacing.sm },
  masterScore: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginLeft: spacing.sm,
  },
  masterScoreText: { ...typography.bodyMedium, fontWeight: '700' },

  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  levelDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  levelTitle: { ...typography.h3, marginBottom: 2 },
  levelDesc: { ...typography.small, color: colors.textSecondary },

  examCard: {
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  examIcon: { fontSize: 28, marginRight: spacing.md },
  examTitle: { ...typography.h4, color: colors.textPrimary },
  examDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },

  scoreBox: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.pill, marginLeft: spacing.sm },
  scoreText: { ...typography.bodyMedium, fontWeight: '700' },

  tipTitle: { ...typography.h4, color: colors.accentDark, marginBottom: spacing.sm },
  tipText: { ...typography.small, color: colors.textPrimary, lineHeight: 20 },
});
