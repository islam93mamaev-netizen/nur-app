import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, typography } from '../../constants/theme';
import { findArticle, findCategory } from '../../data/ethics';
import ReferenceText from '../../components/ReferenceText';
import BookmarkButton from '../../components/BookmarkButton';
import { useTheme } from '../../store/themeStore';
import IconText from '../../components/IconText';

export default function EthicsArticleScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const article = findArticle(route.params.articleId);
  if (!article) return null;
  const cat = findCategory(article.category);

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} background={cat?.color || colors.primary}>
        <View style={styles.headerTop}>
          
          <BookmarkButton
            type="ethics"
            refId={article.id}
            title={article.title}
            subtitle={cat?.title}
            route="EthicsArticle"
            params={{ articleId: article.id }}
            color="#fff"
          />
        </View>
        <Pill label={cat?.title || ''} background="#fff" textColor={cat?.color || colors.primary} />
        <Text style={styles.title}>{article.title}</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '12' }}>
          <Text style={[styles.label, { color: colors.accentDark }]}>Кратко</Text>
          <Text style={styles.summary}>{article.summary}</Text>
        </Card>

        <Text style={styles.sectionLabel}>Подробно</Text>
        <Card>
          <ReferenceText text={article.content} style={styles.content} />
        </Card>

        {!!article.refs && (
          <Card style={{ marginTop: spacing.md, backgroundColor: colors.info + '10' }}>
            <IconText icon="book" style={[styles.label, { color: colors.info }]}>Источники (нажмите чтобы открыть)</IconText>
            <ReferenceText text={article.refs} style={styles.refs} />
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.h2, color: '#fff', marginTop: spacing.md, lineHeight: 30 },

  label: { ...typography.caption, fontWeight: '700', marginBottom: 4 },
  summary: { ...typography.body, color: colors.textPrimary, lineHeight: 22, fontWeight: '500' },
  sectionLabel: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.sm },
  content: { ...typography.body, color: colors.textPrimary, lineHeight: 26 },
  refs: { ...typography.body, color: colors.info, fontStyle: 'italic' },
});
