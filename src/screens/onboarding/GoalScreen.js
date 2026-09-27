import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';

const GOALS = [
  { id: 'islam', label: 'Изучать Ислам', icon: '🌙' },
  { id: 'quran', label: 'Читать Коран', icon: '📖' },
  { id: 'arabic', label: 'Учить арабский', icon: '🔤' },
  { id: 'salat', label: 'Подготовиться к намазу', icon: '🕌' },
];

export default function GoalScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // Множественный выбор
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  };

  return (
    <Screen padded>
      <Text style={styles.step}>Шаг 1 из 3</Text>
      <Text style={styles.title}>Какова ваша цель?</Text>
      <Text style={styles.subtitle}>Выберите одну или несколько — мы построим ваш путь.</Text>

      <ScrollView style={{ marginTop: spacing.xl, flex: 1 }} showsVerticalScrollIndicator={false}>
        {GOALS.map((g) => {
          const active = selected.includes(g.id);
          return (
            <TouchableOpacity
              key={g.id}
              activeOpacity={0.85}
              onPress={() => toggle(g.id)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text style={styles.icon}>{g.icon}</Text>
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{g.label}</Text>
              <View style={[styles.checkbox, active && styles.checkboxActive]}>
                {active && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
        <Text style={styles.hint}>
          {selected.length === 0 ? 'Выберите хотя бы один пункт' : `Выбрано: ${selected.length}`}
        </Text>
      </ScrollView>

      <Button
        title="Далее"
        size="lg"
        disabled={selected.length === 0}
        onPress={() => navigation.navigate('Level', { goals: selected, goal: selected[0] })}
      />
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  step: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  icon: { fontSize: 26, marginRight: spacing.md },
  optionLabel: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
  optionLabelActive: { color: colors.primary, fontWeight: '700' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: '#fff', fontWeight: '900', fontSize: 14 },
  hint: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginVertical: spacing.md },
});
