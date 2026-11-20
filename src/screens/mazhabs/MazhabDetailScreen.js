import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import BookmarkButton from '../../components/BookmarkButton';
import ReferenceText from '../../components/ReferenceText';
import { spacing, typography } from '../../constants/theme';
import { findMazhab } from '../../data/mazhabs';
import { useTheme } from '../../store/themeStore';

export default function MazhabDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const m = findMazhab(route.params.id);
  if (!m) return null;

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} backLabel="← К мазхабам" background={m.color}>
        <View style={styles.headerTop}>
          
          <BookmarkButton
            type="mazhab"
            refId={m.id}
            title={m.title}
            subtitle={m.founderYears}
            route="MazhabDetail"
            params={{ id: m.id }}
            color="#fff"
          />
        </View>
        <Text style={styles.nameAr}>{m.nameAr}</Text>
        <Text style={styles.title}>{m.title}</Text>
        <Pill label={m.founderYears} background="#fff" textColor={m.color} />
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '12' }}>
          <Text style={[styles.label, { color: colors.accentDark }]}>Основатель</Text>
          <Text style={styles.brief}>{m.founder}</Text>
          <Text style={[styles.body, { marginTop: 4 }]}>{m.founderYears}</Text>
        </Card>

        <Text style={styles.sectionLabel}>Методология (усуль)</Text>
        <Card>
          <ReferenceText text={m.method} style={styles.body} />
        </Card>

        <Text style={styles.sectionLabel}>Регионы распространения</Text>
        <Card style={{ backgroundColor: colors.info + '10' }}>
          <ReferenceText text={m.regions} style={styles.body} />
        </Card>

        <Text style={styles.sectionLabel}>Главные ученики</Text>
        <Card>
          <ReferenceText text={m.students} style={styles.body} />
        </Card>

        <Text style={styles.sectionLabel}>Классические книги мазхаба</Text>
        <Card>
          <ReferenceText text={m.classic} style={styles.body} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch', marginBottom: spacing.md },
  nameAr: { fontSize: 32, color: '#fff', marginVertical: spacing.sm },
  title: { ...typography.h2, color: '#fff', marginBottom: spacing.sm },

  label: { ...typography.caption, fontWeight: '700', marginBottom: 4 },
  brief: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  sectionLabel: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },
});
