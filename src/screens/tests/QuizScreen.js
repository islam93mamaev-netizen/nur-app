import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { spacing, radii, typography } from '../../constants/theme';
import { getQuiz } from '../../data/quizzes';
import { useProgress } from '../../store/progressStore';
import { useTheme } from '../../store/themeStore';
import * as haptics from '../../utils/haptics';

export default function QuizScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // Если передали вопросы напрямую — используем их (режим экзамена с пулом).
  // Иначе — берём из глобального quizzes по id.
  const quiz = useMemo(() => {
    if (Array.isArray(route.params.inlineQuestions)) {
      return {
        title: route.params.quizTitle || '',
        questions: route.params.inlineQuestions,
      };
    }
    return getQuiz(route.params.quizId);
  }, [route.params.inlineQuestions, route.params.quizTitle, route.params.quizId]);
  const { recordQuiz } = useProgress();

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [pickedIdx, setPickedIdx] = useState(null); // что выбрал пользователь (для choice)
  const [finished, setFinished] = useState(false);

  if (!quiz) return null;

  const total = quiz.questions.length;
  const current = quiz.questions[idx];

  // Принимает {correct, picked?} — picked = индекс выбранного варианта (для choice/fill/audio)
  const onAnswer = (correct, picked = null) => {
    // Тактильная отдача: успех/ошибка
    if (correct) haptics.success();
    else haptics.error();
    setWasCorrect(correct);
    setPickedIdx(picked);
    if (correct) setScore((s) => s + 1);
    setAnswered(true);
  };

  const next = () => {
    if (idx + 1 >= total) {
      recordQuiz(route.params.quizId, score + (wasCorrect ? 0 : 0), total);
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setAnswered(false);
    setWasCorrect(false);
    setPickedIdx(null);
  };

  // Формирует разъяснение для неправильного ответа в зависимости от типа вопроса
  function buildExplanation() {
    if (current.explanation) {
      // Если у вопроса есть авторское пояснение — используем его
      return current.explanation;
    }
    if ((current.type === 'choice' || current.type === 'fill' || current.type === 'audio') &&
        current.options && typeof current.answer === 'number') {
      return null; // Для выбора правильный ответ показывается отдельно ниже
    }
    if (current.type === 'sequence') {
      const right = current.answer.map((i, k) => `${k + 1}. ${current.items[i]}`).join('\n');
      return 'Правильный порядок:\n' + right;
    }
    if (current.type === 'match') {
      return 'Правильные пары:\n' + current.pairs.map((p) => `• ${p.left} — ${p.right}`).join('\n');
    }
    return null;
  }

  if (finished) {
    const pct = Math.round((score / total) * 100);
    const restart = () => {
      setIdx(0); setScore(0); setAnswered(false);
      setWasCorrect(false); setFinished(false);
    };
    const newAttempt = () => {
      // Перемонтируем ExamScreen с новым attemptKey → новая выборка из пула
      navigation.replace('Exam', { examId: route.params.examId, attemptKey: Date.now() });
    };
    const hasPool = !!route.params.examHasPool;
    return (
      <Screen padded>
        <View style={styles.complete}>
          <Text style={styles.emoji}>{pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}</Text>
          <Text style={styles.title}>Тест завершён</Text>
          <Text style={styles.bigScore}>{score} / {total}</Text>
          <Text style={styles.subtitle}>{pct}% правильных</Text>
          <View style={{ marginTop: spacing.xl, alignSelf: 'stretch' }}>
            {hasPool && (
              <Button title="🎲 Новая попытка с другими вопросами" onPress={newAttempt} size="lg" />
            )}
            <Button
              title="Пройти те же вопросы"
              variant="outline"
              onPress={restart}
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
            <Button title="Готово" variant="ghost" onPress={() => navigation.goBack()} size="lg" style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Прервать</Text>
        </TouchableOpacity>
        <Text style={styles.headerCount}>{idx + 1} / {total}</Text>
      </View>
      <ProgressBar value={idx + 1} max={total} />

      <ScrollView style={{ marginTop: spacing.lg }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Text style={styles.question}>{current.q}</Text>

        {current.type === 'choice' || current.type === 'fill' || current.type === 'audio' ? (
          <ChoiceList
            key={`choice-${idx}`}
            options={current.options}
            answerIdx={current.answer}
            answered={answered}
            onAnswer={onAnswer}
            audio={current.type === 'audio'}
          />
        ) : null}

        {current.type === 'match' ? (
          <Matching key={`match-${idx}`} pairs={current.pairs} answered={answered} onAnswer={onAnswer} />
        ) : null}

        {current.type === 'sequence' ? (
          <Sequence key={`seq-${idx}`} items={current.items} answer={current.answer} answered={answered} onAnswer={onAnswer} />
        ) : null}
      </ScrollView>

      {answered && (
        <View style={styles.feedback}>
          <Text style={[styles.feedbackText, { color: wasCorrect ? colors.success : colors.danger }]}>
            {wasCorrect ? '✓ Верно!' : '✗ Не совсем'}
          </Text>

          {/* Подробное разъяснение при неправильном ответе */}
          {!wasCorrect && (
            <View style={styles.explainBox}>
              {/* Что выбрал пользователь */}
              {pickedIdx !== null && current.options && (
                <Text style={styles.explainLine}>
                  <Text style={styles.explainLabel}>Вы выбрали: </Text>
                  <Text style={styles.explainWrong}>{current.options[pickedIdx]}</Text>
                </Text>
              )}
              {/* Правильный вариант */}
              {current.options && typeof current.answer === 'number' && (
                <Text style={styles.explainLine}>
                  <Text style={styles.explainLabel}>Правильный ответ: </Text>
                  <Text style={styles.explainRight}>{current.options[current.answer]}</Text>
                </Text>
              )}
              {/* Авторское или авто-сгенерированное пояснение */}
              {(() => {
                const exp = buildExplanation();
                return exp ? (
                  <Text style={styles.explainBody}>
                    <Text style={styles.explainLabel}>Почему: </Text>
                    {exp}
                  </Text>
                ) : null;
              })()}
            </View>
          )}

          <Button title={idx + 1 >= total ? 'Завершить' : 'Дальше'} onPress={next} />
        </View>
      )}
    </Screen>
  );
}

function ChoiceList({ options, answerIdx, answered, onAnswer, audio }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [selected, setSelected] = useState(null);

  const pick = (i) => {
    if (answered) return;
    setSelected(i);
    onAnswer(i === answerIdx, i);
  };

  return (
    <View style={{ marginTop: spacing.lg }}>
      {audio && (
        <View style={styles.audioBanner}>
          <Text style={styles.audioIcon}>🔊</Text>
          <Text style={styles.audioText}>Произнесите слово или представьте его звучание</Text>
        </View>
      )}
      {options.map((opt, i) => {
        const isSelected = selected === i;
        const isCorrect = answered && i === answerIdx;
        const isWrong = answered && isSelected && i !== answerIdx;
        return (
          <TouchableOpacity
            key={i}
            activeOpacity={0.85}
            disabled={answered}
            onPress={() => pick(i)}
            style={[
              styles.optionBtn,
              isCorrect && styles.optionCorrect,
              isWrong && styles.optionWrong,
              isSelected && !answered && styles.optionSelected,
            ]}
          >
            <Text style={[styles.optionText, (isCorrect || isWrong) && { color: '#fff' }]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Matching({ pairs, answered, onAnswer }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // Простая реализация — пользователь выбирает левый, потом правый.
  const [leftSel, setLeftSel] = useState(null);
  const [matched, setMatched] = useState({}); // { leftIdx: rightIdx }
  const [wrong, setWrong] = useState(0);

  const allMatched = Object.keys(matched).length === pairs.length;

  React.useEffect(() => {
    if (allMatched && !answered) {
      onAnswer(wrong === 0);
    }
  }, [allMatched]);

  const pickLeft = (i) => {
    if (matched[i] !== undefined) return;
    setLeftSel(i);
  };

  const pickRight = (j) => {
    if (leftSel === null) return;
    const correctJ = leftSel; // в наших данных пары совпадают по индексу
    if (j === correctJ) {
      setMatched({ ...matched, [leftSel]: j });
    } else {
      setWrong((w) => w + 1);
    }
    setLeftSel(null);
  };

  // Перемешиваем правые элементы для отображения
  const rightItems = useMemo(
    () => pairs.map((p, i) => ({ idx: i, label: p.right })).sort(() => Math.random() - 0.5),
    [pairs]
  );

  return (
    <View style={{ marginTop: spacing.lg, flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ flex: 1, marginRight: spacing.sm }}>
        {pairs.map((p, i) => {
          const used = matched[i] !== undefined;
          const sel = leftSel === i;
          return (
            <TouchableOpacity
              key={`L${i}`}
              disabled={used}
              activeOpacity={0.85}
              onPress={() => pickLeft(i)}
              style={[styles.matchBox, used && styles.matchUsed, sel && styles.matchSelected]}
            >
              <Text style={styles.matchText}>{p.left}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        {rightItems.map((r) => {
          const used = Object.values(matched).includes(r.idx);
          return (
            <TouchableOpacity
              key={`R${r.idx}`}
              disabled={used}
              activeOpacity={0.85}
              onPress={() => pickRight(r.idx)}
              style={[styles.matchBox, used && styles.matchUsed]}
            >
              <Text style={styles.matchText}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function Sequence({ items, answer, answered, onAnswer }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [shuffled] = useState(() => items.map((_, i) => i).sort(() => Math.random() - 0.5));
  const [picked, setPicked] = useState([]);

  React.useEffect(() => {
    if (picked.length === items.length && !answered) {
      const correct = picked.every((p, i) => p === answer[i]);
      onAnswer(correct);
    }
  }, [picked]);

  const pick = (idx) => {
    if (picked.includes(idx)) return;
    setPicked((arr) => [...arr, idx]);
  };

  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.seqHint}>Ваш порядок:</Text>
      <View style={styles.seqResult}>
        {picked.length === 0 ? (
          <Text style={styles.seqEmpty}>Нажмите на элементы в правильном порядке</Text>
        ) : (
          picked.map((p, i) => (
            <View key={i} style={styles.seqResItem}>
              <Text style={styles.seqResNum}>{i + 1}.</Text>
              <Text style={styles.seqResText}>{items[p]}</Text>
            </View>
          ))
        )}
      </View>
      <View style={{ marginTop: spacing.md }}>
        {shuffled.map((idx) => {
          const used = picked.includes(idx);
          return (
            <TouchableOpacity
              key={idx}
              disabled={used}
              activeOpacity={0.85}
              onPress={() => pick(idx)}
              style={[styles.seqBtn, used && styles.seqUsed]}
            >
              <Text style={[styles.seqBtnText, used && { color: colors.textMuted }]}>
                {items[idx]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  back: { ...typography.bodyMedium, color: colors.primary },
  headerCount: { ...typography.bodyMedium, color: colors.textSecondary, fontWeight: '700' },

  question: { ...typography.h3, color: colors.textPrimary },

  optionBtn: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  optionCorrect: { borderColor: colors.success, backgroundColor: colors.success },
  optionWrong: { borderColor: colors.danger, backgroundColor: colors.danger },
  optionText: { ...typography.body, color: colors.textPrimary },

  audioBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  audioIcon: { fontSize: 22, marginRight: spacing.sm },
  audioText: { ...typography.small, color: colors.accentDark, flex: 1 },

  matchBox: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 50,
    justifyContent: 'center',
  },
  matchSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  matchUsed: { backgroundColor: colors.success + '20', borderColor: colors.success },
  matchText: { ...typography.body, color: colors.textPrimary, textAlign: 'center' },

  seqHint: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.sm },
  seqResult: { backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: radii.md, minHeight: 80 },
  seqEmpty: { ...typography.small, color: colors.textMuted, fontStyle: 'italic' },
  seqResItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  seqResNum: { ...typography.bodyMedium, color: colors.primary, marginRight: spacing.sm, fontWeight: '700' },
  seqResText: { ...typography.body, color: colors.textPrimary },
  seqBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm },
  seqUsed: { backgroundColor: colors.surfaceAlt, borderColor: colors.divider },
  seqBtnText: { ...typography.body, color: colors.textPrimary, textAlign: 'center' },

  feedback: { paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
  feedbackText: { ...typography.h4, marginBottom: spacing.sm, textAlign: 'center' },

  // Подробное пояснение при неправильном ответе
  explainBox: {
    backgroundColor: colors.danger + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: spacing.md,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  explainLine: { ...typography.body, color: colors.textPrimary, marginBottom: 6, lineHeight: 22 },
  explainLabel: { fontWeight: '700', color: colors.textPrimary },
  explainWrong: { color: colors.danger, fontWeight: '600' },
  explainRight: { color: colors.success, fontWeight: '700' },
  explainBody: { ...typography.small, color: colors.textPrimary, marginTop: spacing.sm, lineHeight: 20 },

  complete: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 80, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary },
  bigScore: { fontSize: 56, fontWeight: '700', color: colors.primary, marginTop: spacing.md },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
});
