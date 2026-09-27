import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import { spacing, radii, typography } from '../../constants/theme';
import { duaCategories, getDuasByCategory } from '../../data/duas';
import ReferenceText from '../../components/ReferenceText';
import { speak, stop } from '../../services/ttsService';
import BookmarkButton from '../../components/BookmarkButton';
import { useTheme } from '../../store/themeStore';

export default function DuaCategoryScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const cat = duaCategories.find((c) => c.id === route.params.categoryId);
  const list = getDuasByCategory(route.params.categoryId);

  useEffect(() => () => { stop(); }, []);

  if (!cat) return null;

  return (
    <Screen padded={false}>
      <View style={[styles.header, { backgroundColor: cat.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
          <Text style={styles.back}>← К дуа</Text>
        </TouchableOpacity>
        <Text style={styles.icon}>{cat.icon}</Text>
        <Text style={styles.title}>{cat.title}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {list.map((d, i) => (
          <Card key={d.id} style={{ marginBottom: spacing.md }}>
            <View style={styles.duaHeader}>
              <View style={[styles.num, { backgroundColor: cat.color + '15' }]}>
                <Text style={[styles.numText, { color: cat.color }]}>{i + 1}</Text>
              </View>
              <Text style={styles.duaTitle}>{d.title}</Text>
              <BookmarkButton
                type="dua"
                refId={d.id}
                title={d.title}
                subtitle={cat.title}
                route="DuaCategory"
                params={{ categoryId: cat.id }}
                color={cat.color}
              />
              <TouchableOpacity onPress={() => speak(d.ar, { rate: 0.5 })} style={[styles.playBtn, { borderColor: cat.color, marginLeft: 8 }]}>
                <Text style={{ color: cat.color, fontWeight: '700' }}>🔊</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.ar}>{d.ar}</Text>
            <Text style={styles.tr}>{d.tr}</Text>
            <View style={styles.divider} />
            <Text style={styles.ru}>{d.ru}</Text>

            {d.ctx ? (
              <View style={[styles.ctxBox, { borderLeftColor: cat.color }]}>
                <Text style={styles.ctx}>💡 {d.ctx}</Text>
              </View>
            ) : null}

            {d.refs ? (
              <View style={styles.refsBox}>
                <Text style={styles.refsLabel}>📚 Источник:</Text>
                <ReferenceText text={d.refs} style={styles.refs} />
              </View>
            ) : null}
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.xl, alignItems: 'center' },
  back: { ...typography.bodyMedium, color: '#fff', alignSelf: 'flex-start' },
  icon: { fontSize: 44, marginBottom: spacing.sm },
  title: { ...typography.h1, color: '#fff', textAlign: 'center' },

  duaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  numText: { ...typography.caption, fontWeight: '700' },
  duaTitle: { ...typography.h4, color: colors.textPrimary, flex: 1 },
  playBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },

  ar: { fontSize: 26, color: colors.textPrimary, textAlign: 'right', writingDirection: 'rtl', lineHeight: 44 },
  tr: { ...typography.small, color: colors.textSecondary, fontStyle: 'italic', marginTop: 6 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  ru: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },

  ctxBox: { marginTop: spacing.sm, paddingLeft: spacing.md, paddingVertical: 4, borderLeftWidth: 3 },
  ctx: { ...typography.small, color: colors.textPrimary, lineHeight: 18 },

  refsBox: { marginTop: spacing.sm, padding: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radii.sm },
  refsLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700', marginBottom: 2 },
  refs: { ...typography.caption, color: colors.textPrimary },
});
