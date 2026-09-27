import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { spacing, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';

export default function SectionHeader({ title, subtitle, action, onAction }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <View style={styles.diamond} />
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  // Золотой ромб — фирменный акцент заголовков (мотив исламского орнамента)
  diamond: {
    width: 9,
    height: 9,
    backgroundColor: colors.accent,
    transform: [{ rotate: '45deg' }],
    marginRight: spacing.sm,
    borderRadius: 1.5,
  },
  title: { ...typography.h3, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  action: { ...typography.bodyMedium, color: colors.primary },
});
