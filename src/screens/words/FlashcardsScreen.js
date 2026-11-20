// Карточки слов — режим викторины с 4 вариантами перевода.
// Логика:
//   - Слова выбираются РАНДОМНО из всей базы + те, что на повторение
//   - Сверху показываем арабское слово + транскрипцию + кнопку 🔊
//   - 4 кнопки с вариантами перевода (1 правильный + 3 контекстно похожих)
//   - Дистракторы подбираются ПО КАТЕГОРИИ (местоимения с местоимениями и т.п.),
//     чтобы вариант был осмысленным, а не «он / дерево / земля»
//   - Тап по варианту:
//       * правильный → подсвечивается зелёным, авто-переход к следующему через 0.8 сек
//       * неправильный → красным, правильный подсвечивается зелёным, кнопка «Дальше»
//   - В конце колоды — итоговый экран с правильными / неправильными
//   - Кнопка выбора арабского голоса TTS

import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { spacing, radii, typography } from '../../constants/theme';
import { words } from '../../data/words';
import { useProgress } from '../../store/progressStore';
import {
  speak, stop,
  getArabicVoices, getSelectedVoiceId, setVoice, loadSettings,
} from '../../services/ttsService';
import { useTheme } from '../../store/themeStore';
import IconText from '../../components/IconText';
import CategoryIcon from '../../components/CategoryIcon';

const SESSION_SIZE = 10;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Подбирает 4 варианта перевода:
//   - 1 правильный
//   - 3 дистрактора из ТОЙ ЖЕ категории (контекстно похожие)
//   - Если в категории < 3 других слов — добивает из любых
function buildOptions(currentWord) {
  const sameCategory = words.filter(
    (w) => w.category === currentWord.category && w.id !== currentWord.id && w.ru !== currentWord.ru,
  );
  let pool = shuffle(sameCategory).slice(0, 3);
  if (pool.length < 3) {
    const others = words.filter(
      (w) => w.id !== currentWord.id && w.ru !== currentWord.ru && !pool.some((p) => p.id === w.id),
    );
    pool = [...pool, ...shuffle(others).slice(0, 3 - pool.length)];
  }
  const options = shuffle([currentWord.ru, ...pool.map((w) => w.ru)]);
  return {
    options,
    correctIdx: options.indexOf(currentWord.ru),
  };
}

// Собирает колоду: сначала слова на повторение, потом РАНДОМНЫЕ из всей базы
function buildDeck(dueIds, learnedMap) {
  const dueWords = dueIds.map((id) => words.find((w) => w.id === id)).filter(Boolean);
  // Берём случайные новые слова (которых ещё нет в learnedMap)
  const newWords = shuffle(words.filter((w) => !learnedMap[w.id]));
  // Если новых нет — добираем любыми случайными
  const filler = newWords.length > 0 ? newWords : shuffle(words);
  const combined = [...dueWords, ...filler].slice(0, SESSION_SIZE);
  return combined.length ? combined : shuffle(words).slice(0, SESSION_SIZE);
}

