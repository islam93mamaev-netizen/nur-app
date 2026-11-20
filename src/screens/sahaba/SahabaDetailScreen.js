import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import BookmarkButton from '../../components/BookmarkButton';
import ReferenceText from '../../components/ReferenceText';
import { spacing, typography } from '../../constants/theme';
import { findSahaba, sahabaGroups } from '../../data/sahaba';
import { useTheme } from '../../store/themeStore';
import IconText from '../../components/IconText';

export default function SahabaDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const p = findSahaba(route.params.id);
  if (!p) return null;
  const g = sahabaGroups.find((x) => x.id === p.group);

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} backLabel="← К сахабам" background={g?.color || colors.primary}>
        <View style={styles.headerTop}>
          
          <BookmarkButton
            type="sahaba"
            refId={p.id}
            title={`${p.name} (${p.nameAr})`}
            subtitle={p.period}
            route="SahabaDetail"
            params={{ id: p.id }}
            color="#fff"
          />
        </View>
        <Text style={styles.nameAr}>{p.nameAr}</Text>
        <Text style={styles.name}>{p.name}</Text>
        <Pill label={p.period} background="#fff" textColor={g?.color || colors.primary} />
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '12' }}>
          <Text style={[styles.label, { color: colors.accentDark }]}>Кратко</Text>
          <Text style={styles.brief}>{p.brief}</Text>
        </Card>

        <Text style={styles.sectionLabel}>Биография</Text>
        <Card>
          <ReferenceText text={p.story} style={styles.body} />
        </Card>

        {p.virtue && (
          <Card style={{ marginTop: spacing.md, backgroundColor: colors.success + '10' }}>
            <IconText icon="star" style={[styles.label, { color: colors.success }]}>Достоинство</IconText>
            <ReferenceText text={p.virtue} style={styles.body} />
          </Card>
        )}

        {p.death && (
          <Card style={{ marginTop: spacing.md, backgroundColor: colors.info + '10' }}>
            <Text style={[styles.label, { color: colors.info }]}>Кончина</Text>
            <ReferenceText text={p.death} style={styles.body} />
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch', marginBottom: spacing.md },
  nameAr: { fontSize: 36, color: '#fff', marginVertical: spacing.sm },
  name: { ...typography.h2, color: '#fff', marginBottom: spacing.sm },

  label: { ...typography.caption, fontWeight: '700', marginBottom: 4 },
  brief: { ...typography.body, color: colors.textPrimary, lineHeight: 22, fontWeight: '500' },
  sectionLabel: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textPrimary, lineHeight: 26 },
});
