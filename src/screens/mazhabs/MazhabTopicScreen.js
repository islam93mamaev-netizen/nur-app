import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import BookmarkButton from '../../components/BookmarkButton';
import ReferenceText from '../../components/ReferenceText';
import { spacing, radii, typography } from '../../constants/theme';
import { findComparison, mazhabs, mazhabCategories } from '../../data/mazhabs';
import { useTheme } from '../../store/themeStore';

export default function MazhabTopicScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const q = findComparison(route.params.id);
  if (!q) return null;
  const cat = mazhabCategories.find((c) => c.id === q.category);

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} backLabel="← К сравнению" background={cat?.color || colors.primary}>
        <View style={styles.headerTop}>
          
          <BookmarkButton
            type="mazhab"
            refId={`topic_${q.id}`}
            title={q.question}
            subtitle={cat?.title}
            route="MazhabTopic"
            params={{ id: q.id }}
            color="#fff"
          />
        </View>
        <Pill label={`${cat?.icon || ''} ${cat?.title || ''}`} background="#fff" textColor={cat?.color || colors.primary} />
        <Text style={styles.title}>{q.question}</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {!!q.context && (
          <Card style={{ marginBottom: spacing.md, backgroundColor: colors.info + '10' }}>
            <Text style={[styles.label, { color: colors.info }]}>📜 Контекст</Text>
            <ReferenceText text={q.context} style={styles.body} />
          </Card>
        )}

        <Text style={styles.sectionLabel}>Мнения 4 мазхабов</Text>

        {q.positions.map((p, i) => {
          const m = mazhabs.find((x) => x.id === p.mazhab);
          if (!m) return null;
          return (
            <Card key={i} style={{ marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: m.color }}>
              <View style={styles.posHeader}>
                <View style={[styles.mazhabChip, { backgroundColor: m.color }]}>
                  <Text style={styles.mazhabChipText}>{m.short}</Text>
                </View>
                <Text style={[styles.ruling, { color: m.color }]}>{p.ruling}</Text>
              </View>
              <ReferenceText text={p.detail} style={styles.detail} />
            </Card>
          );
        })}

        {!!q.note && (
          <Card style={{ marginTop: spacing.md, backgroundColor: colors.warning + '12' }}>
            <Text style={[styles.label, { color: colors.warning }]}>📝 Примечание</Text>
            <ReferenceText text={q.note} style={styles.body} />
          </Card>
        )}

        <Card style={{ marginTop: spacing.md, backgroundColor: colors.accent + '12' }}>
          <Text style={[styles.label, { color: colors.accentDark }]}>💡 Как пользоваться</Text>
          <Text style={styles.body}>
            Все 4 мнения — иджтихад признанных учёных и имеют шариатские основания.
            Если вы следуете определённому мазхабу — придерживайтесь его позиции в практике.
            Если изучаете тему — полезно знать всю палитру мнений; это снимает фанатизм и расширяет понимание.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.h3, color: '#fff', marginTop: spacing.md, lineHeight: 28 },

  label: { ...typography.caption, fontWeight: '700', marginBottom: 4 },
  body: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },

  sectionLabel: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.sm, marginBottom: spacing.md },

  posHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  mazhabChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.pill, marginRight: spacing.sm },
  mazhabChipText: { ...typography.caption, color: '#fff', fontWeight: '700' },
  ruling: { ...typography.h4, fontWeight: '700', flex: 1 },
  detail: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
});
