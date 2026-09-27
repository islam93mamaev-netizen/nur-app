// Wudu (омовение) — SVG-иллюстрации шагов.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect, Line, Ellipse, G } from 'react-native-svg';
import { spacing, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';

const SKIN = '#F5D6B5';
const SKIN_DARK = '#D6A87C';
const WATER = '#5BAFD1';
const NAIL = '#FFEFD9';

function Hands() {
  return (
    <Svg viewBox="0 0 100 80">
      {/* Левая ладонь */}
      <Path d="M20,20 Q15,15 22,12 L34,14 L36,40 Q34,52 22,52 L18,50 Z" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      {/* Правая ладонь */}
      <Path d="M80,20 Q85,15 78,12 L66,14 L64,40 Q66,52 78,52 L82,50 Z" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      {/* Капли воды */}
      <Path d="M50,8 q3,4 0,8 q-3,-4 0,-8 Z" fill={WATER} />
      <Path d="M45,18 q2,3 0,6 q-2,-3 0,-6 Z" fill={WATER} />
      <Path d="M55,18 q2,3 0,6 q-2,-3 0,-6 Z" fill={WATER} />
    </Svg>
  );
}

function MouthNose() {
  return (
    <Svg viewBox="0 0 100 80">
      {/* Лицо */}
      <Ellipse cx="50" cy="40" rx="28" ry="34" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      {/* Нос */}
      <Path d="M50,32 L46,46 L54,46 Z" fill={SKIN_DARK} opacity="0.4" />
      {/* Рот */}
      <Path d="M40,56 Q50,62 60,56" fill="none" stroke={SKIN_DARK} strokeWidth="2" />
      {/* Капли */}
      <Path d="M45,52 q2,3 0,5 q-2,-3 0,-5 Z" fill={WATER} />
      <Path d="M55,40 q2,3 0,5 q-2,-3 0,-5 Z" fill={WATER} />
    </Svg>
  );
}

function Face() {
  return (
    <Svg viewBox="0 0 100 80">
      <Ellipse cx="50" cy="42" rx="30" ry="36" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      <Circle cx="42" cy="38" r="2" fill="#333" />
      <Circle cx="58" cy="38" r="2" fill="#333" />
      <Path d="M42,52 Q50,58 58,52" fill="none" stroke={SKIN_DARK} strokeWidth="2" />
      {/* Капли воды по лицу */}
      <Path d="M30,30 q2,3 0,5 q-2,-3 0,-5 Z" fill={WATER} />
      <Path d="M70,30 q2,3 0,5 q-2,-3 0,-5 Z" fill={WATER} />
      <Path d="M50,18 q2,3 0,5 q-2,-3 0,-5 Z" fill={WATER} />
    </Svg>
  );
}

function Arms() {
  return (
    <Svg viewBox="0 0 100 80">
      {/* Левая рука */}
      <Path d="M15,15 L20,10 L30,12 L35,55 L25,60 L15,55 Z" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      {/* Правая рука */}
      <Path d="M85,15 L80,10 L70,12 L65,55 L75,60 L85,55 Z" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      {/* Капли */}
      <Path d="M50,30 q2,4 0,8 q-2,-4 0,-8 Z" fill={WATER} />
      <Path d="M25,40 q2,3 0,5 q-2,-3 0,-5 Z" fill={WATER} />
      <Path d="M75,40 q2,3 0,5 q-2,-3 0,-5 Z" fill={WATER} />
    </Svg>
  );
}

function Head() {
  return (
    <Svg viewBox="0 0 100 80">
      {/* Голова */}
      <Ellipse cx="50" cy="42" rx="28" ry="32" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      {/* Волосы — мокрые */}
      <Path d="M22,30 Q50,8 78,30 L78,38 L22,38 Z" fill="#5A4A3A" />
      {/* Уши */}
      <Ellipse cx="20" cy="42" rx="4" ry="6" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      <Ellipse cx="80" cy="42" rx="4" ry="6" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      {/* Капли */}
      <Path d="M50,12 q2,4 0,8 q-2,-4 0,-8 Z" fill={WATER} />
    </Svg>
  );
}

function Feet() {
  return (
    <Svg viewBox="0 0 100 80">
      {/* Левая нога */}
      <Path d="M18,15 L32,15 L34,55 Q30,68 18,68 L14,55 Z" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      {/* Правая нога */}
      <Path d="M82,15 L68,15 L66,55 Q70,68 82,68 L86,55 Z" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1" />
      {/* Пальцы (символично) */}
      <Circle cx="24" cy="66" r="2" fill={NAIL} />
      <Circle cx="76" cy="66" r="2" fill={NAIL} />
      {/* Капли */}
      <Path d="M50,30 q2,4 0,8 q-2,-4 0,-8 Z" fill={WATER} />
    </Svg>
  );
}

const STEPS = {
  hands:     { label: 'Руки до запястий',     desc: 'Помыть кисти рук трижды, начиная с правой',                         C: Hands },
  mouthnose: { label: 'Рот и нос',             desc: 'Прополоскать рот и втянуть воду в нос трижды',                       C: MouthNose },
  face:      { label: 'Лицо',                  desc: 'Помыть лицо целиком трижды (от лба до подбородка, от уха до уха)',  C: Face },
  arms:      { label: 'Руки до локтей',        desc: 'Помыть руки до локтей трижды (с правой)',                            C: Arms },
  head:      { label: 'Голова и уши',          desc: 'Мокрыми руками протереть голову, затем уши (один раз)',              C: Head },
  feet:      { label: 'Ноги до щиколоток',     desc: 'Помыть ноги до щиколоток (с правой), трижды',                        C: Feet },
};

export const WUDU_STEP_ORDER = ['hands', 'mouthnose', 'face', 'arms', 'head', 'feet'];

export default function WuduIllustration({ step, size = 90 }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const cfg = STEPS[step];
  if (!cfg) return null;
  const { C, label, desc } = cfg;
  return (
    <View style={styles.box}>
      <View style={[styles.svgBox, { width: size, height: size * 0.8 }]}>
        <C />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  svgBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  desc: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginTop: 4, lineHeight: 18 },
});
