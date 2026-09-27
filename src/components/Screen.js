import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../constants/theme';
import { useTheme } from '../store/themeStore';

export default function Screen({
  children,
  scroll = false,
  padded = true,
  background,
  edges = ['top'],
  contentContainerStyle,
  style,
}) {
  const { colors } = useTheme();
  const bg = background || colors.background;

  const Container = scroll ? ScrollView : View;
  const containerProps = scroll
    ? {
        contentContainerStyle: [padded && styles.padded, contentContainerStyle],
        showsVerticalScrollIndicator: false,
      }
    : { style: [styles.flex, padded && styles.padded, style] };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={edges}>
      <Container {...containerProps}>{children}</Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  padded: { padding: spacing.lg, paddingBottom: spacing.xxxl },
});
