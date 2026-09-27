import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { radii, shadows, spacing } from '../constants/theme';
import { useTheme } from '../store/themeStore';

export default function Card({ children, onPress, style, padded = true, ...rest }) {
  const { colors } = useTheme();
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.card }, padded && styles.padded, style]}
      {...rest}
    >
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  padded: { padding: spacing.lg },
});
