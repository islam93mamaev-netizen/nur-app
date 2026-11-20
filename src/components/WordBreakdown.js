import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { spacing, radii, typography } from '../constants/theme';
import { parseArabicWord } from '../utils/arabicParser';
import { speak } from '../services/ttsService';
import { useTheme } from '../store/themeStore';

// Цвета для разных форм буквы — чтобы новичку было нагляднее
const FORM_COLORS = {
  isolated: '#5A5A5A',
  initial: '#0F4C3A',
  medial: '#C9A55B',
  final: '#3D6E94',
};

export default function WordBreakdown({ word, transcription }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  if (!word) return null;
  const parsed = parseArabicWord(word);

  return (
    <View>
      {/* Транскрипция-слогами над словом */}
      <View style={styles.translitRow}>
        {parsed.map((p, i) => (
          <Text key={i} style={[styles.translitSyll, p.isSilent && styles.silent]}>
            {p.syllable || p.letterTr}
          </Text>
        ))}
      </View>
      {!!transcription && (
        <Text style={styles.fullTranslit}>{transcription}</Text>
      )}

      {/* Само слово крупно */}
      <Text style={styles.bigWord}>{word}</Text>

      {/* Разбор по буквам */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lettersScroll}>
        <View style={styles.lettersRow}>
          {parsed.map((p, i) => {
            const color = FORM_COLORS[p.form];
            return (
              <TouchableOpacity
                key={i}
                onPress={() => speak((p.letter + p.harakat) || p.letter, { rate: 0.5 })}
                style={[styles.letterCard, { borderColor: color }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.idx, { color }]}>{i + 1}</Text>
                <Text style={styles.visual}>{p.visual + (p.harakat || '')}</Text>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={[styles.form, { color }]}>{p.formLabel}</Text>
                {p.harakatNames.length > 0 && (
                  <Text style={styles.harakat}>{p.harakatNames.join(' + ')}</Text>
                )}
                <View style={[styles.syllBox, { backgroundColor: color + '15' }]}>
                  <Text style={[styles.syll, { color }]}>
                    {p.syllable || p.letterTr || '·'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Легенда форм */}
      <View style={styles.legend}>
        {Object.entries(FORM_COLORS).map(([form, c]) => {
          const labels = { isolated: 'отдельно', initial: 'начало', medial: 'середина', final: 'конец' };
          return (
            <View key={form} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c }]} />
              <Text style={styles.legendText}>{labels[form]}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.hint}>
        Нажмите на букву, чтобы прослушать её. Цвет показывает положение буквы в слове.
      </Text>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  translitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  translitSyll: {
    ...typography.small,
    color: colors.textSecondary,
    marginHorizontal: 2,
    fontStyle: 'italic',
  },
  silent: { color: colors.textMuted, opacity: 0.6 },
  fullTranslit: {
    ...typography.body,
    color: colors.accentDark,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  bigWord: {
    fontSize: 56,
    color: colors.textPrimary,
    textAlign: 'center',
    marginVertical: spacing.md,
    writingDirection: 'rtl',
  },

  lettersScroll: { marginTop: spacing.md },
  lettersRow: {
    flexDirection: 'row-reverse', // arabic читается справа налево
    paddingHorizontal: 4,
  },
  letterCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    padding: spacing.sm,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 96,
    minHeight: 140,
  },
  idx: { ...typography.caption, fontWeight: '700', alignSelf: 'flex-start' },
  visual: { fontSize: 36, color: colors.textPrimary, marginVertical: 4 },
  name: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },
  form: { fontSize: 10, marginTop: 2 },
  harakat: { fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  syllBox: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  syll: { ...typography.bodyMedium, fontWeight: '700' },

  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 6, marginBottom: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  legendText: { fontSize: 11, color: colors.textSecondary },

  hint: {
    ...typography.small,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
