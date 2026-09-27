import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Pill from '../../components/Pill';
import BookmarkButton from '../../components/BookmarkButton';
import ReferenceText from '../../components/ReferenceText';
import { spacing, radii, typography } from '../../constants/theme';
import { arbainHadiths, findArbain } from '../../data/arbain';
import { useTheme } from '../../store/themeStore';

export default function ArbainDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const h = findArbain(route.params.n);
  if (!h) return null;
  const idx = arbainHadiths.findIndex((x) => x.n === h.n);
  const prev = idx > 0 ? arbainHadiths[idx - 1] : null;
  const next = idx < arbainHadiths.length - 1 ? arbainHadiths[idx + 1] : null;

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← К сборнику</Text>
          </TouchableOpacity>
          <BookmarkButton
            type="hadith"
            refId={`arbain_${h.n}`}
            title={`№${h.n} ${h.title}`}
            subtitle="40 хадисов ан-Навави"
            route="ArbainDetail"
            params={{ n: h.n }}
            color="#fff"
          />
        </View>
        <Text style={styles.num}>Хадис №{h.n} из 42</Text>
        <Text style={styles.title}>{h.title}</Text>
        <Text style={styles.narrator}>Передал: {h.narrator}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card>
          <Text style={styles.arabic}>{h.ar}</Text>
          <View style={styles.divider} />
          <ReferenceText text={h.ru} style={styles.translation} />
        </Card>

        <Text style={styles.sectionLabel}>Комментарий (по Ибн Раджабу)</Text>
        <Card>
          <ReferenceText text={h.comment} style={styles.comment} />
        </Card>

        <Text style={styles.sectionLabel}>Источник</Text>
        <Card>
          <ReferenceText text={h.source} style={styles.src} />
        </Card>

        {h.themes && h.themes.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Темы</Text>
            <View style={styles.themes}>
              {h.themes.map((t, i) => (
                <Pill key={i} label={t} background={colors.accent + '20'} textColor={colors.accentDark} />
              ))}
            </View>
          </>
        )}

        <View style={styles.nav}>
          <View style={{ flex: 1, marginRight: 4 }}>
            {prev && (
              <Button title={`← №${prev.n}`} variant="ghost" onPress={() => navigation.replace('ArbainDetail', { n: prev.n })} />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 4 }}>
            {next && (
              <Button title={`№${next.n} →`} variant="ghost" onPress={() => navigation.replace('ArbainDetail', { n: next.n })} />
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  back: { ...typography.bodyMedium, color: '#fff' },
  num: { ...typography.caption, color: colors.accentLight, fontWeight: '700', marginTop: 4 },
  title: { ...typography.h2, color: '#fff', marginTop: spacing.sm },
  narrator: { ...typography.small, color: '#fff', opacity: 0.85, marginTop: spacing.sm },

  arabic: { ...typography.arabic, color: colors.textPrimary, textAlign: 'right', writingDirection: 'rtl' },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  translation: { ...typography.body, color: colors.textPrimary, lineHeight: 26 },

  sectionLabel: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  comment: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },
  src: { ...typography.body, color: colors.primary, fontStyle: 'italic' },
  themes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  nav: { flexDirection: 'row', marginTop: spacing.xl },
});
