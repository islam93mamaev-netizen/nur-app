import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Button from '../../components/Button';
import { spacing, radii, typography } from '../../constants/theme';
import { findLesson } from '../../data/grammar';
import { speak, stop } from '../../services/ttsService';
import { useTheme } from '../../store/themeStore';

export default function GrammarLessonScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // Принимаем оба варианта параметра: старые ссылки (закладки, путь) могли передавать lessonId
  const lesson = findLesson(route.params?.id ?? route.params?.lessonId);
  const [pickedAnswer, setPickedAnswer] = useState(null);

  useEffect(() => () => { stop(); }, []);

  if (!lesson) return null;

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} backLabel="← К урокам" background={lesson.color}>
        
        <Text style={styles.icon}>{lesson.icon}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        <Pill label={lesson.level} background="#fff" textColor={lesson.color} />
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Введение от «преподавателя» */}
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '12' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Text style={{ fontSize: 26, marginRight: spacing.sm }}>👨‍🏫</Text>
            <Text style={[styles.label, { color: colors.accentDark }]}>Преподаватель</Text>
          </View>
          <Text style={styles.intro}>{lesson.intro}</Text>
        </Card>

        {/* Фразы */}
        <Text style={styles.sectionTitle}>Фразы и разбор</Text>
        {lesson.phrases.map((phrase, i) => (
          <Card key={i} style={{ marginBottom: spacing.md }}>
            <View style={styles.phraseHeader}>
              <Text style={styles.phraseNum}>{i + 1}</Text>
              <TouchableOpacity
                onPress={() => speak(phrase.ar, { rate: 0.5 })}
                style={[styles.playBtn, { borderColor: lesson.color }]}
              >
                <Text style={{ color: lesson.color, fontWeight: '700' }}>🔊</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.phraseAr}>{phrase.ar}</Text>
            <Text style={styles.phraseTr}>{phrase.tr}</Text>
            <Text style={styles.phraseRu}>{phrase.ru}</Text>

            {!!phrase.context && (
              <View style={[styles.contextBox, { borderLeftColor: lesson.color }]}>
                <Text style={styles.context}>💡 {phrase.context}</Text>
              </View>
            )}

            {phrase.breakdown && (
              <View style={styles.breakdown}>
                <Text style={styles.breakdownLabel}>Пословный разбор:</Text>
                {phrase.breakdown.map((part, j) => (
                  <View key={j} style={styles.breakdownRow}>
                    <Text style={styles.breakdownAr}>{part.ar}</Text>
                    <Text style={styles.breakdownArrow}>→</Text>
                    <Text style={styles.breakdownRu}>{part.ru}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ))}

        {/* Грамматика */}
        {lesson.grammar && (
          <>
            <Text style={styles.sectionTitle}>📖 Грамматика</Text>
            <Card style={{ backgroundColor: colors.info + '10' }}>
              <Text style={styles.grammar}>{lesson.grammar}</Text>
            </Card>
          </>
        )}

        {/* Мини-тест */}
        {lesson.mini && (
          <>
            <Text style={styles.sectionTitle}>✅ Проверь себя</Text>
            <Card>
              <Text style={styles.miniQ}>{lesson.mini.q}</Text>
              {lesson.mini.options.map((opt, i) => {
                const isPicked = pickedAnswer === i;
                const isCorrect = pickedAnswer !== null && i === lesson.mini.answer;
                const isWrong = pickedAnswer !== null && isPicked && i !== lesson.mini.answer;
                return (
                  <TouchableOpacity
                    key={i}
                    disabled={pickedAnswer !== null}
                    onPress={() => setPickedAnswer(i)}
                    style={[
                      styles.miniOpt,
                      isCorrect && styles.miniOptCorrect,
                      isWrong && styles.miniOptWrong,
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniOptText,
                        (isCorrect || isWrong) && { color: '#fff' },
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {pickedAnswer !== null && (
                <View style={{ marginTop: spacing.sm }}>
                  <Text style={[
                    styles.feedback,
                    { color: pickedAnswer === lesson.mini.answer ? colors.success : colors.danger }
                  ]}>
                    {pickedAnswer === lesson.mini.answer
                      ? '✓ Верно! Машаалла.'
                      : '✗ Не совсем — попробуйте ещё раз позже.'}
                  </Text>
                  <Button
                    title="Сбросить"
                    variant="outline"
                    size="sm"
                    onPress={() => setPickedAnswer(null)}
                    style={{ marginTop: spacing.sm }}
                  />
                </View>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  icon: { fontSize: 40, marginBottom: spacing.sm },
  title: { ...typography.h1, color: '#fff', textAlign: 'center', marginBottom: spacing.sm },

  label: { ...typography.caption, fontWeight: '700' },
  intro: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },

  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.md },

  phraseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  phraseNum: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radii.pill,
  },
  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  phraseAr: {
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 44,
  },
  phraseTr: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  phraseRu: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: 6, fontWeight: '600' },

  contextBox: {
    marginTop: spacing.sm,
    paddingLeft: spacing.md,
    paddingVertical: 4,
    borderLeftWidth: 3,
  },
  context: { ...typography.small, color: colors.textPrimary, lineHeight: 20 },

  breakdown: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
  },
  breakdownLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', marginBottom: 4 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  breakdownAr: { fontSize: 20, color: colors.primary, minWidth: 80, textAlign: 'right' },
  breakdownArrow: { ...typography.caption, color: colors.textMuted, marginHorizontal: spacing.sm },
  breakdownRu: { ...typography.small, color: colors.textPrimary, flex: 1 },

  grammar: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },

  miniQ: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.md },
  miniOpt: {
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  miniOptCorrect: { backgroundColor: colors.success, borderColor: colors.success },
  miniOptWrong: { backgroundColor: colors.danger, borderColor: colors.danger },
  miniOptText: { ...typography.body, color: colors.textPrimary },
  feedback: { ...typography.bodyMedium, fontWeight: '700' },
});
