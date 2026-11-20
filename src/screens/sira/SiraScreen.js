import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import SectionTestsBlock from '../../components/SectionTestsBlock';
import { spacing, radii, typography } from '../../constants/theme';
import { siraChapters } from '../../data/sira';
import { prophets } from '../../data/prophets';
import { useTheme } from '../../store/themeStore';

export default function SiraScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [tab, setTab] = useState('sira');

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>Сира и пророки</Text>
        <Text style={styles.subtitle}>
          Жизнеописание Мухаммада ﷺ и истории 25 пророков
        </Text>
      </DetailHeader>

      <View style={styles.tabsRow}>
        <TouchableOpacity onPress={() => setTab('sira')} style={[styles.tab, tab === 'sira' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'sira' && styles.tabTextActive]}>🌹 Сира пророка ﷺ</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('prophets')} style={[styles.tab, tab === 'prophets' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'prophets' && styles.tabTextActive]}>📜 25 пророков</Text>
        </TouchableOpacity>
      </View>

      {tab === 'sira' ? (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          {siraChapters.map((c) => (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('SiraChapter', { id: c.id })}
            >
              <Card style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={{ fontSize: 24 }}>{c.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chTitle}>{c.n}. {c.title}</Text>
                    <Text style={styles.chPeriod}>{c.period}</Text>
                  </View>
                  <Text style={styles.chev}>›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
          <SectionTestsBlock
            examIds={['sira_beginner', 'sira_intermediate', 'sira_advanced']}
            navigation={navigation}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={prophets}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ProphetDetail', { id: item.id })}
              style={styles.pCard}
            >
              <Text style={styles.pNum}>{item.n}</Text>
              <Text style={styles.pAr}>{item.nameAr}</Text>
              <Text style={styles.pName}>{item.name}</Text>
              <Text style={styles.pPeriod}>{item.period}</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={() => (
            <View style={{ padding: spacing.md }}>
              <SectionTestsBlock
                examIds={['prophets_beginner', 'prophets_intermediate', 'prophets_advanced']}
                navigation={navigation}
              />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  tabsRow: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: radii.md, marginHorizontal: 2 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  iconBox: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  chTitle: { ...typography.h4, color: colors.textPrimary },
  chPeriod: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },

  pCard: {
    flex: 1,
    margin: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 130,
  },
  pNum: { ...typography.caption, color: colors.textMuted, fontWeight: '700', alignSelf: 'flex-start' },
  pAr: { fontSize: 26, color: colors.primary, marginVertical: 4 },
  pName: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' },
  pPeriod: { ...typography.caption, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
});
