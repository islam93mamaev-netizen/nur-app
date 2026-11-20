// Шапка главной: приветствие, кнопка поиска и счётчик серии дней.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../Icon';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';

export default function HomeGreeting({ name, streak, onSearch }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>Ассаламу алейкум{name ? `, ${name}` : ''}</Text>
        <Text style={styles.sub}>Продолжайте свой путь сегодня</Text>
      </View>
      <TouchableOpacity
        onPress={onSearch}
        style={styles.searchBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Поиск по приложению"
      >
        <Icon name="search" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      <View style={styles.streak} accessibilityLabel={`Серия: ${streak} дней`}>
        <Icon name="flame" size={18} color={colors.accentDark} style={{ marginRight: 4 }} />
        <Text style={styles.streakNum}>{streak}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  greeting: { ...typography.h3, color: colors.textPrimary },
  sub: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  searchBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  streakNum: { ...typography.bodyMedium, color: colors.accentDark, fontWeight: '700' },
});
