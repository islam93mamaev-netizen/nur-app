// Баннер «Рамадан мубарак» — показывается только в месяц Рамадан.

import React from 'react';
import { View, Text } from 'react-native';
import Card from '../Card';
import Icon from '../Icon';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { gregorianToHijri } from '../../utils/hijri';

export default function RamadanBanner({ onPress }) {
  const { colors } = useTheme();
  const hijri = gregorianToHijri(new Date());
  if (hijri.month !== 9) return null;

  return (
    <Card
      onPress={onPress}
      style={{
        marginTop: spacing.md,
        backgroundColor: colors.accent + '18',
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="star" size={22} color={colors.accentDark} style={{ marginRight: spacing.md }} />
        <View style={{ flex: 1 }}>
          <Text style={{ ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' }}>
            Рамадан мубарак!
          </Text>
          <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
            Сегодня {hijri.day}-й день · трекер поста, сухур и ифтар
          </Text>
        </View>
        <Icon name="chevronRight" size={18} color={colors.textMuted} />
      </View>
    </Card>
  );
}
