// PathQuiz — мини-тест с выбором одного из вариантов и экраном результата.
// Сам ведёт состояние (номер вопроса, счёт, выбранный ответ) и показывает
// подсветку правильного/неправильного, хаптику и итог.
//
// Использование:
//   <PathQuiz
//     questions={[{ prompt, promptAr?, options: [...], answer, arabicOptions? }]}
//     color={stage.color}          // цвет прогресс-бара
//     passRatio={0.7}              // порог прохождения
//     onComplete={(score, total, passed) => {...}}  // вызывается один раз в конце
//     onRetry={() => ...}          // «Повторить материал» при провале
//     onContinue={() => ...}       // «К следующему шагу» при успехе
//   />

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './Card';
import Button from './Button';
import ProgressBar from './ProgressBar';
import { spacing, radii, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';
import * as haptics from '../utils/haptics';
import CategoryIcon from './CategoryIcon';

const NEXT_DELAY_MS = 700; // пауза, чтобы увидеть подсветку ответа

export default function PathQuiz({
  questions,
  color,
  passRatio = 0.7,
  onComplete,
  onRetry,
  onContinue,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);

  // Таймер перехода к следующему вопросу. Очищаем при размонтировании:
  // иначе после выхода с экрана сработал бы setState уже закрытого компонента.
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const total = questions.length;
  const passed = score / Math.max(1, total) >= passRatio;
  const q = questions[qIdx];

  const pick = (opt) => {
    if (picked !== null) return; // уже ответили на этот вопрос
    const correct = opt === q.answer;
    if (correct) haptics.success();
    else haptics.error();
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);
    setPicked(opt);

    timerRef.current = setTimeout(() => {
      if (qIdx + 1 >= total) {
        const ok = newScore / Math.max(1, total) >= passRatio;
        if (ok) haptics.success();
        else haptics.error();
        setDone(true);
        if (onComplete) onComplete(newScore, total, ok);
      } else {
        setQIdx(qIdx + 1);
        setPicked(null);
      }
    }, NEXT_DELAY_MS);
  };

  if (done) {
    return (
      <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
        {passed ? (
          <>
            <CategoryIcon icon="🎉" textStyle={styles.doneEmoji} />
            <Text style={[styles.doneTitle, { color: colors.success }]}>Шаг пройден!</Text>
            <Text style={styles.doneScore}>{score} из {total} правильно · +XP</Text>
            <Button title="К следующему шагу" onPress={onContinue} style={styles.doneBtn} />
          </>
        ) : (
          <>
            <CategoryIcon icon="📖" textStyle={styles.doneEmoji} />
            <Text style={[styles.doneTitle, { color: colors.danger }]}>Нужно ещё повторить</Text>
            <Text style={styles.doneScore}>
              {score} из {total} — для прохождения нужно {Math.ceil(total * passRatio)}
            </Text>
            <Button title="Повторить материал" onPress={onRetry} style={styles.doneBtn} />
          </>
        )}
      </Card>
    );
  }

  if (!q) return null;

  return (
    <>
      <ProgressBar value={qIdx} max={total} color={color} />
      <Text style={styles.counter}>Вопрос {qIdx + 1} из {total}</Text>
      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.prompt}>{q.prompt}</Text>
        {q.promptAr ? <Text style={styles.promptAr}>{q.promptAr}</Text> : null}
      </Card>
      <View style={{ marginTop: spacing.md }}>
        {q.options.map((opt) => {
          const isPicked = picked === opt;
          const isCorrect = picked !== null && opt === q.answer;
          const isWrong = isPicked && opt !== q.answer;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => pick(opt)}
              activeOpacity={0.8}
              accessibilityRole="button"
              style={[
                styles.option,
                isCorrect && { backgroundColor: colors.success + '20', borderColor: colors.success },
                isWrong && { backgroundColor: colors.danger + '15', borderColor: colors.danger },
              ]}
            >
              <Text style={[styles.optionText, q.arabicOptions && styles.optionAr]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  counter: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  prompt: { ...typography.bodyMedium, color: colors.textSecondary },
  promptAr: { fontSize: 52, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.md, lineHeight: 84 },
  option: {
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionText: { ...typography.bodyMedium, color: colors.textPrimary, textAlign: 'center' },
  optionAr: { fontSize: 32, lineHeight: 56 },

  doneEmoji: { fontSize: 44, marginBottom: spacing.sm },
  doneTitle: { ...typography.h3 },
  doneScore: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
  doneBtn: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
