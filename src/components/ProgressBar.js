import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../store/themeStore';

// Прогресс-бар с плавной анимацией заполнения.
export default function ProgressBar({ value = 0, max = 100, height = 8, color }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const fillColor = color || colors.progressFill;
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));

  const anim = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 400,
      useNativeDriver: false, // анимируем width (layout-свойство)
    }).start();
  }, [pct, anim]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          { width, backgroundColor: fillColor, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  track: {
    backgroundColor: colors.progressBg,
    width: '100%',
    overflow: 'hidden',
  },
  fill: { height: '100%' },
});