export default function FlashcardsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, markWordLearned, wordsDueForReview } = useProgress();

  // Колода пересобирается при «Ещё одна сессия» через сброс ключа
  const [sessionKey, setSessionKey] = useState(0);
  const deck = useMemo(() => {
    return buildDeck(wordsDueForReview(), state.learnedWords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  const [idx, setIdx] = useState(0);
  const [stats, setStats] = useState({ known: 0, unknown: 0 });
  const [selected, setSelected] = useState(null); // выбранный индекс варианта
  const [answered, setAnswered] = useState(false);

  // Выбор голоса
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      await loadSettings();
      const vs = await getArabicVoices();
      setVoices(vs);
      setSelectedVoice(getSelectedVoiceId());
    })();
    return () => { stop(); };
  }, []);

  const chooseVoice = async (id) => {
    await setVoice(id);
    setSelectedVoice(id);
    setVoiceModalOpen(false);
  };

  const currentVoiceName =
    voices.find((v) => v.identifier === selectedVoice)?.name || 'По умолчанию';

  const current = deck[idx];
  const isLast = idx >= deck.length;

  // Перестраиваем варианты при смене карточки
  const quiz = useMemo(() => (current ? buildOptions(current) : null), [current]);

  if (isLast) {
    const total = stats.known + stats.unknown;
    const pct = total > 0 ? Math.round((stats.known / total) * 100) : 0;
    const restart = () => {
      setSessionKey((k) => k + 1);
      setIdx(0); setStats({ known: 0, unknown: 0 });
      setSelected(null); setAnswered(false);
    };
    return (
      <Screen padded>
        <View style={styles.complete}>
          <CategoryIcon icon={pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'} textStyle={styles.emoji} />
          <Text style={styles.title}>Сессия завершена</Text>
          <Text style={styles.bigScore}>{stats.known} / {total}</Text>
          <Text style={styles.subtitle}>{pct}% правильных</Text>
          <View style={{ marginTop: spacing.xl, width: '100%' }}>
            <Button title="Ещё одна сессия" onPress={restart} size="lg" />
            <Button title="Готово" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Screen>
    );
  }

  const onPick = (i) => {
    if (answered) return;
    const correct = i === quiz.correctIdx;
    setSelected(i);
    setAnswered(true);
    markWordLearned(current.id, correct);
    setStats((s) => ({ ...s, [correct ? 'known' : 'unknown']: s[correct ? 'known' : 'unknown'] + 1 }));
    if (correct) {
      // Авто-переход при правильном ответе
      setTimeout(() => goNext(), 800);
    }
    // При неправильном — ждём, пока пользователь нажмёт «Дальше»
  };

  const goNext = () => {
    stop();
    setIdx((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  };

  const optionStyle = (i) => {
    if (!answered) return styles.optionBase;
    if (i === quiz.correctIdx) return [styles.optionBase, styles.optionCorrect];
    if (i === selected)         return [styles.optionBase, styles.optionWrong];
    return [styles.optionBase, styles.optionDim];
  };

  const optionTextStyle = (i) => {
    if (!answered) return styles.optionText;
    if (i === quiz.correctIdx) return [styles.optionText, styles.optionTextCorrect];
    if (i === selected)         return [styles.optionText, styles.optionTextWrong];
    return [styles.optionText, { color: colors.textMuted }];
  };

  return (
    <Screen padded>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>{idx + 1} / {deck.length}</Text>
      </View>

      <ProgressBar value={idx + 1} max={deck.length} />

      {/* Кнопка выбора голоса */}
      {voices.length > 0 && (
        <TouchableOpacity
          onPress={() => setVoiceModalOpen(true)}
          style={styles.voiceBtn}
        >
          <IconText icon="volume" style={styles.voiceBtnText} numberOfLines={1}>Голос: {currentVoiceName}</IconText>
          <Text style={styles.voiceBtnChev}>›</Text>
        </TouchableOpacity>
      )}

      {/* Карточка с арабским словом */}
      <View style={styles.card}>
        <Text style={styles.tag}>Что означает это слово?</Text>
        <Text style={styles.cardArabic}>{current.ar}</Text>
        {current.tr ? <Text style={styles.cardTranslit}>{current.tr}</Text> : null}
        <TouchableOpacity
          onPress={() => speak(current.ar, { rate: 0.5 })}
          style={styles.speakBtn}
        >
          <IconText icon="volume" style={styles.speakText}>Озвучить</IconText>
        </TouchableOpacity>
      </View>

      {/* 4 варианта */}
      <View style={styles.options}>
        {quiz.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onPick(i)}
            activeOpacity={0.85}
            style={optionStyle(i)}
          >
            <View style={styles.optionLetter}>
              <Text style={styles.optionLetterText}>{String.fromCharCode(65 + i)}</Text>
            </View>
            <Text style={optionTextStyle(i)} numberOfLines={2}>{opt}</Text>
            {answered && i === quiz.correctIdx && <Text style={styles.optionIcon}>✓</Text>}
            {answered && i === selected && i !== quiz.correctIdx && <Text style={styles.optionIcon}>✕</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Кнопка «Дальше» — только при неправильном ответе или последнем слове */}
      {answered && selected !== quiz.correctIdx && (
        <Button title={idx + 1 >= deck.length ? 'Завершить' : 'Дальше →'} onPress={goNext} size="lg" />
      )}

      {/* Модалка выбора голоса */}
      <Modal visible={voiceModalOpen} animationType="slide" transparent onRequestClose={() => setVoiceModalOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Выбор голоса</Text>
            <Text style={styles.modalSub}>{voices.length} арабских голосов доступно</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <TouchableOpacity
                onPress={() => chooseVoice(null)}
                style={[styles.voiceItem, !selectedVoice && styles.voiceItemActive]}
              >
                <Text style={styles.voiceItemName}>По умолчанию (системный)</Text>
                {!selectedVoice && <Text style={styles.voiceCheck}>✓</Text>}
              </TouchableOpacity>
              {voices.map((v, i) => {
                const active = selectedVoice === v.identifier;
                return (
                  <TouchableOpacity
                    key={v.identifier || i}
                    onPress={() => chooseVoice(v.identifier)}
                    style={[styles.voiceItem, active && styles.voiceItemActive]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.voiceItemName}>{v.name}</Text>
                      <Text style={styles.voiceItemMeta}>
                        {v.language} {v.quality ? `· ${v.quality}` : ''}
                      </Text>
                    </View>
                    {active && <Text style={styles.voiceCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Button title="Закрыть" variant="ghost" onPress={() => setVoiceModalOpen(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  back: { ...typography.bodyMedium, color: colors.primary },
  progress: { ...typography.bodyMedium, color: colors.textSecondary, fontWeight: '700' },

  voiceBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary + '12',
    borderWidth: 1, borderColor: colors.primary + '30',
  },
  voiceBtnText: { ...typography.small, color: colors.primary, fontWeight: '600', flex: 1 },
  voiceBtnChev: { fontSize: 18, color: colors.primary, marginLeft: 6 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginTop: spacing.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tag: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  cardArabic: { fontSize: 56, color: colors.textPrimary, textAlign: 'center', lineHeight: 80 },
  cardTranslit: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  speakBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
    backgroundColor: colors.primary + '15',
    borderRadius: radii.pill,
  },
  speakText: { color: colors.primary, fontWeight: '700' },

  options: { marginTop: spacing.lg },
  optionBase: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2, borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  optionCorrect: { borderColor: colors.success, backgroundColor: colors.success + '15' },
  optionWrong:   { borderColor: colors.danger,  backgroundColor: colors.danger + '15' },
  optionDim:     { opacity: 0.5 },
  optionLetter: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionLetterText: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700' },
  optionText: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
  optionTextCorrect: { color: colors.success, fontWeight: '700' },
  optionTextWrong:   { color: colors.danger,  fontWeight: '700' },
  optionIcon: { fontSize: 20, fontWeight: '900', marginLeft: spacing.sm },

  complete: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  emoji: { fontSize: 64, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center' },
  bigScore: { fontSize: 48, fontWeight: '900', color: colors.primary, marginTop: spacing.md },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },

  // Модалка
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl,
    padding: spacing.lg, paddingBottom: spacing.xl,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary },
  modalSub: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.md },
  voiceItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  voiceItemActive: { backgroundColor: colors.primary + '12' },
  voiceItemName: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '600' },
  voiceItemMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  voiceCheck: { fontSize: 20, color: colors.primary, fontWeight: '700' },
});
