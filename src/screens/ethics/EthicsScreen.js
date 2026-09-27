import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import SectionTestsBlock from '../../components/SectionTestsBlock';
import { spacing, radii, typography } from '../../constants/theme';
import {
  ethicsSections, ethicsCategories, getCategoriesBySection, getArticlesByCategory,
} from '../../data/ethics';
import { useTheme } from '../../store/themeStore';

export default function EthicsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [section, setSection] = useState('rights');
  const cats = getCategoriesBySection(section);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Этика и права</Text>
        <Text style={styles.subtitle}>Как должен жить мусульманин</Text>
      </View>

      {/* Переключатель разделов */}
      <View style={styles.tabsRow}>
        {ethicsSections.map((s) => {
          const active = s.id === section;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSection(s.id)}
              style={[styles.tab, active && { backgroundColor: s.color }]}
            >
              <Text style={styles.tabIcon}>{s.icon}</Text>
              <Text style={[styles.tabTitle, active && { color: '#fff' }]}>
                {s.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Text style={styles.sectionIntro}>
          {ethicsSections.find((s) => s.id === section)?.description}
        </Text>

        {cats.map((cat) => {
          const articles = getArticlesByCategory(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('EthicsCategory', { categoryId: cat.id })}
            >
              <Card style={[styles.catCard, { borderLeftWidth: 4, borderLeftColor: cat.color }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.iconBox, { backgroundColor: cat.color + '15' }]}>
                    <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catTitle}>{cat.title}</Text>
                    <Text style={styles.catCount}>
                      {articles.length} {pluralize(articles.length, ['тема', 'темы', 'тем'])}
                    </Text>
                  </View>
                  <Text style={styles.chev}>›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        <SectionTestsBlock
          examIds={
            section === 'rights'
              ? ['rights_basic', 'ethics_basic', 'ethics_advanced']
              : ['ethics_basic', 'ethics_advanced', 'rights_basic']
          }
          navigation={navigation}
        />
      </ScrollView>
    </Screen>
  );
}

function pluralize(n, forms) {
  const r = n % 10, rr = n % 100;
  if (rr >= 11 && rr <= 14) return forms[2];
  if (r === 1) return forms[0];
  if (r >= 2 && r <= 4) return forms[1];
  return forms[2];
}

const makeStyles = (colors) => StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  back: { ...typography.bodyMedium, color: '#fff', marginBottom: spacing.md },
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  tabsRow: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: radii.md, flexDirection: 'row', justifyContent: 'center', marginHorizontal: 2 },
  tabIcon: { fontSize: 20, marginRight: 6 },
  tabTitle: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' },

  sectionIntro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },

  catCard: { marginBottom: spacing.md },
  iconBox: {
    width: 56, height: 56, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  catTitle: { ...typography.h4, color: colors.textPrimary },
  catCount: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },
});
