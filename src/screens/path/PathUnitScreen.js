// Шаг «Пути арабского»: материал → мини-тест → шаг пройден.
//  - letters / harakat / words: карточки материала + тест из 4 вариантов
//  - grammar: ссылка на полный урок грамматики, отметка вручную
//  - sura: ссылка на суру (чтение + аудио), отметка вручную
// Прохождение записывается в progressStore (XP, стрик, разблокировка следующего).

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import PathQuiz from '../../components/PathQuiz';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { useProgress } from '../../store/progressStore';
import {
  findUnit,
  buildUnitQuiz,
  getLettersOfUnit,
  getWordsOfUnit,
  getHarakatOfUnit,
  getSyllableSamples,
} from '../../data/arabicPath';
import WordBreakdown from '../../components/WordBreakdown';
import { speak, stop, hasArabicVoice, notifyNoArabicVoice } from '../../services/ttsService';
import * as haptics from '../../utils/haptics';
import IconText from '../../components/IconText';

const PASS_RATIO = 0.7; // порог прохождения теста

export default function PathUnitScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, completePathUnit, markWordLearned } = useProgress();
  const found = findUnit(route.params.unitId);

  // phase: learn → quiz (сам квиз и экран результата — в компоненте PathQuiz)
  const [phase, setPhase] = useState('learn');
  const [quiz, setQuiz] = useState([]);
  // Новый key на каждый старт — PathQuiz монтируется заново со сброшенным счётом
  const [quizKey, setQuizKey] = useState(0);
  const [expandedWord, setExpandedWord] = useState(null); // слово с раскрытым разбором по буквам

  if (!found) return null;
  const { stage, unit } = found;
  const alreadyDone = !!state.completedPathUnits?.[unit.id];
  const hasQuiz = ['letters', 'harakat', 'words', 'syllables', 'review'].includes(unit.type);

  const startQuiz = () => {
    stop();
    setQuiz(buildUnitQuiz(unit)); // каждый раз новый набор вопросов
    setQuizKey((k) => k + 1);
    setPhase('quiz');
  };

  // Итог теста: при успехе фиксируем прогресс шага
  const handleQuizComplete = (finalScore, total, passed) => {
    if (!passed) return;
    completePathUnit(unit.id, total > 0 ? finalScore / total : 1);
    // Слова пройденного батча уходят в интервальное повторение (SRS):
    // завтра появятся в «Карточках» и в счётчике «на повторение».
    if (unit.type === 'words' && !alreadyDone) {
      for (const w of getWordsOfUnit(unit)) markWordLearned(w.id, true);
    }
  };

  const sayArabic = async (text) => {
    if (!text) return;
    // Без арабского голоса объясняем, как его включить, вместо тишины
    if (!(await hasArabicVoice())) {
      notifyNoArabicVoice();
      return;
    }
    speak(text, { rate: 0.5 }).catch(() => {});
  };

  // ===== Рендер материала по типу шага =====
  const renderLearn = () => {
    if (unit.type === 'letters') {
      return getLettersOfUnit(unit).map((l) => (
        <Card key={l.id} style={{ marginBottom: spacing.md }}>
          <View style={styles.letterRow}>
            {/* Произносим НАЗВАНИЕ буквы (باء) — одиночный символ TTS читает нестабильно */}
            <TouchableOpacity onPress={() => sayArabic(l.nameAr || l.letter)} style={styles.bigLetterBox}>
              <Text style={styles.bigLetter}>{l.letter}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.letterName}>{l.name} · {l.tr}</Text>
              <Text style={styles.letterSound}>{l.sound}</Text>
            </View>
          </View>
          {/* Формы буквы */}
          <View style={styles.formsRow}>
            {[['в конце', l.forms.final], ['в середине', l.forms.medial], ['в начале', l.forms.initial], ['отдельно', l.forms.isolated]].map(([label, form]) => (
              <View key={label} style={styles.formBox}>
                <Text style={styles.formAr}>{form}</Text>
                <Text style={styles.formLabel}>{label}</Text>
              </View>
            ))}
          </View>
          {!!l.example && (
            <TouchableOpacity onPress={() => sayArabic(l.example.ar)} style={styles.exampleRow}>
              <Icon name="play" size={12} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.exampleAr}>{l.example.ar}</Text>
              <Text style={styles.exampleRu}> — {l.example.ru}</Text>
            </TouchableOpacity>
          )}
          {l.tip ? <IconText icon="bulb" style={styles.tip}>{l.tip}</IconText> : null}
        </Card>
      ));
    }

    if (unit.type === 'harakat') {
      return getHarakatOfUnit(unit).map((h) => (
        <Card key={h.id} style={{ marginBottom: spacing.md }}>
          <View style={styles.letterRow}>
            <TouchableOpacity onPress={() => sayArabic(h.onLetter)} style={styles.bigLetterBox}>
              <Text style={styles.bigLetter}>{h.onLetter}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.letterName}>{h.name} · {h.tr}</Text>
              <Text style={styles.letterSound}>{h.desc}</Text>
            </View>
          </View>
          {!!h.example && (
            <TouchableOpacity onPress={() => sayArabic(h.example.ar)} style={styles.exampleRow}>
              <Icon name="play" size={12} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.exampleAr}>{h.example.ar}</Text>
              <Text style={styles.exampleRu}> — {h.example.ru}</Text>
            </TouchableOpacity>
          )}
        </Card>
      ));
    }

    if (unit.type === 'words') {
      return (
        <>
          <Text style={styles.wordsHint}>
            Нажмите на слово — откроется разбор по буквам (какая буква, в какой форме,
            какой звук — как разбор слова по составу). Иконка ▶ озвучивает слово.
          </Text>
          {getWordsOfUnit(unit).map((w) => {
            const expanded = expandedWord === w.id;
            return (
              <Card key={w.id} style={{ marginBottom: spacing.sm }}>
                <TouchableOpacity
                  onPress={() => setExpandedWord(expanded ? null : w.id)}
                  style={styles.wordRow}
                  activeOpacity={0.7}
                >
                  <TouchableOpacity
                    onPress={() => sayArabic(w.ar)}
                    style={styles.wordSpeak}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Озвучить слово"
                  >
                    <Icon name="play" size={13} color={colors.primary} />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wordAr}>{w.ar}</Text>
                    <Text style={styles.wordTr}>{w.tr}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.wordRu}>{w.ru}</Text>
                    {w.freq ? <Text style={styles.wordFreq}>в Коране ×{w.freq}</Text> : null}
                  </View>
                </TouchableOpacity>
                {/* Разбор по буквам — как разбор слова по составу */}
                {expanded && (
                  <View style={styles.breakdownBox}>
                    <WordBreakdown word={w.ar} transcription={w.tr} />
                  </View>
                )}
              </Card>
            );
          })}
        </>
      );
    }

    if (unit.type === 'syllables') {
      return (
        <>
          <Text style={styles.wordsHint}>
            Слог = буква + огласовка. Нажмите на слог, чтобы услышать его.
            Потом проверьте себя — это мост от букв к чтению слов.
          </Text>
          {getSyllableSamples().map((row) => (
            <Card key={row.letterName} style={{ marginBottom: spacing.sm }}>
              <Text style={styles.syllLetterName}>{row.letterName}</Text>
              <View style={styles.syllRow}>
                {row.syllables.map((s) => (
                  <TouchableOpacity
                    key={s.ru}
                    onPress={() => sayArabic(s.ar)}
                    style={styles.syllBox}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.syllAr}>{s.ar}</Text>
                    <Text style={styles.syllRu}>{s.ru}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          ))}
        </>
      );
    }

    if (unit.type === 'review') {
      return (
        <Card>
          <Text style={styles.refText}>
            Большое повторение: 10 случайных слов из всех изученных 50.
            Каждый раз выпадает новый набор — можно проходить многократно.
            {'\n\n'}Слова, которые вы уже выучили, также появляются в «Карточках»
            по графику интервального повторения (1 → 3 → 7 → 30 дней).
          </Text>
        </Card>
      );
    }

    if (unit.type === 'grammar') {
      return (
        <Card>
          <Text style={styles.refText}>
            Этот шаг — полноценный урок грамматики. Откройте его, изучите фразы и разборы,
            затем вернитесь и отметьте шаг пройденным.
          </Text>
          <Button
            title="Открыть урок грамматики"
            onPress={() => navigation.navigate('GrammarLesson', { id: unit.lessonId })}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      );
    }

    if (unit.type === 'sura') {
      return (
        <Card>
          <Text style={styles.refText}>
            Откройте суру: слушайте чтение аят за аятом и следите глазами за арабским текстом.
            Уже знакомые буквы и слова начнут «проявляться». Затем отметьте шаг пройденным.
          </Text>
          <Button
            title="Открыть суру"
            onPress={() => navigation.navigate('Surah', { surahId: unit.surahId })}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      );
    }
    return null;
  };

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => { stop(); navigation.goBack(); }} backLabel="← Путь" background={stage.color}>
        
        <Text style={styles.title}>{unit.title}</Text>
        <Text style={styles.subtitle}>{stage.title}{alreadyDone ? ' · пройдено ✓' : ''}</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {phase === 'learn' && (
          <>
            {renderLearn()}
            <View style={{ marginTop: spacing.md }}>
              {hasQuiz ? (
                <Button title={alreadyDone ? 'Пройти проверку ещё раз' : 'Пройти проверку'} onPress={startQuiz} />
              ) : (
                <Button
                  title={alreadyDone ? 'Уже пройдено ✓' : 'Отметить пройденным'}
                  onPress={() => { if (!alreadyDone) { completePathUnit(unit.id, 1); haptics.success(); } navigation.goBack(); }}
                />
              )}
            </View>
          </>
        )}

        {phase === 'quiz' && (
          <PathQuiz
            key={quizKey}
            questions={quiz}
            color={stage.color}
            passRatio={PASS_RATIO}
            onComplete={handleQuizComplete}
            onRetry={() => setPhase('learn')}
            onContinue={() => navigation.goBack()}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h2, color: '#fff', marginTop: spacing.sm },
  subtitle: { ...typography.small, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  letterRow: { flexDirection: 'row', alignItems: 'center' },
  bigLetterBox: {
    width: 84, height: 84, borderRadius: radii.lg,
    backgroundColor: colors.primary + '10',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  bigLetter: { fontSize: 48, color: colors.textPrimary, lineHeight: 80 },
  letterName: { ...typography.h4, color: colors.textPrimary },
  letterSound: { ...typography.small, color: colors.textSecondary, marginTop: 2, lineHeight: 19 },

  formsRow: { flexDirection: 'row', marginTop: spacing.md, gap: 6 },
  formBox: {
    flex: 1, alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm, paddingVertical: spacing.sm,
  },
  formAr: { fontSize: 28, color: colors.textPrimary, lineHeight: 48 },
  formLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  exampleRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  exampleAr: { fontSize: 26, color: colors.primary, lineHeight: 46 },
  exampleRu: { ...typography.small, color: colors.textSecondary },
  tip: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 17 },

  wordsHint: {
    ...typography.small, color: colors.textSecondary,
    lineHeight: 20, marginBottom: spacing.md,
  },
  wordRow: { flexDirection: 'row', alignItems: 'center' },
  wordSpeak: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  wordAr: { fontSize: 34, color: colors.textPrimary, lineHeight: 60 },
  wordTr: { ...typography.small, color: colors.textMuted, fontStyle: 'italic' },
  wordRu: { ...typography.bodyMedium, color: colors.textPrimary, textAlign: 'right' },
  wordFreq: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  breakdownBox: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  // Тренажёр слогов
  syllLetterName: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  syllRow: { flexDirection: 'row', gap: spacing.sm },
  syllBox: {
    flex: 1, alignItems: 'center',
    backgroundColor: colors.primary + '0A',
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  syllAr: { fontSize: 34, color: colors.textPrimary, lineHeight: 62 },
  syllRu: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700' },

  refText: { ...typography.body, color: colors.textPrimary, lineHeight: 23 },
});
