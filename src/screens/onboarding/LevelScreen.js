import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';

const LEVELS = [
  { id: 'beginner', label: 'Новичок', desc: 'Только начинаю знакомиться с Исламом' },
  { id: 'middle', label: 'Средний', desc: 'Знаю основы, хочу углубить' },
  { id: 'advanced', label: 'Продвинутый', desc: 'Хочу учить арабский и тафсир' },
];

export default function LevelScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [selected, setSelected] = useState(null);

  return (
    <Screen padded>
      <Text style={styles.step}>Шаг 2 из 3</Text>
      <Text style={styles.title}>Ваш уровень</Text>
      <Text style={styles.subtitle}>Выберите, чтобы программа была вам по силам.</Text>

      <View style={{ marginTop: spacing.xl }}>
        {LEVELS.map((l) => {
          const active = selected === l.id;
          return (
            <TouchableOpacity
              key={l.id}
              activeOpacity={0.85}
              onPress={() => setSelected(l.id)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{l.label}</Text>
              <Text style={styles.optionDesc}>{l.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />
      <Button
        title="Далее"
        size="lg"
        disabled={!selected}
        onPress={() => navigation.navigate('Plan', { goal: route.params?.goal, level: selected })}
      />
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  step: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  option: {
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '12' },
  optionLabel: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  optionLabelActive: { color: colors.primary },
  optionDesc: { ...typography.small, color: colors.textSecondary },
});
