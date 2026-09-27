import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { spacing, radii, typography } from '../../constants/theme';
import { useProgress } from '../../store/progressStore';
import { useTheme } from '../../store/themeStore';

const MINUTES = [5, 10, 15, 30];

export default function PlanScreen({ route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [minutes, setMinutes] = useState(10);
  const { completeOnboarding } = useProgress();

  const finish = () => {
    completeOnboarding({
      goal: route.params?.goal || 'islam',
      level: route.params?.level || 'beginner',
      dailyMinutes: minutes,
    });
  };

  return (
    <Screen padded>
      <Text style={styles.step}>Шаг 3 из 3</Text>
      <Text style={styles.title}>Ваш ежедневный план</Text>
      <Text style={styles.subtitle}>Сколько минут в день вы готовы уделять обучению?</Text>

      <View style={styles.row}>
        {MINUTES.map((m) => {
          const active = minutes === m;
          return (
            <TouchableOpacity
              key={m}
              activeOpacity={0.85}
              onPress={() => setMinutes(m)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{m} мин</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Card style={{ marginTop: spacing.xl }}>
        <Text style={styles.planTitle}>Что вы получите:</Text>
        <Text style={styles.planItem}>• 300 арабских слов за 6 месяцев</Text>
        <Text style={styles.planItem}>• 40 хадисов за 3 месяца</Text>
        <Text style={styles.planItem}>• Основы Ислама за 1 месяц</Text>
        <Text style={styles.planItem}>• Аят дня и хадис дня</Text>
        <Text style={styles.planItem}>• Тесты и карточки</Text>
      </Card>

      <View style={{ flex: 1 }} />
      <Button title="Начать обучение" size="lg" onPress={finish} />
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  step: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  row: { flexDirection: 'row', marginTop: spacing.xl, justifyContent: 'space-between' },
  pill: {
    flex: 1,
    paddingVertical: spacing.lg,
    marginHorizontal: 4,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  pillActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  pillText: { ...typography.bodyMedium, color: colors.textSecondary },
  pillTextActive: { color: colors.primary, fontWeight: '700' },
  planTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.sm },
  planItem: { ...typography.body, color: colors.textSecondary, marginVertical: 2 },
});
