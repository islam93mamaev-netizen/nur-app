// Экран обучающего урока намаза в стиле azan.kz —
//   - Иллюстрация позы: <Image> если есть step.image, иначе SVG-fallback
//   - 3 кнопки-таба: Транскрипция / Перевод / Арабский
//   - Аудиоплеер: expo-audio (createAudioPlayer) если есть step.audio (mp3),
//     иначе TTS pause/resume
//   - Кнопка «Следующее действие» внизу + прогресс-индикатор

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import Icon from '../../components/Icon';
import { spacing, radii, typography } from '../../constants/theme';
import { findPrayerLesson } from '../../data/prayerLesson';
import { getPrayerImage, getPrayerAudio } from '../../data/prayerAssets';
import { speak, stop as ttsStop } from '../../services/ttsService';
import { useTheme } from '../../store/themeStore';

function splitArabic(text) {
  if (!text) return [];
  const parts = text
    .split(/(?<=[ۚۖۗۘۙۛۜ،.!?۝])\s*|(\n+)/)
    .map((s) => (s || '').trim())
    .filter((s) => s.length > 0);
  return parts.length ? parts : [text];
}

const TABS = [
  { id: 'tr', label: 'Транскрипция' },
  { id: 'ru', label: 'Перевод' },
  { id: 'ar', label: 'Арабский' },
];

let audioModeSet = false;
async function ensureAudioMode() {
  if (audioModeSet) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
      interruptionModeAndroid: 'duckOthers',
    });
    audioModeSet = true;
  } catch { /* ignore */ }
}

