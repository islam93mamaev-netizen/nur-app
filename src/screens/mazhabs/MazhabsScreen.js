import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, radii, typography } from '../../constants/theme';
import { mazhabs, mazhabCategories, getComparisonsByCategory } from '../../data/mazhabs';
import { useTheme } from '../../store/themeStore';

export default function MazhabsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [tab, setTab] = useState('schools');  // 'schools' | 'compare'

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Мазхабы</Text>
        <Text style={styles.subtitle}>4 школы суннитского фикха и их сравнение</Text>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setTab('schools')}
          style={[styles.tab, tab === 'schools' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'schools' && styles.tabTextActive]}>🕌 Школы</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('compare')}
          style={[styles.tab, tab === 'compare' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'compare' && styles.tabTextActive]}>⚖️ Сравнение</Text>
        </TouchableOpacity>
      </View>

      {tab === 'schools' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '12' }}>
            <Text style={[styles.intro, { color: colors.accentDark }]}>
              Все 4 мазхаба — Ахль ас-Сунна валь-Джамаʿа. Разногласия — иджтихадные (не доктринальные).
              Все мнения имеют шариатские основания.
            </Text>
          </Card>

          {mazhabs.map((m) => (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('MazhabDetail', { id: m.id })}
            >
              <Card style={{ marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: m.color }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.schoolNameAr}>{m.nameAr}</Text>
                    <Text style={[styles.schoolName, { color: m.color }]}>{m.title}</Text>
                    <Pill label={m.founderYears} background={m.color + '15'} textColor={m.color} />
                    <Text style={styles.founder}>Имам: {m.founder}</Text>
                  </View>
                  <Text style={styles.chev}>›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Card style={{ marginBottom: spacing.md, backgroundColor: colors.info + '10' }}>
            <Text style={[styles.intro, { color: colors.info }]}>
              Сравнение позиций по практическим вопросам фикха. Выберите тему — увидите мнения всех 4 школ рядом.
            </Text>
          </Card>

          {mazhabCategories.map((c) => {
            const items = getComparisonsByCategory(c.id);
            return (
              <View key={c.id} style={{ marginBottom: spacing.lg }}>
                <View style={styles.catHeader}>
                  <Text style={styles.catIcon}>{c.icon}</Text>
                  <Text style={[styles.catTitle, { color: c.color }]}>{c.title}</Text>
                  <Text style={styles.catCount}>{items.length}</Text>
                </View>
                {items.map((q) => (
                  <TouchableOpacity
                    key={q.id}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('MazhabTopic', { id: q.id })}
                  >
                    <Card style={{ marginBottom: spacing.sm }}>
                      <Text style={styles.qText}>{q.question}</Text>
                      <View style={styles.miniRow}>
                        {q.positions.map((p, i) => {
                          const m = mazhabs.find((x) => x.id === p.mazhab);
                          return (
                            <View key={i} style={[styles.miniChip, { backgroundColor: m?.color + '15' }]}>
                              <Text style={[styles.miniChipText, { color: m?.color }]}>{m?.short}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  back: { ...typography.bodyMedium, color: '#fff', marginBottom: spacing.md },
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  tabsRow: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: radii.md, marginHorizontal: 2 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  intro: { ...typography.body, fontWeight: '500', lineHeight: 22 },

  schoolNameAr: { fontSize: 22, color: colors.primary, textAlign: 'right', marginBottom: 4 },
  schoolName: { ...typography.h3, fontWeight: '700' },
  founder: { ...typography.small, color: colors.textSecondary, marginTop: 6 },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },

  catHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  catIcon: { fontSize: 22, marginRight: spacing.sm },
  catTitle: { ...typography.h3, fontWeight: '700', flex: 1 },
  catCount: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },

  qText: { ...typography.body, color: colors.textPrimary, fontWeight: '500', marginBottom: spacing.sm },
  miniRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  miniChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.pill },
  miniChipText: { ...typography.caption, fontWeight: '700' },
});
