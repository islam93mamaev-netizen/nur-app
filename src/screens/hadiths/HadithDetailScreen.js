import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, typography } from '../../constants/theme';
import { hadiths } from '../../data/hadiths';
import ReferenceText from '../../components/ReferenceText';
import BookmarkButton from '../../components/BookmarkButton';
import { useTheme } from '../../store/themeStore';

export default function HadithDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // Масштаб шрифта применяется глобально через monkey-patch Text.render в App.js —
  // здесь ничего домножать не нужно.
  const hadith = hadiths.find((h) => h.id === route.params.hadithId);
  if (!hadith) return null;

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Назад</Text>
          </TouchableOpacity>
          <BookmarkButton
            type="hadith"
            refId={hadith.id}
            title={hadith.title}
            subtitle={hadith.theme}
            route="HadithDetail"
            params={{ hadithId: hadith.id }}
            color="#fff"
          />
        </View>
        <Pill label={`Хадис №${hadith.number}`} background="#fff" textColor={colors.primary} />
        <Text style={styles.title}>{hadith.title}</Text>
        <Text style={styles.narrator}>Передал: {hadith.narrator}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card>
          <Text style={styles.arabic}>
            {hadith.arabic}
          </Text>
          <View style={styles.divider} />
          <ReferenceText
            text={hadith.text}
            style={styles.text}
          />
        </Card>

        <Text style={styles.sectionLabel}>Пояснение</Text>
        <Card>
          <ReferenceText
            text={hadith.explanation}
            style={styles.explanation}
          />
        </Card>

        <Text style={styles.sectionLabel}>Источник (нажмите чтобы открыть)</Text>
        <Card>
          <ReferenceText text={hadith.source} style={styles.source} />
        </Card>

        <View style={{ marginTop: spacing.lg, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pill label={hadith.theme} background={colors.accent + '20'} textColor={colors.accentDark} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  back: { ...typography.bodyMedium, color: '#fff' },
  title: { ...typography.h2, color: '#fff', marginTop: spacing.md },
  narrator: { ...typography.small, color: '#fff', opacity: 0.8, marginTop: spacing.sm },

  arabic: {
    ...typography.arabic,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  text: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },

  sectionLabel: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  explanation: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },
  source: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic' },
});
