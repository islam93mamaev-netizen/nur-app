import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { spacing, typography } from '../../constants/theme';
import { siraChapters, findSiraChapter } from '../../data/sira';
import ReferenceText from '../../components/ReferenceText';
import BookmarkButton from '../../components/BookmarkButton';
import { useTheme } from '../../store/themeStore';

export default function SiraChapterScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const ch = findSiraChapter(route.params.id);
  if (!ch) return null;
  const idx = siraChapters.findIndex((c) => c.id === ch.id);
  const prev = idx > 0 ? siraChapters[idx - 1] : null;
  const next = idx < siraChapters.length - 1 ? siraChapters[idx + 1] : null;

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} backLabel="← К содержанию" pattern>
        <View style={styles.headerTop}>
          
          <BookmarkButton
            type="sira"
            refId={ch.id}
            title={ch.title}
            subtitle={ch.period}
            route="SiraChapter"
            params={{ id: ch.id }}
            color="#fff"
          />
        </View>
        <Text style={styles.icon}>{ch.icon}</Text>
        <Text style={styles.num}>Глава {ch.n}</Text>
        <Text style={styles.title}>{ch.title}</Text>
        <Text style={styles.period}>{ch.period}</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card>
          <ReferenceText text={ch.content} style={styles.content} />
        </Card>

        <View style={styles.nav}>
          <View style={{ flex: 1, marginRight: 4 }}>
            {prev && (
              <Button title={`← ${prev.title}`} variant="ghost" onPress={() => navigation.replace('SiraChapter', { id: prev.id })} />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 4 }}>
            {next && (
              <Button title={`${next.title} →`} variant="ghost" onPress={() => navigation.replace('SiraChapter', { id: next.id })} />
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch', marginBottom: spacing.md },
  icon: { fontSize: 44, marginBottom: spacing.sm },
  num: { ...typography.caption, color: colors.accentLight, fontWeight: '700' },
  title: { ...typography.h1, color: '#fff', marginTop: 4, textAlign: 'center' },
  period: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },
  content: { ...typography.body, color: colors.textPrimary, lineHeight: 26 },
  nav: { flexDirection: 'row', marginTop: spacing.xl },
});
