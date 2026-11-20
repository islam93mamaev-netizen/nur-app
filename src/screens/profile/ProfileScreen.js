import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import PatternBackground from '../../components/PatternBackground';
import Button from '../../components/Button';
import { spacing, radii, typography } from '../../constants/theme';
import { useProgress } from '../../store/progressStore';
import { modules } from '../../data/modules';
import { words } from '../../data/words';
import { hadiths } from '../../data/hadiths';
import { useTheme, FONT_SCALES } from '../../store/themeStore';
import { useSettings, HADITH_SERVICES, HADITH_SERVICE_LABEL, AI_PROVIDERS, AI_PROVIDER_LABEL } from '../../store/settingsStore';
import { confirmAction, notify } from '../../utils/dialogs';
import CategoryIcon from '../../components/CategoryIcon';
import IconText from '../../components/IconText';

// 1 день, 2 дня, 5 дней
function dayWord(n) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'день';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'дня';
  return 'дней';
}

const ACHIEVEMENTS = [
  { id: 'first_lesson', icon: '🌱', title: 'Первый шаг', desc: 'Пройдите 1 урок', test: (s) => Object.keys(s.completedLessons).length >= 1 },
  { id: 'five_lessons', icon: '📚', title: 'Прилежный', desc: 'Пройдите 5 уроков', test: (s) => Object.keys(s.completedLessons).length >= 5 },
  { id: 'ten_words', icon: '🔤', title: 'Словарный запас', desc: '10 выученных слов', test: (s) => Object.keys(s.learnedWords).length >= 10 },
  { id: 'streak_3', icon: '🔥', title: 'Серия 3 дня', desc: '3 дня подряд', test: (s) => s.streak.count >= 3 },
  { id: 'streak_7', icon: '⚡', title: 'Неделя', desc: '7 дней подряд', test: (s) => s.streak.count >= 7 },
  { id: 'xp_100', icon: '⭐', title: '100 XP', desc: 'Набрать 100 XP', test: (s) => s.xp >= 100 },
  { id: 'all_modules', icon: '🏆', title: 'Все основы', desc: 'Все уроки основ', test: (s) => modules.every((m) => m.lessons.every((l) => s.completedLessons[l.id])) },
];

