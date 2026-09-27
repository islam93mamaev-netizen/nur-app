import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import WordBreakdown from '../../components/WordBreakdown';
import { spacing, typography, radii } from '../../constants/theme';
import { surahs as fallbackSurahs } from '../../data/quran';
import { words as dictWords } from '../../data/words';
import { getSurah, getAyatAudioUrl, RECITERS, getReciter, setReciter } from '../../services/quranService';
import * as audio from '../../services/audioService';
import Icon from '../../components/Icon';
import { useTheme } from '../../store/themeStore';

// Нормализация арабского слова для поиска в словаре:
// убираем огласовки, танвины, коранические знаки и татвиль.
function normalizeAr(s) {
  return (s || '')
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
    .replace(/[ٱ]/g, 'ا');
}

// Индекс словаря по нормализованной форме — для перевода слова из аята
const DICT_INDEX = (() => {
  const m = new Map();
  for (const w of dictWords) {
    const key = normalizeAr(w.ar);
    if (key && !m.has(key)) m.set(key, w);
  }
  return m;
})();

const AUTO_CONTINUE_KEY = '@nur_app/quran_auto_continue';
// Последняя открытая сура — для карточки «Продолжить чтение» на главной
export const LAST_READ_KEY = '@nur_app/quran_last_read';