export default function PrayerLessonScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const lesson = findPrayerLesson(route.params?.lessonId || 'zuhr_4');
  const [stepIdx, setStepIdx] = useState(0);
  const [tab, setTab] = useState('ar');

  // ===== Аудио state =====
  // Для MP3 (expo-av Sound): isPlayingMp3, mp3Position {position, duration}
  // Для TTS-fallback: ttsState {status, chunks, idx}
  const [isPlayingMp3, setIsPlayingMp3] = useState(false);
  const [ttsState, setTtsState] = useState({ status: 'idle', chunks: [], idx: 0 });
  const soundRef = useRef(null);
  const ttsTokenRef = useRef(null);

  // Полная остановка всего аудио — общая функция
  const stopAllAudio = useCallback(async () => {
    ttsTokenRef.current = null;
    await ttsStop();
    if (soundRef.current) {
      try { soundRef.current.pause(); } catch { /* ignore */ }
      try { soundRef.current.remove(); } catch { /* ignore */ }
      soundRef.current = null;
    }
    setIsPlayingMp3(false);
  }, []);

  // Cleanup при unmount всего экрана
  useEffect(() => {
    return () => { stopAllAudio(); };
  }, [stopAllAudio]);

  // При потере фокуса (переход в другой экран / таб) — останавливаем
  useFocusEffect(
    useCallback(() => {
      return () => { stopAllAudio(); };
    }, [stopAllAudio])
  );

  // При смене шага — остановить и сбросить плеер
  useEffect(() => {
    (async () => {
      await stopAllAudio();
      setTtsState({ status: 'idle', chunks: [], idx: 0 });
    })();
  }, [stepIdx, stopAllAudio]);

  if (!lesson) return null;

  const step = lesson.steps[stepIdx];
  const total = lesson.steps.length;
  const hasNext = stepIdx < total - 1;
  const hasPrev = stepIdx > 0;

  const imgSource = getPrayerImage(step.image);
  const audioModule = getPrayerAudio(step.audio);
  const hasAudio = !!audioModule || !!step.ar;
  const isMp3 = !!audioModule;

  // Контент текущего таба
  const tabContent = (() => {
    if (tab === 'ar' && step.ar) return { text: step.ar, isAr: true };
    if (tab === 'tr' && step.tr) return { text: step.tr, isAr: false };
    if (tab === 'ru' && step.ru) return { text: step.ru, isAr: false };
    return { text: '— (на этом шаге нет текста)', isAr: false, dim: true };
  })();

  // === Воспроизведение MP3 (expo-audio API) ===
  const togglePlayMp3 = async () => {
    if (isPlayingMp3 && soundRef.current) {
      try { soundRef.current.pause(); } catch { /* ignore */ }
      setIsPlayingMp3(false);
      return;
    }
    if (soundRef.current) {
      try { soundRef.current.play(); setIsPlayingMp3(true); } catch { /* ignore */ }
      return;
    }
    // Первый запуск — создаём плеер
    await ensureAudioMode();
    try {
      const player = createAudioPlayer(audioModule);
      const sub = player.addListener('playbackStatusUpdate', (status) => {
        if (status?.didJustFinish) {
          setIsPlayingMp3(false);
          try { sub.remove(); } catch { /* ignore */ }
          try { player.remove(); } catch { /* ignore */ }
          if (soundRef.current === player) soundRef.current = null;
        }
      });
      player.play();
      soundRef.current = player;
      setIsPlayingMp3(true);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  const resetMp3 = async () => {
    if (soundRef.current) {
      try {
        soundRef.current.pause();
        soundRef.current.seekTo(0);
      } catch { /* ignore */ }
    }
    setIsPlayingMp3(false);
  };

  // === TTS (fallback, если нет MP3) ===
  const togglePlayTts = async () => {
    if (ttsState.status === 'playing') {
      ttsTokenRef.current = null;
      await ttsStop();
      setTtsState((s) => ({ ...s, status: 'paused' }));
      return;
    }
    const chunks = ttsState.chunks.length ? ttsState.chunks : splitArabic(step.ar);
    const startIdx = ttsState.status === 'paused' ? ttsState.idx : 0;
    const myToken = Date.now() + '_' + stepIdx;
    ttsTokenRef.current = myToken;
    setTtsState({ chunks, idx: startIdx, status: 'playing' });

    await ttsStop();
    for (let i = startIdx; i < chunks.length; i++) {
      if (ttsTokenRef.current !== myToken) return;
      setTtsState({ chunks, idx: i, status: 'playing' });
      await speak(chunks[i], { rate: 0.5 });
      if (ttsTokenRef.current !== myToken) return;
    }
    if (ttsTokenRef.current === myToken) {
      ttsTokenRef.current = null;
      setTtsState({ chunks, idx: 0, status: 'idle' });
    }
  };

  const resetTts = async () => {
    ttsTokenRef.current = null;
    await ttsStop();
    setTtsState({ chunks: splitArabic(step.ar), idx: 0, status: 'idle' });
  };

  // Унифицированные обработчики
  const onTogglePlay = () => (isMp3 ? togglePlayMp3() : togglePlayTts());
  const onReset = () => (isMp3 ? resetMp3() : resetTts());

  const isPlaying = isMp3 ? isPlayingMp3 : ttsState.status === 'playing';
  const isPaused  = isMp3 ? (soundRef.current && !isPlayingMp3) : ttsState.status === 'paused';
  const showTtsProgress = !isMp3 && (isPlaying || isPaused) && ttsState.chunks.length > 1;

  const goNext = () => hasNext && setStepIdx((i) => i + 1);
  const goPrev = () => hasPrev && setStepIdx((i) => i - 1);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { ttsStop(); navigation.goBack(); }}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.stepCount}>Шаг {stepIdx + 1} / {total}</Text>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <ProgressBar value={stepIdx + 1} max={total} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Text style={styles.stepTitle}>{step.title}</Text>

        {/* Иллюстрация */}
        <View style={styles.illustrationBox}>
          {imgSource ? (
            <Image source={imgSource} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🕌</Text>
            </View>
          )}
        </View>

        {/* Описание действия */}
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '10' }}>
          <Text style={[styles.label, { color: colors.accentDark }]}>Что делать</Text>
          <Text style={styles.actionText}>{step.action}</Text>
        </Card>

        {/* Табы и контент */}
        {(step.ar || step.tr || step.ru) && (
          <>
            <View style={styles.tabsRow}>
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setTab(t.id)}
                    style={[styles.tab, active && styles.tabActive]}
                  >
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Card style={styles.contentCard}>
              <Text
                style={[
                  styles.contentText,
                  tabContent.isAr && styles.contentAr,
                  tabContent.dim && { color: colors.textMuted, fontStyle: 'italic' },
                ]}
              >
                {tabContent.text}
              </Text>
            </Card>

            {/* Аудиоплеер */}
            {hasAudio && (
              <Card style={styles.playerCard}>
                <TouchableOpacity
                  onPress={onTogglePlay}
                  style={[styles.bigPlayBtn, { backgroundColor: colors.primary }]}
                >
                  <Icon name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.playerLabel}>
                    {isPlaying ? 'Воспроизводится' : isPaused ? 'На паузе' : 'Прослушать'}
                  </Text>
                  <Text style={styles.playerSub}>
                    {isMp3 ? '🎵 Аудиозапись' : '🔊 Озвучка (TTS)'}
                    {showTtsProgress && ` · фрагмент ${ttsState.idx + 1}/${ttsState.chunks.length}`}
                  </Text>
                </View>
                {(isPlaying || isPaused) && (
                  <TouchableOpacity
                    onPress={onReset}
                    style={[styles.resetBtn, { borderColor: colors.primary }]}
                  >
                    <Text style={[styles.resetIcon, { color: colors.primary }]}>⟲</Text>
                  </TouchableOpacity>
                )}
              </Card>
            )}
          </>
        )}

        {/* Кнопки навигации */}
        <View style={styles.navRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Button
              title="← Предыдущее"
              variant="ghost"
              onPress={goPrev}
              disabled={!hasPrev}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Button
              title={hasNext ? 'Следующее →' : '✓ Завершить'}
              onPress={hasNext ? goNext : () => { ttsStop(); navigation.goBack(); }}
            />
          </View>
        </View>

        {/* Описание урока — только на первом шаге */}
        {stepIdx === 0 && (
          <Card style={{ marginTop: spacing.lg, backgroundColor: colors.info + '10' }}>
            <Text style={[styles.label, { color: colors.info }]}>💡 О уроке</Text>
            <Text style={styles.actionText}>{lesson.description}</Text>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  back: { ...typography.bodyMedium, color: '#fff', marginBottom: spacing.md },
  lessonTitle: { ...typography.h3, color: '#fff', marginBottom: spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  stepCount: { ...typography.caption, color: '#fff', fontWeight: '700' },

  stepTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'center' },

  illustrationBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: 240, height: 280 },
  imagePlaceholder: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 120, opacity: 0.3 },

  label: { ...typography.caption, fontWeight: '700', marginBottom: 4 },
  actionText: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },

  tabsRow: { flexDirection: 'row', marginBottom: spacing.sm, gap: 6 },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  contentCard: { marginBottom: spacing.md, minHeight: 90 },
  contentText: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },
  contentAr: { fontSize: 24, textAlign: 'right', writingDirection: 'rtl', lineHeight: 44 },

  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bigPlayBtn: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  playerLabel: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '600' },
  playerSub: { ...typography.small, color: colors.textSecondary, marginTop: 2 },

  resetBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  resetIcon: { fontSize: 20, fontWeight: '700' },

  navRow: { flexDirection: 'row', marginTop: spacing.lg },
});
