// Плашка степени достоверности хадиса (под источником).
//   <HadithGrade item={hadith} />
// Степень берётся из utils/hadithGrade: явное поле grade, сахихи Бухари/Муслима
// или степень, написанная в источнике. Если не указана — честно об этом говорим.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';
import { hadithGrade } from '../utils/hadithGrade';

export default function HadithGrade({ item, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const g = hadithGrade(item);

  const tone = !g ? colors.textMuted
    : g.id === 'daif' ? colors.danger || '#B23A48'
    : g.id === 'hasan' ? colors.accentDark || colors.accent
    : colors.success;

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.badge, { borderColor: tone, backgroundColor: tone + '18' }]}>
        <Text style={[styles.badgeText, { color: tone }]}>{g ? g.label : 'Степень не указана'}</Text>
      </View>
      <Text style={styles.basis}>
        {g ? `${g.hint} — ${g.basis}` : 'уточняется; см. источник'}
      </Text>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: spacing.sm, gap: spacing.sm },
  badge: { borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { ...typography.caption, fontWeight: '700' },
  basis: { ...typography.caption, color: colors.textSecondary, flexShrink: 1 },
});
