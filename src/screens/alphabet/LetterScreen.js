import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { spacing, radii, typography } from '../../constants/theme';
import { letters, hamza, findLetter } from '../../data/alphabet';
import {
  speak, stop, hasArabicVoice,
  getArabicVoices, getSelectedVoiceId, setVoice, loadSettings,
} from '../../services/ttsService';
import { useTheme } from '../../store/themeStore';
import IconText from '../../components/IconText';

export default function LetterScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isHamza = route.params.letterId === 'hamza';
  const letter = isHamza ? hamza : findLetter(route.params.letterId);
  const [speaking, setSpeaking] = useState(false);
  const [arVoiceWarn, setArVoiceWarn] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      await loadSettings();
      const has = await hasArabicVoice();
      setArVoiceWarn(!has);
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

  const currentVoiceName = voices.find((v) => v.identifier === selectedVoice)?.name || 'По умолчанию';

  if (!letter) return null;

  const sayLetter = async () => {
    setSpeaking(true);
    // Название буквы (باء) — одиночный символ системный TTS читает нестабильно
    await speak(letter.nameAr || letter.letter, { rate: 0.5 });
    setSpeaking(false);
  };

  const sayExample = async () => {
    setSpeaking(true);
    await speak(letter.example.ar);
    setSpeaking(false);
  };

  // Найти соседние буквы для навигации
  let prev, next;
  if (!isHamza) {
    const idx = letters.findIndex((l) => l.id === letter.id);
    prev = idx > 0 ? letters[idx - 1] : null;
    next = idx < letters.length - 1 ? letters[idx + 1] : null;
  }

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} backLabel="← Алфавит" pattern>
        

        <Text style={styles.bigLetter}>{letter.letter}</Text>
        <Text style={styles.letterName}>{letter.name}</Text>
        <Text style={styles.letterAr}>{letter.nameAr}</Text>
        <Text style={styles.transcription}>{letter.tr}</Text>

        <TouchableOpacity
          onPress={sayLetter}
          style={[styles.playMain, speaking && styles.playMainActive]}
        >
          <Icon name={speaking ? 'pause' : 'play'} size={18} color="#fff" style={{ marginRight: spacing.sm }} />
          <Text style={styles.playLabel}>Произнести букву</Text>
        </TouchableOpacity>

        {voices.length > 0 && (
          <TouchableOpacity
            onPress={() => setVoiceModalOpen(true)}
            style={styles.voiceBtn}
          >
            <IconText icon="volume" style={styles.voiceBtnText}>Голос: {currentVoiceName}</IconText>
            <Text style={styles.voiceBtnChev}>›</Text>
          </TouchableOpacity>
        )}
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {arVoiceWarn && (
          <Card style={{ marginBottom: spacing.md, backgroundColor: colors.warning + '15' }}>
            <IconText icon="alert" style={{ ...typography.small, color: colors.warning }}>В системе не найден арабский голос для TTS. На iOS: Настройки → Универсальный доступ → Контент → Голоса → Арабский. На Android установите Google TTS + арабский язык.</IconText>
          </Card>
        )}

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.label}>Описание звука</Text>
          <Text style={styles.bodyText}>{letter.sound}</Text>
          {!!letter.ru && <Text style={[styles.bodyText, { fontStyle: 'italic', marginTop: 4 }]}>{letter.ru}</Text>}
        </Card>

        {!!letter.tip && (
          <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '12' }}>
            <IconText icon="bulb" style={[styles.label, { color: colors.accentDark }]}>Подсказка</IconText>
            <Text style={styles.bodyText}>{letter.tip}</Text>
          </Card>
        )}

        {/* Формы буквы (только для обычных букв, не для хамзы) */}
        {letter.forms && (
          <>
            <Text style={styles.sectionTitle}>4 формы буквы</Text>
            <View style={styles.formsGrid}>
              {[
                { key: 'isolated', label: 'Отдельно' },
                { key: 'initial', label: 'В начале' },
                { key: 'medial', label: 'В середине' },
                { key: 'final', label: 'В конце' },
              ].map(({ key, label }) => (
                <View key={key} style={styles.formBox}>
                  <Text style={styles.formChar}>{letter.forms[key]}</Text>
                  <Text style={styles.formLabel}>{label}</Text>
                </View>
              ))}
            </View>
            {!letter.connectsLeft && (
              <Card style={{ marginBottom: spacing.md, backgroundColor: colors.info + '12' }}>
                <IconText icon="pin" style={[styles.label, { color: colors.info }]}>Особенность</IconText>
                <Text style={styles.bodyText}>
                  Эта буква НЕ соединяется со следующей. После неё всегда «разрыв», даже в середине слова.
                </Text>
              </Card>
            )}
          </>
        )}

        {/* Варианты написания хамзы */}
        {letter.variants && (
          <>
            <Text style={styles.sectionTitle}>Варианты написания хамзы</Text>
            <Card>
              {letter.variants.map((v, i) => (
                <View key={i} style={styles.variantRow}>
                  <Text style={styles.variantChar}>{v.form}</Text>
                  <Text style={styles.variantDesc}>{v.desc}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Пример */}
        <Text style={styles.sectionTitle}>Пример</Text>
        <Card>
          <Text style={styles.exampleAr}>{letter.example.ar}</Text>
          <Text style={styles.exampleTr}>{letter.example.tr}</Text>
          <Text style={styles.exampleRu}>{letter.example.ru}</Text>
          <Button
            title="Прослушать пример"
            variant="outline"
            onPress={sayExample}
            style={{ marginTop: spacing.md }}
          />
        </Card>

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

        {/* Навигация по буквам */}
        {(prev || next) && (
          <View style={styles.nav}>
            <View style={{ flex: 1 }}>
              {prev && (
                <Button
                  title={`← ${prev.letter} ${prev.name}`}
                  variant="ghost"
                  onPress={() => navigation.replace('Letter', { letterId: prev.id })}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              {next && (
                <Button
                  title={`${next.letter} ${next.name} →`}
                  variant="ghost"
                  onPress={() => navigation.replace('Letter', { letterId: next.id })}
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bigLetter: { fontSize: 130, color: '#fff', lineHeight: 150 },
  letterName: { ...typography.h2, color: '#fff', marginTop: spacing.sm },
  letterAr: { ...typography.body, color: colors.accentLight, marginTop: 2 },
  transcription: { ...typography.h4, color: colors.accent, marginTop: spacing.sm },

  playMain: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
  },
  playMainActive: { backgroundColor: colors.accentDark },
  playLabel: { ...typography.bodyMedium, color: colors.textOnAccent, fontWeight: '700' },

  label: { ...typography.caption, color: colors.textSecondary, marginBottom: 4, fontWeight: '700' },
  bodyText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },

  sectionTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },

  formsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  formBox: {
    flex: 1,
    margin: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
  },
  formChar: { fontSize: 40, color: colors.primary, marginBottom: 4 },
  formLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },

  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  variantChar: { fontSize: 32, color: colors.primary, width: 60, textAlign: 'center' },
  variantDesc: { ...typography.body, color: colors.textPrimary, flex: 1 },

  exampleAr: { ...typography.arabicLarge, color: colors.textPrimary, textAlign: 'right' },
  exampleTr: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  exampleRu: { ...typography.body, color: colors.textPrimary, marginTop: 4 },

  nav: { flexDirection: 'row', marginTop: spacing.lg },

  // Кнопка выбора голоса под основным play
  voiceBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  voiceBtnText: { ...typography.small, color: '#fff', fontWeight: '600' },
  voiceBtnChev: { fontSize: 18, color: '#fff', marginLeft: 6 },

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
