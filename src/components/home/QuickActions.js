// Сетка быстрых действий на главной: секции по 4 кнопки в ряд.
// Неполные ряды выравниваются влево — пустые ячейки-заглушки не нужны.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../Icon';
import SectionHeader from '../SectionHeader';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';

export default function QuickActions({ sections, onNavigate }) {
  const { colors } = useTheme();
  // Стили создаются один раз на сетку, а не в каждой из ~26 кнопок
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return sections.map((section) => (
    <View key={section.id}>
      <SectionHeader title={section.title} />
      <View style={styles.grid}>
        {section.items.map((item) => (
          <TouchableOpacity
            key={item.route}
            activeOpacity={0.85}
            onPress={() => onNavigate(item.route)}
            style={styles.cell}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
              <Icon name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ));
}

const makeStyles = (colors) => StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm },
  cell: { width: '25%', alignItems: 'center', paddingVertical: spacing.sm },
  iconBox: {
    width: 56, height: 56, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  title: { ...typography.caption, color: colors.textPrimary, textAlign: 'center', fontWeight: '600' },
});
