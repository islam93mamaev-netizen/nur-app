import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radii, spacing, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';

export default function Pill({ label, color, background, textColor }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const pillColor = color || colors.primary;
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: background || pillColor + '20' },
      ]}
    >
      <Text style={[styles.text, { color: textColor || pillColor }]}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  pill: {
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  text: { ...typography.caption, fontWeight: '600' },
});
