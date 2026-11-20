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
import PatternBackground from './PatternBackground';
import { spacing, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';

export default function DetailHeader({
  onBack,
  backLabel = '← Назад',
  title,          // готовый заголовок (вместо children для типового случая)
  subtitle,       // подзаголовок под ним
  bookmark,
  background,
  pattern = false, // геометрический орнамент поверх фона (как на Пути/Рамадане)
  align = 'flex-start',  // 'flex-start' | 'center'
  children,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const bg = background || colors.primary;

  return (
    <View style={[styles.header, { backgroundColor: bg, alignItems: align }, pattern && { overflow: 'hidden' }]}>
      {pattern && <PatternBackground from={bg} to={colors.primaryDark} />}
      <View style={styles.top}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Назад"
        >
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
      {title != null && <Text style={[styles.title, align === 'center' && { textAlign: 'center' }]}>{title}</Text>}
      {subtitle != null && <Text style={[styles.subtitle, align === 'center' && { textAlign: 'center' }]}>{subtitle}</Text>}
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
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.small, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 20 },
});
