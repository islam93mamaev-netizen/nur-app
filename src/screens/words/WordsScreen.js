import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
  Modal, Pressable,
} from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { spacing, typography, radii } from '../../constants/theme';
import { words, wordCategories, getWordsByCategory } from '../../data/words';
import { useProgress } from '../../store/progressStore';
import {
  speak, stop, isSpeaking,
  getArabicVoices, getSelectedVoiceId, setVoice,
  getRate, setRate, loadSettings, platformInfo,
} from '../../services/ttsService';
import { useTheme } from '../../store/themeStore';

const SPEED_OPTIONS = [
  { id: 'slow',   label: 'Медленно', rate: 0.4 },
  { id: 'normal', label: 'Нормально', rate: 0.6 },
  { id: 'fast',   label: 'Быстро', rate: 0.85 },
];

export default function WordsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [category, setCategory] = useState(wordCategories[0].id);
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState(null);
  const [rate, setRateState] = useState(0.6);
  const [voicePickerOpen, setVoicePickerOpen] = useState(false);
  const [playingId, setPlayingId] = useState(null);

  const { state, wordsDueForReview } = useProgress();
  const due = wordsDueForReview().length;
  const learned = Object.keys(state.learnedWords).length;
  const list = getWordsByCategory(category);

  useEffect(() => {
    (async () => {
      await loadSettings();
      setVoiceId(getSelectedVoiceId());
      setRateState(getRate());
      const v = await getArabicVoices();
      setVoices(v);
    })();
    return () => { stop(); };
  }, []);

  const playWord = async (w) => {
    if (playingId === w.id) {
      await stop();
      setPlayingId(null);
      return;
    }
    setPlayingId(w.id);
    await speak(w.ar);
    setPlayingId(null);
  };

  const pickVoice = async (id) => {
    setVoiceId(id);
    await setVoice(id);
    setVoicePickerOpen(false);
  };

  const pickRate = async (r) => {
    setRateState(r);
    await setRate(r);
  };

  const currentVoiceLabel = voices.find((v) => v.identifier === voiceId)?.name
    || (voiceId ? voiceId.slice(0, 20) : 'Голос по умолчанию');
  const currentRateLabel = SPEED_OPTIONS.find((s) => Math.abs(s.rate - rate) < 0.05)?.label || 'Нормально';

  return (
    <Screen padded={false}>
      <View style={{ padding: spacing.lg }}>
        <Text style={styles.title}>Арабские слова</Text>
        <Text style={styles.subtitle}>База {words.length}+ слов. Цель: 300 за 6 месяцев.</Text>
      </View>

      {/* Карточка статистики */}
      <View style={{ paddingHorizontal: spacing.lg }}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.statLabel}>Выучено</Text>
              <Text style={styles.statNum}>{learned}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>На повторение</Text>
              <Text style={[styles.statNum, { color: due > 0 ? colors.accentDark : colors.textMuted }]}>
                {due}
              </Text>
            </View>
            <Button
              title="Карточки"
              size="sm"
              onPress={() => navigation.navigate('Flashcards')}
              style={{ alignSelf: 'center' }}
            />
          </View>
        </Card>
      </View>

      {/* Селектор озвучки — голос и скорость вертикально (помещается на узких экранах) */}
      <View style={styles.audioBar}>
        <TouchableOpacity
          onPress={() => setVoicePickerOpen(true)}
          style={styles.audioRow}
          activeOpacity={0.85}
        >
          <Text style={styles.audioIcon}>🎙️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.audioLabel}>Голос</Text>
            <Text style={styles.audioValue} numberOfLines={1}>{currentVoiceLabel}</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>

        <View style={styles.audioRow}>
          <Text style={styles.audioIcon}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.audioLabel}>Скорость</Text>
            <View style={styles.speedRow}>
              {SPEED_OPTIONS.map((s) => {
                const active = Math.abs(s.rate - rate) < 0.05;
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => pickRate(s.rate)}
                    style={[styles.speedPill, active && styles.speedPillActive]}
                  >
                    <Text style={[styles.speedText, active && styles.speedTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      {/* Категории — фиксированная высота, не растягиваются */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {wordCategories.map((c) => {
            const active = c.id === category;
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.85}
                onPress={() => setCategory(c.id)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {c.icon} {c.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Список слов */}
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl }}
        renderItem={({ item }) => {
          const learnedFlag = !!state.learnedWords[item.id];
          const isPlaying = playingId === item.id;
          return (
            <Card style={{ marginBottom: spacing.sm, paddingVertical: spacing.md }}>
              <View style={styles.wordRow}>
                {/* Кнопка play */}
                <TouchableOpacity
                  onPress={() => playWord(item)}
                  style={[styles.playBtn, isPlaying && styles.playBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={isPlaying ? 'Пауза' : 'Озвучить слово'}
                >
                  <Icon name={isPlaying ? 'pause' : 'play'} size={14} color={isPlaying ? '#fff' : colors.primary} />
                </TouchableOpacity>

                {/* Текст слова — нажатие открывает детали */}
                <TouchableOpacity
                  style={styles.wordTextArea}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('WordDetail', { wordId: item.id })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wordAr}>{item.ar}</Text>
                    <Text style={styles.wordTr}>{item.tr}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.wordRu}>{item.ru}</Text>
                    {learnedFlag ? (
                      <Pill label="Изучено" background={colors.success + '20'} textColor={colors.success} />
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
      />

      {/* Модал выбора голоса */}
      <Modal
        animationType="slide"
        transparent
        visible={voicePickerOpen}
        onRequestClose={() => setVoicePickerOpen(false)}
      >
        <Pressable style={styles.modalBg} onPress={() => setVoicePickerOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Выбор голоса (TTS)</Text>
            {voices.length > 0 ? (
              <Text style={styles.modalDesc}>
                Найдено {voices.length} арабских голосов
                {platformInfo.isWeb ? ' в браузере' : ' в системе'}.
              </Text>
            ) : (
              <View>
                <Text style={styles.modalDesc}>Арабские голоса не найдены.</Text>
                {platformInfo.os === 'ios' && (
                  <Text style={styles.modalDesc}>
                    iOS: Настройки → Универсальный доступ → Контент → Голоса → Арабский (загрузите голос).
                  </Text>
                )}
                {platformInfo.os === 'android' && (
                  <Text style={styles.modalDesc}>
                    Android: установите Google Speech Services (Play Store) + откройте Настройки → Язык и ввод → TTS → загрузите арабский язык.
                  </Text>
                )}
                {platformInfo.isWeb && (
                  <Text style={styles.modalDesc}>
                    Веб: используйте Chrome или Edge — у них есть голос «Google عربي». В Safari (macOS) арабский голос «Maged» доступен по умолчанию. Для Firefox: голоса берутся из системы — установите арабский голос в настройках ОС.
                  </Text>
                )}
              </View>
            )}

            <ScrollView style={{ maxHeight: 360, marginTop: spacing.md }}>
              <TouchableOpacity
                style={[styles.voiceRow, voiceId === null && styles.voiceRowActive]}
                onPress={() => pickVoice(null)}
              >
                <Text style={styles.voiceName}>Системный по умолчанию</Text>
                <Text style={styles.voiceMeta}>auto</Text>
              </TouchableOpacity>

              {voices.map((v) => (
                <TouchableOpacity
                  key={v.identifier}
                  style={[styles.voiceRow, voiceId === v.identifier && styles.voiceRowActive]}
                  onPress={() => pickVoice(v.identifier)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.voiceName}>{v.name || v.identifier.slice(0, 30)}</Text>
                    <Text style={styles.voiceMeta}>{v.language} • {v.quality || ''}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => speak('السَّلَامُ عَلَيْكُمْ', { voice: v.identifier })}
                    style={styles.previewBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Прослушать голос"
                  >
                    <Icon name="play" size={13} color={colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button title="Закрыть" variant="outline" onPress={() => setVoicePickerOpen(false)} style={{ marginTop: spacing.md }} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  statNum: { ...typography.h2, color: colors.primary, fontSize: 24 },

  audioBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  speedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  audioIcon: { fontSize: 20, marginRight: spacing.sm },
  audioLabel: { ...typography.caption, color: colors.textMuted },
  audioValue: { ...typography.small, color: colors.textPrimary, fontWeight: '600' },
  chev: { fontSize: 24, color: colors.textMuted },

  speedPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    marginRight: 6,
    marginBottom: 4,
  },
  speedPillActive: { backgroundColor: colors.primary },
  speedText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  speedTextActive: { color: '#fff' },

  // КЛЮЧ к фиксу: контейнер с явной высотой, чтобы FlatList знал где он
  tabsContainer: {
    height: 56,
    backgroundColor: colors.background,
    marginTop: spacing.md,
  },
  tabsRow: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    marginRight: 8,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.textOnPrimary },

  wordRow: { flexDirection: 'row', alignItems: 'center' },
  playBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  playBtnActive: { backgroundColor: colors.primary },
  wordTextArea: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  wordAr: { fontSize: 30, color: colors.textPrimary, lineHeight: 52 },
  wordTr: { ...typography.caption, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  wordRu: { ...typography.bodyMedium, color: colors.textPrimary, marginBottom: 4 },

  // Модал
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  modalDesc: { ...typography.small, color: colors.textSecondary, lineHeight: 18 },

  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  voiceRowActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  voiceName: { ...typography.bodyMedium, color: colors.textPrimary },
  voiceMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  previewBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
