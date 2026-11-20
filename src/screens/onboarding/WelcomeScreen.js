import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { useProgress } from '../../store/progressStore';

// Онбординг — один экран: «Начать» сразу открывает приложение.
// Цель/уровень/дневная норма ставятся по умолчанию (как раньше на последнем шаге).
const DEFAULT_PROFILE = { goal: 'islam', level: 'beginner', dailyMinutes: 10 };

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { completeOnboarding } = useProgress();
  return (
    <Screen background={colors.primary} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Text style={styles.bismillah}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
        <Text style={styles.brand}>Нур</Text>
        <Text style={styles.tagline}>Путь к свету знаний</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.desc}>
          Изучайте основы Ислама, читайте Коран, запоминайте хадисы и арабские слова.
        </Text>
        <Button
          title="Начать"
          variant="secondary"
          size="lg"
          onPress={() => completeOnboarding(DEFAULT_PROFILE)}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bismillah: {
    color: colors.accentLight,
    fontSize: 22,
    lineHeight: 36,
    marginBottom: spacing.xl,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  brand: {
    fontSize: 64,
    lineHeight: 80,
    color: colors.textOnPrimary,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
    includeFontPadding: false,
  },
  tagline: {
    ...typography.body,
    color: colors.accent,
    marginTop: spacing.sm,
    letterSpacing: 1,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  footer: { paddingBottom: spacing.xl },
  desc: {
    ...typography.body,
    color: colors.textOnPrimary,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
});
