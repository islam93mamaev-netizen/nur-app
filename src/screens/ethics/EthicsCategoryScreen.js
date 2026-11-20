import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import CategoryIcon from '../../components/CategoryIcon';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import { spacing, typography } from '../../constants/theme';
import { findCategory, getArticlesByCategory } from '../../data/ethics';
import { useTheme } from '../../store/themeStore';

export default function EthicsCategoryScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const cat = findCategory(route.params.categoryId);
  if (!cat) return null;
  const articles = getArticlesByCategory(cat.id);

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} background={cat.color}>
        
        <CategoryIcon icon={cat.icon} size={44} color="#fff" style={{ marginBottom: spacing.sm }} />
        <Text style={styles.title}>{cat.title}</Text>
        <Text style={styles.count}>{articles.length} тем для изучения</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {articles.map((a, i) => (
          <TouchableOpacity
            key={a.id}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EthicsArticle', { articleId: a.id })}
          >
            <Card style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={[styles.numBox, { backgroundColor: cat.color + '15' }]}>
                  <Text style={[styles.num, { color: cat.color }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aTitle}>{a.title}</Text>
                  <Text style={styles.aSummary} numberOfLines={2}>{a.summary}</Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff', textAlign: 'center' },
  count: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  numBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  num: { ...typography.h4, fontWeight: '700' },
  aTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  aSummary: { ...typography.small, color: colors.textSecondary, lineHeight: 18 },
  chev: { fontSize: 28, color: colors.textMuted, alignSelf: 'center' },
});
