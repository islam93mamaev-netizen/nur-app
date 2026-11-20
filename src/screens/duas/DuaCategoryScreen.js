import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import CategoryIcon from '../../components/CategoryIcon';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import { spacing, radii, typography } from '../../constants/theme';
import { duaCategories, getDuasByCategory } from '../../data/duas';
import ReferenceText from '../../components/ReferenceText';
import BookmarkButton from '../../components/BookmarkButton';
import { useTheme } from '../../store/themeStore';
import useAdhkarPlayer from '../../hooks/useAdhkarPlayer';
import IconText from '../../components/IconText';

export default function DuaCategoryScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const cat = duaCategories.find((c) => c.id === route.params.categoryId);
  const list = getDuasByCategory(route.params.categoryId);
  // Тот же плеер, что в азкарах: пауза/возобновление, чтение по кускам,
  // проверка арабского голоса, автостоп при уходе с экрана
  const { playState, getStatus, togglePlay, resetPlay, stopAll } = useAdhkarPlayer();

  if (!cat) return null;

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => { stopAll(); navigation.goBack(); }} backLabel="← К дуа" background={cat.color}>
        
        <CategoryIcon icon={cat.icon} size={44} color="#fff" style={{ marginBottom: spacing.sm }} />
        <Text style={styles.title}>{cat.title}</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {list.map((d, i) => {
          const status = getStatus(d.id);
          const isPlaying = status === 'playing';
          const isPaused = status === 'paused';
          const cur = playState[d.id];
          const progress = cur && cur.chunks?.length > 1
            ? `${cur.idx + (isPlaying ? 1 : 0)}/${cur.chunks.length}`
            : null;
          return (
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
              {(isPlaying || isPaused) && (
                <TouchableOpacity
                  onPress={() => resetPlay(d)}
                  style={[styles.playBtn, { borderColor: cat.color, marginLeft: 8 }]}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="Сначала"
                >
                  <Text style={{ color: cat.color, fontSize: 18, fontWeight: '700' }}>⟲</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => togglePlay(d)}
                style={[
                  styles.playBtn,
                  { borderColor: cat.color, marginLeft: 8 },
                  isPlaying && { backgroundColor: cat.color + '30' },
                  isPaused && { backgroundColor: cat.color + '15' },
                ]}
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? 'Пауза' : 'Слушать'}
              >
                <Icon name={isPlaying ? 'pause' : 'play'} size={14} color={cat.color} />
              </TouchableOpacity>
            </View>

            {(isPlaying || isPaused) && progress && (
              <Text style={[styles.progress, { color: cat.color }]}>
                {isPaused ? 'на паузе' : 'воспроизводится'} · фрагмент {progress}
              </Text>
            )}

            <Text style={styles.ar}>{d.ar}</Text>
            <Text style={styles.tr}>{d.tr}</Text>
            <View style={styles.divider} />
            <Text style={styles.ru}>{d.ru}</Text>

            {d.ctx ? (
              <View style={[styles.ctxBox, { borderLeftColor: cat.color }]}>
                <IconText icon="bulb" style={styles.ctx}>{d.ctx}</IconText>
              </View>
            ) : null}

            {d.refs ? (
              <View style={styles.refsBox}>
                <IconText icon="book" style={styles.refsLabel}>Источник:</IconText>
                <ReferenceText text={d.refs} style={styles.refs} />
              </View>
            ) : null}
          </Card>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff', textAlign: 'center' },

  duaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  numText: { ...typography.caption, fontWeight: '700' },
  duaTitle: { ...typography.h4, color: colors.textPrimary, flex: 1 },
  playBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  progress: { ...typography.caption, fontWeight: '700', marginBottom: spacing.sm },

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
