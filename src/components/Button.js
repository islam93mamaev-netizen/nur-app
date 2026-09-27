import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { radii, spacing, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const variantStyle = styles[`${variant}Btn`] || styles.primaryBtn;
  const variantText = styles[`${variant}Text`] || styles.primaryText;
  const sizeStyle = size === 'lg' ? styles.lgBtn : size === 'sm' ? styles.smBtn : styles.mdBtn;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.base,
        variantStyle,
        sizeStyle,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.textOnPrimary : colors.primary} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={{ marginRight: spacing.sm }}>{icon}</View> : null}
          <Text style={[styles.text, variantText]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    base: {
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { flexDirection: 'row', alignItems: 'center' },
    mdBtn: { paddingVertical: 14, paddingHorizontal: spacing.lg },
    lgBtn: { paddingVertical: 18, paddingHorizontal: spacing.xl },
    smBtn: { paddingVertical: 10, paddingHorizontal: spacing.md },

    primaryBtn: { backgroundColor: colors.primary },
    primaryText: { color: colors.textOnPrimary },

    secondaryBtn: { backgroundColor: colors.accent },
    secondaryText: { color: colors.textOnAccent },

    outlineBtn: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    outlineText: { color: colors.primary },

    ghostBtn: { backgroundColor: 'transparent' },
    ghostText: { color: colors.primary },

    text: { ...typography.button },
    disabled: { opacity: 0.5 },
  });
