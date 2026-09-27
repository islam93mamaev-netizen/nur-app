import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useProgress } from '../store/progressStore';
import { spacing, radii, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';

/**
 * BookmarkButton — переключатель закладки.
 * Props:
 *  - type: тип объекта ('hadith' | 'faq' | 'asma' | 'ethics' | 'sira' | 'prophet' | 'dua' | 'lesson' | 'ayat')
 *  - refId: уникальный id объекта
 *  - title: название для отображения в списке закладок
 *  - subtitle: подзаголовок
 *  - route: имя маршрута навигации
 *  - params: параметры маршрута
 *  - variant: 'icon' (только иконка) | 'pill' (иконка + текст)
 *  - color: цвет акцента (по умолчанию accentDark)
 */
export default function BookmarkButton({
  type,
  refId,
  title,
  subtitle,
  route,
  params,
  variant = 'icon',
  color,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { isBookmarked, toggleBookmark } = useProgress();
  const active = isBookmarked(type, refId);
  const accent = color || colors.accentDark;

  const onPress = () => {
    toggleBookmark({ type, refId, title, subtitle, route, params });
  };

  if (variant === 'pill') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.pill, { borderColor: accent, backgroundColor: active ? accent + '20' : 'transparent' }]}
      >
        <Text style={[styles.icon, { color: accent }]}>{active ? '★' : '☆'}</Text>
        <Text style={[styles.pillText, { color: accent }]}>
          {active ? 'В закладках' : 'В закладки'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.iconBox} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Text style={[styles.iconBig, { color: accent }]}>{active ? '★' : '☆'}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  iconBox: {
    padding: 4,
  },
  iconBig: {
    fontSize: 26,
    lineHeight: 28,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 18,
    marginRight: 6,
  },
  pillText: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
});
