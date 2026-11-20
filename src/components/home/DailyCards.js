// «Аят дня» и «Хадис дня» на главной. Кнопка «Другой» показывает случайный.

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../Card';
import Pill from '../Pill';
import Icon from '../Icon';
import ReferenceText from '../ReferenceText';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { getDailyAyat, getRandomAyat } from '../../data/quran';
import { getDailyHadith, getRandomHadith } from '../../data/hadiths';

// Заголовок блока с кнопкой «Другой» справа
function DayHeader({ title, onRefresh, styles, colors }) {
  return (
    <View style={styles.dayHeader}>
      <Text style={styles.dayTitle}>{title}</Text>
      <TouchableOpacity
        onPress={onRefresh}
        style={styles.refreshChip}
        accessibilityRole="button"
        accessibilityLabel={`${title}: показать другой`}
      >
        <Icon name="refresh" size={12} color={colors.primary} style={{ marginRight: 5 }} />
        <Text style={styles.refreshText}>Другой</Text>
      </TouchableOpacity>
    </View>
  );
}

export function AyatOfDay() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [ayat, setAyat] = useState(() => getDailyAyat());
  return (
    <>
      <DayHeader title="Аят дня" onRefresh={() => setAyat(getRandomAyat())} styles={styles} colors={colors} />
      <Card>
        <Text style={styles.arabic}>{ayat.ar}</Text>
        <Text style={styles.translit}>{ayat.tr}</Text>
        <Text style={styles.translation}>{ayat.ru}</Text>
        <ReferenceText text={ayat.ref} style={{ color: colors.accentDark, fontWeight: '600', fontSize: 14 }} />
      </Card>
    </>
  );
}

export function HadithOfDay({ onOpen }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [hadith, setHadith] = useState(() => getDailyHadith());
  return (
    <>
      <DayHeader title="Хадис дня" onRefresh={() => setHadith(getRandomHadith())} styles={styles} colors={colors} />
      <Card onPress={() => onOpen(hadith.id)}>
        <Pill label={hadith.theme} background={colors.primary + '15'} textColor={colors.primary} />
        <Text style={[styles.hadithTitle, { marginTop: spacing.sm }]}>{hadith.title}</Text>
        <Text style={styles.hadithText} numberOfLines={3}>{hadith.text}</Text>
        <ReferenceText text={hadith.source} style={styles.source} />
      </Card>
    </>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  dayTitle: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  refreshChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.primary + '15',
  },
  refreshText: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  arabic: { ...typography.arabic, color: colors.textPrimary, textAlign: 'right', marginBottom: spacing.sm },
  translit: { ...typography.small, color: colors.textMuted, fontStyle: 'italic', marginBottom: spacing.sm },
  translation: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.md, lineHeight: 24 },

  hadithTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  hadithText: { ...typography.small, color: colors.textSecondary, lineHeight: 20, marginBottom: 4 },
  source: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
