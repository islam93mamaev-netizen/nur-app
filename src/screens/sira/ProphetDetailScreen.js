import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Pill from '../../components/Pill';
import { spacing, typography } from '../../constants/theme';
import { prophets, findProphet } from '../../data/prophets';
import ReferenceText from '../../components/ReferenceText';
import BookmarkButton from '../../components/BookmarkButton';
import { useTheme } from '../../store/themeStore';
import IconText from '../../components/IconText';

export default function ProphetDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const p = findProphet(route.params.id);
  if (!p) return null;
  const idx = prophets.findIndex((x) => x.id === p.id);
  const prev = idx > 0 ? prophets[idx - 1] : null;
  const next = idx < prophets.length - 1 ? prophets[idx + 1] : null;

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} backLabel="← К пророкам" pattern>
        <View style={styles.headerTop}>
          
          <BookmarkButton
            type="prophet"
            refId={p.id}
            title={`${p.name} (${p.nameAr})`}
            subtitle={p.period}
            route="ProphetDetail"
            params={{ id: p.id }}
            color="#fff"
          />
        </View>
        <Text style={styles.num}>№ {p.n} из 25</Text>
        <Text style={styles.bigAr}>{p.nameAr}</Text>
        <Text style={styles.name}>{p.name}</Text>
        <Pill label={p.period} background="#fff" textColor={colors.primary} />
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '12' }}>
          <Text style={[styles.label, { color: colors.accentDark }]}>Кратко</Text>
          <Text style={styles.brief}>{p.brief}</Text>
        </Card>

        <Text style={styles.sectionLabel}>История</Text>
        <Card>
          <ReferenceText text={p.story} style={styles.content} />
        </Card>

        {p.ayats && (
          <Card style={{ marginTop: spacing.md, backgroundColor: colors.info + '10' }}>
            <IconText icon="book" style={[styles.label, { color: colors.info }]}>Аяты Корана о нём</IconText>
            <ReferenceText text={p.ayats} style={styles.ayats} />
          </Card>
        )}

        <View style={styles.nav}>
          <View style={{ flex: 1, marginRight: 4 }}>
            {prev && (
              <Button title={`← ${prev.name}`} variant="ghost" onPress={() => navigation.replace('ProphetDetail', { id: prev.id })} />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 4 }}>
            {next && (
              <Button title={`${next.name} →`} variant="ghost" onPress={() => navigation.replace('ProphetDetail', { id: next.id })} />
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch', marginBottom: spacing.md },
  num: { ...typography.caption, color: colors.accentLight, fontWeight: '700' },
  bigAr: { fontSize: 48, color: '#fff', marginVertical: spacing.sm },
  name: { ...typography.h2, color: '#fff', marginBottom: spacing.sm },
  label: { ...typography.caption, fontWeight: '700', marginBottom: 4 },
  brief: { ...typography.body, color: colors.textPrimary, lineHeight: 22, fontWeight: '500' },
  sectionLabel: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  content: { ...typography.body, color: colors.textPrimary, lineHeight: 26 },
  ayats: { ...typography.body, color: colors.info, fontStyle: 'italic' },
  nav: { flexDirection: 'row', marginTop: spacing.xl },
});
