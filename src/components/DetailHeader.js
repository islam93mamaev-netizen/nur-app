// DetailHeader — переиспользуемая шапка детального экрана.
// Содержит кнопку «Назад», опциональную BookmarkButton и слот для контента.
//
// Использование:
//   <DetailHeader
//     onBack={() => navigation.goBack()}
//     backLabel="← Назад"
//     bookmark={{
//       type: 'hadith', refId: id, title, subtitle, route: 'HadithDetail', params: { hadithId: id }
//     }}
//     background={cat?.color}  // опционально — цвет фона шапки (по умолчанию colors.primary)
//   >
//     {/* Любой контент в шапке */}
//     <Text style={...}>{title}</Text>
//   </DetailHeader>

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BookmarkButton from './BookmarkButton';
import { spacing, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';

export default function DetailHeader({
  onBack,
  backLabel = '← Назад',
  bookmark,
  background,
  align = 'flex-start',  // 'flex-start' | 'center'
  children,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const bg = background || colors.primary;

  return (
    <View style={[styles.header, { backgroundColor: bg, alignItems: align }]}>
      <View style={styles.top}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.back}>{backLabel}</Text>
        </TouchableOpacity>
        {bookmark && (
          <BookmarkButton
            type={bookmark.type}
            refId={bookmark.refId}
            title={bookmark.title}
            subtitle={bookmark.subtitle}
            route={bookmark.route}
            params={bookmark.params}
            color="#fff"
          />
        )}
      </View>
      {children}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  back: { ...typography.bodyMedium, color: '#fff' },
});
