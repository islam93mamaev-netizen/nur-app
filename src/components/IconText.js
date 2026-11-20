// Подпись с векторной иконкой вместо эмодзи в начале текста:
//   <IconText icon="bulb" style={styles.label}>Подсказка</IconText>
// Иконка берёт размер и цвет из стиля текста, поэтому выглядит как «буква» строки.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../store/themeStore';

export default function IconText({ icon, style, children, numberOfLines, gap = 6 }) {
  const { colors } = useTheme();
  const flat = StyleSheet.flatten(style) || {};
  const { margin, marginTop, marginBottom, marginLeft, marginRight, marginVertical, marginHorizontal, ...textStyle } = flat;
  const size = Math.round((flat.fontSize || 14) * 1.05);
  return (
    <View style={[styles.row, { margin, marginTop, marginBottom, marginLeft, marginRight, marginVertical, marginHorizontal }]}>
      <Icon name={icon} size={size} color={flat.color || colors.textPrimary} style={{ marginRight: gap }} />
      <Text style={[textStyle, { flexShrink: 1 }]} numberOfLines={numberOfLines}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