export default function SurahScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const fallback = fallbackSurahs.find((s) => s.id === route.params.surahId);
  const [surah, setSurah] = useState(fallback || null);
  const [loading, setLoading] = useState(!fallback);
  const [playing, setPlaying] = useState(null); // ayat number
  const [loadingAyat, setLoadingAyat] = useState(null); // аят, чьё аудио грузится с CDN
  // Разбор слова по тапу: { text } | null
  const [pickedWord, setPickedWord] = useState(null);
  // Выбранный чтец (общая настройка приложения)
  const [reciterId, setReciterId] = useState(getReciter().id);

  const pickReciter = async (id) => {
    if (id === reciterId) return;
    await audio.stop();
    setPlaying(null);
    setLoadingAyat(null);
    await setReciter(id);
    setReciterId(id);
  };
  const [autoContinue, setAutoContinueState] = useState(false);
  // Используем ref, чтобы внутри onFinish-замыкания всегда был актуальный режим
  const autoContinueRef = useRef(false);
  const surahRef = useRef(null);
  // Режим «Играть всю суру»: цепочка аятов продолжается независимо
  // от тумблера «Авто-продолжение» (раньше без тумблера играл только 1 аят)
  const playAllRef = useRef(false);

  useEffect(() => { autoContinueRef.current = autoContinue; }, [autoContinue]);
  useEffect(() => { surahRef.current = surah; }, [surah]);

  // Позиции карточек аятов (для автоскролла к играющему аяту)
  const scrollRef = useRef(null);
  const ayatPositions = useRef({});

  // Запоминаем последнюю открытую суру — «Продолжить чтение» на главной
  useEffect(() => {
    if (!surah) return;
    AsyncStorage.setItem(
      LAST_READ_KEY,
      JSON.stringify({ surahId: surah.id, name: surah.name, nameAr: surah.nameAr, ts: Date.now() })
    ).catch(() => {});
  }, [surah?.id]);

  // Автоскролл к играющему аяту
  useEffect(() => {
    if (playing == null) return;
    const y = ayatPositions.current[playing];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 90), animated: true });
    }
  }, [playing]);

  // Загружаем сохранённый режим авто-продолжения
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTO_CONTINUE_KEY);
        if (raw === '1') setAutoContinueState(true);
      } catch {/* ignore */}
    })();
  }, []);

  const setAutoContinue = async (val) => {
    setAutoContinueState(val);
    try { await AsyncStorage.setItem(AUTO_CONTINUE_KEY, val ? '1' : '0'); } catch {/* ignore */}
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getSurah(route.params.surahId);
        if (alive) setSurah(data);
      } catch (e) {
        if (!fallback && alive) {
          Alert.alert('Ошибка', 'Не удалось загрузить суру. Проверьте интернет.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; audio.stop(); };
  }, [route.params.surahId]);

  if (loading && !surah) {
    return (
      <Screen padded>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Загружаем суру…</Text>
        </View>
      </Screen>
    );
  }
  if (!surah) return null;

  const playAyat = async (a) => {
    // Тап по играющему аяту = пауза (раньше состояние не сбрасывалось,
    // и иконка зависала в «паузе»)
    if (playing === a.n) {
      playAllRef.current = false;
      await audio.pause();
      setPlaying(null);
      setLoadingAyat(null);
      return;
    }
    try {
      const url = getAyatAudioUrl(surah.id, a.n);
      setPlaying(a.n);
      setLoadingAyat(a.n); // спиннер, пока аудио грузится с CDN
      await audio.play(url, {
        onStart: () => setLoadingAyat(null),
        onFinish: () => {
          // Продолжаем, если включено авто-продолжение ИЛИ идёт «Играть всю суру»
          const cur = surahRef.current;
          const nextAyat = cur?.ayats?.find((x) => x.n === a.n + 1);
          if ((autoContinueRef.current || playAllRef.current) && nextAyat) {
            playAyat(nextAyat);
          } else {
            playAllRef.current = false;
            setPlaying(null);
          }
        },
      });
      // Возобновление после паузы того же аята: onStart не придёт снова
      setTimeout(() => setLoadingAyat((v) => (v === a.n ? null : v)), 2500);
    } catch (e) {
      setPlaying(null);
      setLoadingAyat(null);
      Alert.alert('Аудио', 'Не удалось воспроизвести аят. Проверьте интернет.');
    }
  };

  const playFromBeginning = () => {
    if (!surah?.ayats?.length) return;
    // «Играть всю суру» — цепочка до конца суры независимо от тумблера
    // «Авто-продолжение» (сам тумблер-настройку не трогаем).
    playAllRef.current = true;
    playAyat(surah.ayats[0]);
  };

  const pauseAudio = async () => {
    playAllRef.current = false;
    await audio.stop();
    setPlaying(null);
    setLoadingAyat(null);
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.surahNameAr}>{surah.nameAr}</Text>
        <Text style={styles.surahName}>{surah.name} — {surah.translation}</Text>
        <Text style={styles.meta}>
          Сура {surah.id} • {surah.ayatCount} аят. • {surah.type === 'meccan' ? 'Мекканская' : 'Мединская'}
        </Text>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Панель управления: режим авто-продолжения + кнопка играть всю суру */}
        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.controlsTitle}>Авто-продолжение</Text>
              <Text style={styles.controlsSub}>
                {autoContinue ? 'Аят за аятом до конца суры' : 'По одному аяту'}
              </Text>
            </View>
            <Switch
              value={autoContinue}
              onValueChange={setAutoContinue}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={'#fff'}
            />
          </View>
          {/* Выбор чтеца — общая настройка для Корана и азкаров */}
          <Text style={styles.reciterLabel}>Чтец</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {RECITERS.map((r) => {
                const active = r.id === reciterId;
                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => pickReciter(r.id)}
                    style={[styles.reciterChip, active && styles.reciterChipActive]}
                  >
                    <Text style={[styles.reciterChipText, active && styles.reciterChipTextActive]}>
                      {r.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <Text style={styles.tapHint}>
            💡 Нажмите на любое слово аята — разбор по буквам и перевод
          </Text>
          <TouchableOpacity
            onPress={playing ? pauseAudio : playFromBeginning}
            style={[styles.playAllBtn, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
            activeOpacity={0.85}
          >
            <Icon name={playing ? 'pause' : 'play'} size={15} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.playAllText}>
              {playing ? `Стоп (аят ${playing})` : 'Играть всю суру'}
            </Text>
          </TouchableOpacity>
        </View>
        {surah.ayats.map((a) => {
          const isPlaying = playing === a.n;
          return (
            <Card
              key={a.n}
              onLayout={(e) => { ayatPositions.current[a.n] = e.nativeEvent.layout.y; }}
              style={[
                { marginBottom: spacing.md },
                // Подсветка играющего аята
                isPlaying && {
                  borderWidth: 1.5,
                  borderColor: colors.accent,
                  backgroundColor: colors.accent + '0C',
                },
              ]}
            >
              <View style={styles.ayatHeader}>
                <View style={styles.ayatNum}>
                  <Text style={styles.ayatNumText}>{a.n}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => playAyat(a)}
                  style={[styles.playBtn, isPlaying && styles.playBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={isPlaying ? 'Пауза' : `Слушать аят ${a.n}`}
                >
                  {loadingAyat === a.n ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Icon name={isPlaying ? 'pause' : 'play'} size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
              {/* Каждое слово нажимаемое: тап → разбор по буквам + перевод */}
              <Text style={styles.arabic}>
                {a.ar.split(/\s+/).map((w, wi) => (
                  <Text
                    key={wi}
                    suppressHighlighting
                    onPress={() => setPickedWord({ text: w })}
                  >
                    {w}{' '}
                  </Text>
                ))}
              </Text>
              {a.tr ? <Text style={styles.translit}>{a.tr}</Text> : null}
              <View style={styles.divider} />
              <Text style={styles.translation}>{a.ru}</Text>
            </Card>
          );
        })}
      </ScrollView>

      {/* Разбор слова по буквам (тап по слову в аяте) */}
      <Modal
        visible={!!pickedWord}
        transparent
        animationType="slide"
        onRequestClose={() => setPickedWord(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickedWord(null)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalCard} onPress={() => {}}>
            {pickedWord && (() => {
              const match = DICT_INDEX.get(normalizeAr(pickedWord.text));
              return (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHandle} />
                  {match && (
                    <View style={styles.modalMatch}>
                      <Text style={styles.modalRu}>{match.ru}</Text>
                      <Text style={styles.modalTr}>
                        {match.tr}{match.freq ? `  ·  в Коране ×${match.freq}` : ''}
                      </Text>
                    </View>
                  )}
                  <WordBreakdown word={pickedWord.text} transcription={match?.tr} />
                  {!match && (
                    <Text style={styles.modalHint}>
                      Перевод этого слова появится, когда оно попадёт в словарь приложения.
                      Разбор по буквам доступен для любого слова.
                    </Text>
                  )}
                  <TouchableOpacity onPress={() => setPickedWord(null)} style={styles.modalClose}>
                    <Text style={styles.modalCloseText}>Закрыть</Text>
                  </TouchableOpacity>
                </ScrollView>
              );
            })()}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  // Модал разбора слова
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalMatch: { alignItems: 'center', marginBottom: spacing.sm },
  modalRu: { ...typography.h3, color: colors.primary },
  modalTr: { ...typography.small, color: colors.textMuted, fontStyle: 'italic', marginTop: 2 },
  modalHint: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md, lineHeight: 17 },
  modalClose: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalCloseText: { ...typography.button, color: colors.textPrimary },
  tapHint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 17 },
  reciterLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', marginBottom: 6 },
  reciterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reciterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  reciterChipText: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },
  reciterChipTextActive: { color: '#fff' },

  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  back: { ...typography.bodyMedium, color: '#fff', alignSelf: 'flex-start' },
  surahNameAr: { fontSize: 44, color: '#fff', marginVertical: spacing.sm },
  surahName: { ...typography.h3, color: '#fff', textAlign: 'center' },
  meta: { ...typography.small, color: '#fff', opacity: 0.8, marginTop: 4 },

  ayatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ayatNum: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.accent + '30',
    alignItems: 'center', justifyContent: 'center',
  },
  ayatNumText: { ...typography.small, color: colors.accentDark, fontWeight: '700' },
  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  playBtnActive: { backgroundColor: colors.primary + '30' },
  arabic: {
    ...typography.arabicLarge,
    color: colors.textPrimary, textAlign: 'right',
    writingDirection: 'rtl', marginTop: spacing.sm,
  },
  translit: { ...typography.small, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing.sm },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  translation: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },

  // Контролы плеера
  controls: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  controlsTitle: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' },
  controlsSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  playAllBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  playAllText: { ...typography.bodyMedium, color: '#fff', fontWeight: '700' },
});