export default function ProfileScreen({ navigation }) {
  const { colors, mode, setMode, fontScale, setFontScale } = useTheme();
  const { hadithService, setHadithService, aiApiKey, setAiApiKey, aiProvider, setAiProvider } = useSettings();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, reset, wordsDueForReview } = useProgress();
  const [aiKeyDraft, setAiKeyDraft] = useState(aiApiKey || '');
  const [aiKeyVisible, setAiKeyVisible] = useState(false);

  // Синхронизируем draft с настройкой, если ключ обновился извне
  useEffect(() => { setAiKeyDraft(aiApiKey || ''); }, [aiApiKey]);

  const saveAiKey = () => {
    setAiApiKey(aiKeyDraft);
    notify('Ключ сохранён', aiKeyDraft ? 'AI-помощник готов к работе.' : 'Ключ удалён — AI работает в офлайн-режиме.');
  };
  const openKeyUrl = () => {
    const url = AI_PROVIDER_LABEL[aiProvider]?.keyUrl;
    if (url) Linking.openURL(url).catch(() => {});
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = Object.keys(state.completedLessons).length;
  const learnedWords = Object.keys(state.learnedWords).length;
  const dueWords = wordsDueForReview().length;

  const confirmReset = () => {
    confirmAction({
      title: 'Сбросить прогресс?',
      message: 'Все данные о пройденных уроках и выученных словах будут удалены.',
      confirmText: 'Сбросить',
      onConfirm: reset,
    });
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Компактная шапка: аватар, имя и серия дней на фоне с орнаментом */}
        <View style={styles.headerCard}>
          <PatternBackground from={colors.primary} to={colors.primaryDark} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(state.profile.name || 'У').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>{state.profile.name || 'Ученик'}</Text>
            <View style={styles.streakRow}>
              <Icon name="flame" size={15} color={colors.accentLight || '#E8C77A'} />
              <Text style={styles.streakText}>
                {state.streak.count > 0 ? `${state.streak.count} ${dayWord(state.streak.count)} подряд` : 'Начните серию сегодня'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statBig}>{state.streak.count}</Text>
            <Text style={styles.statSub}>дней подряд</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statBig}>{completedLessons}</Text>
            <Text style={styles.statSub}>из {totalLessons} уроков</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statBig}>{learnedWords}</Text>
            <Text style={styles.statSub}>слов изучено</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statBig}>{dueWords}</Text>
            <Text style={styles.statSub}>на повторение</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Достижения</Text>
        <View style={styles.achGrid}>
          {ACHIEVEMENTS.map((a) => {
            const unlocked = a.test(state);
            return (
              <View key={a.id} style={[styles.achCard, !unlocked && styles.achLocked]}>
                <CategoryIcon icon={a.icon} textStyle={[styles.achIcon, !unlocked && { opacity: 0.3 }]} />
                <Text style={[styles.achTitle, !unlocked && { color: colors.textMuted }]}>{a.title}</Text>
                <Text style={styles.achDesc}>{a.desc}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Оформление</Text>
        <Card>
          <Text style={styles.label}>Тема</Text>
          <View style={styles.themeRow}>
            {[
              { id: 'light', icon: '☀️', label: 'Светлая' },
              { id: 'dark', icon: '🌙', label: 'Тёмная' },
              { id: 'system', icon: '⚙️', label: 'Системная' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setMode(opt.id)}
                activeOpacity={0.85}
                style={[
                  styles.themeBtn,
                  mode === opt.id && styles.themeBtnActive,
                ]}
              >
                <CategoryIcon icon={opt.icon} textStyle={styles.themeIcon} />
                <Text style={[styles.themeLabel, mode === opt.id && styles.themeLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: spacing.lg }]}>Размер шрифта</Text>
          <View style={styles.themeRow}>
            {FONT_SCALES.map((opt) => {
              const active = Math.abs(fontScale - opt.value) < 0.001;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setFontScale(opt.value)}
                  activeOpacity={0.85}
                  style={[styles.themeBtn, active && styles.themeBtnActive]}
                >
                  {/* allowFontScaling={false} — глобальный font-patch не вмешивается,
                      каждая кнопка показывает свой реальный размер «A» */}
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.fontPreview,
                      { fontSize: Math.round(22 * opt.value) },
                      active && { color: colors.primary },
                    ]}
                  >
                    A
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[styles.themeLabel, active && styles.themeLabelActive]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.fontHint}>
            Влияет на основные тексты — хадисы, статьи, азкары, грамматику.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Источник хадисов</Text>
        <Card>
          <Text style={styles.label}>Куда открывать ссылки на хадис</Text>
          <View style={styles.themeRow}>
            {[
              { id: HADITH_SERVICES.ISNAD,  icon: '🇷🇺', label: HADITH_SERVICE_LABEL[HADITH_SERVICES.ISNAD].short },
              { id: HADITH_SERVICES.SUNNAH, icon: '🌍', label: HADITH_SERVICE_LABEL[HADITH_SERVICES.SUNNAH].short },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setHadithService(opt.id)}
                activeOpacity={0.85}
                style={[
                  styles.themeBtn,
                  hadithService === opt.id && styles.themeBtnActive,
                ]}
              >
                <CategoryIcon icon={opt.icon} textStyle={styles.themeIcon} />
                <Text style={[styles.themeLabel, hadithService === opt.id && styles.themeLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fontHint}>
            Isnad.link — русские переводы хадисов. Sunnah.com — англо-арабская энциклопедия
            с глубокой ссылкой на конкретный номер. В модальном окне всегда доступны обе ссылки.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>AI-помощник</Text>
        <Card>
          <Text style={styles.label}>Провайдер AI</Text>
          <View style={styles.themeRow}>
            {[
              { id: AI_PROVIDERS.OPENROUTER, icon: '🌐', label: 'OpenRouter' },
              { id: AI_PROVIDERS.DEEPSEEK,   icon: '🐳', label: 'DeepSeek' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setAiProvider(opt.id)}
                activeOpacity={0.85}
                style={[
                  styles.themeBtn,
                  aiProvider === opt.id && styles.themeBtnActive,
                ]}
              >
                <CategoryIcon icon={opt.icon} textStyle={styles.themeIcon} />
                <Text style={[styles.themeLabel, aiProvider === opt.id && styles.themeLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fontHint}>
            {aiProvider === AI_PROVIDERS.OPENROUTER
              ? '🆓 Использует модель DeepSeek V4 Flash на OpenRouter (бесплатно, ~100 запросов/день).'
              : '🆓 Прямой DeepSeek API — стартовые 5М токенов бесплатно для новых аккаунтов.'}
          </Text>

          <Text style={[styles.label, { marginTop: spacing.lg }]}>API-ключ</Text>
          <View style={styles.keyRow}>
            <TextInput
              value={aiKeyDraft}
              onChangeText={setAiKeyDraft}
              placeholder={aiProvider === AI_PROVIDERS.OPENROUTER ? 'sk-or-...' : 'sk-...'}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!aiKeyVisible}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.keyInput}
            />
            <TouchableOpacity onPress={() => setAiKeyVisible((v) => !v)} style={styles.keyEyeBtn}>
              <CategoryIcon icon={aiKeyVisible ? '🙈' : '👁'} textStyle={styles.keyEyeText} />
            </TouchableOpacity>
          </View>
          <View style={styles.keyActions}>
            <TouchableOpacity onPress={saveAiKey} style={styles.keySaveBtn} activeOpacity={0.85}>
              <Text style={styles.keySaveText}>Сохранить ключ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openKeyUrl} style={styles.keyHelpBtn} activeOpacity={0.85}>
              <Text style={styles.keyHelpText}>Получить ключ →</Text>
            </TouchableOpacity>
          </View>
          {aiApiKey ? (
            <Text style={[styles.fontHint, { color: colors.success }]}>
              ✓ Ключ сохранён ({aiApiKey.slice(0, 7)}…{aiApiKey.slice(-4)})
            </Text>
          ) : (
            <Text style={styles.fontHint}>
              Без ключа AI-помощник работает в офлайн-режиме (заготовленные ответы).
            </Text>
          )}
        </Card>

        <Text style={styles.sectionTitle}>База контента</Text>
        <Card>
          <View style={styles.dataRow}>
            <IconText icon="book" style={styles.dataLabel}>Модулей</IconText>
            <Text style={styles.dataValue}>{modules.length}</Text>
          </View>
          <View style={styles.dataRow}>
            <IconText icon="bookOpen" style={styles.dataLabel}>Уроков</IconText>
            <Text style={styles.dataValue}>{totalLessons}</Text>
          </View>
          <View style={styles.dataRow}>
            <IconText icon="scroll" style={styles.dataLabel}>Хадисов</IconText>
            <Text style={styles.dataValue}>{hadiths.length}</Text>
          </View>
          <View style={styles.dataRow}>
            <IconText icon="type" style={styles.dataLabel}>Слов</IconText>
            <Text style={styles.dataValue}>{words.length}</Text>
          </View>
        </Card>

        <View style={{ marginTop: spacing.xl }}>
          <Button
            title="Резервная копия прогресса"
            onPress={() => navigation.navigate('Backup')}
          />
          <View style={{ height: spacing.sm }} />
          <Button
            title="Источники и проверка"
            variant="outline"
            onPress={() => navigation.navigate('Sources')}
          />
          <View style={{ height: spacing.sm }} />
          <Button title="Сбросить прогресс" variant="outline" onPress={confirmReset} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 22, color: colors.primaryDark || colors.primary, fontWeight: '800' },
  userName: { ...typography.h3, color: '#fff' },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  streakText: { ...typography.caption, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  label: { ...typography.caption, color: colors.textSecondary },
  caption: { ...typography.caption, color: colors.textSecondary },

  // Сетка статистики 2×2
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.lg, gap: spacing.sm },
  statCard: { width: '47%', flexGrow: 1, alignItems: 'center', paddingVertical: spacing.md },
  statBig: { ...typography.h2, color: colors.primary },
  statSub: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },

  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md },

  achGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  achCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  achLocked: { backgroundColor: colors.surfaceAlt },
  achIcon: { fontSize: 30, marginBottom: spacing.xs },
  achTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  achDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },

  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  dataLabel: { ...typography.body, color: colors.textPrimary },
  dataValue: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700' },

  themeRow: { flexDirection: 'row', marginTop: spacing.sm },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: 4,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  themeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  themeIcon: { fontSize: 24, marginBottom: 4 },
  themeLabel: { ...typography.small, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  themeLabelActive: { color: colors.primary, fontWeight: '700' },
  fontPreview: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  fontHint: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 18 },

  // AI key
  keyRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  keyInput: {
    flex: 1,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    ...typography.body,
    color: colors.textPrimary,
  },
  keyEyeBtn: { paddingHorizontal: spacing.md, paddingVertical: 10 },
  keyEyeText: { fontSize: 18 },
  keyActions: { flexDirection: 'row', marginTop: spacing.sm },
  keySaveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10, borderRadius: radii.md,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  keySaveText: { ...typography.bodyMedium, color: '#fff', fontWeight: '700' },
  keyHelpBtn: {
    flex: 1,
    borderWidth: 1.5, borderColor: colors.primary,
    paddingVertical: 10, borderRadius: radii.md,
    alignItems: 'center',
  },
  keyHelpText: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700' },
});
