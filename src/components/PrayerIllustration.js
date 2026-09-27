// SVG-иллюстрации поз намаза (стилизованные силуэты).

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, Line, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { spacing, typography, radii } from '../constants/theme';
import { useTheme } from '../store/themeStore';

const BODY = '#3D6E94';
const BODY_DARK = '#274A66';
const SKIN = '#F5D6B5';

function PersonBase() {
  // Молитвенный коврик (общий для всех поз)
  return (
    <Rect x="5" y="92" width="90" height="6" rx="2" fill="#A68641" opacity="0.6" />
  );
}

function Takbir() {
  return (
    <Svg viewBox="0 0 100 100">
      <PersonBase />
      {/* Корпус */}
      <Rect x="38" y="40" width="24" height="50" rx="6" fill={BODY} stroke={BODY_DARK} strokeWidth="1" />
      {/* Руки подняты */}
      <Path d="M30,40 L30,18 L38,18 L38,42 Z" fill={BODY} stroke={BODY_DARK} strokeWidth="1" />
      <Path d="M70,40 L70,18 L62,18 L62,42 Z" fill={BODY} stroke={BODY_DARK} strokeWidth="1" />
      {/* Голова */}
      <Circle cx="50" cy="28" r="10" fill={SKIN} stroke={BODY_DARK} strokeWidth="1" />
    </Svg>
  );
}

function Kiyam() {
  return (
    <Svg viewBox="0 0 100 100">
      <PersonBase />
      {/* Корпус */}
      <Rect x="38" y="38" width="24" height="52" rx="6" fill={BODY} stroke={BODY_DARK} strokeWidth="1" />
      {/* Руки скрещены на груди */}
      <Path d="M38,46 L46,56 L46,62 L38,58 Z" fill={BODY_DARK} />
      <Path d="M62,46 L54,56 L54,62 L62,58 Z" fill={BODY_DARK} />
      {/* Голова */}
      <Circle cx="50" cy="28" r="10" fill={SKIN} stroke={BODY_DARK} strokeWidth="1" />
    </Svg>
  );
}

function Ruku() {
  return (
    <Svg viewBox="0 0 100 100">
      <PersonBase />
      {/* Корпус наклонён */}
      <Path d="M30,60 L70,60 L72,90 L28,90 Z" fill={BODY} stroke={BODY_DARK} strokeWidth="1" />
      {/* Руки на коленях */}
      <Line x1="42" y1="62" x2="38" y2="78" stroke={BODY_DARK} strokeWidth="3" />
      <Line x1="58" y1="62" x2="62" y2="78" stroke={BODY_DARK} strokeWidth="3" />
      {/* Голова — наклонена */}
      <Circle cx="50" cy="56" r="9" fill={SKIN} stroke={BODY_DARK} strokeWidth="1" />
    </Svg>
  );
}

function Sujud() {
  return (
    <Svg viewBox="0 0 100 100">
      <PersonBase />
      {/* Корпус в земном поклоне */}
      <Path d="M28,82 L72,82 L70,90 L30,90 Z" fill={BODY} stroke={BODY_DARK} strokeWidth="1" />
      {/* Голова прижата к земле */}
      <Circle cx="50" cy="82" r="8" fill={SKIN} stroke={BODY_DARK} strokeWidth="1" />
      {/* Руки рядом с головой */}
      <Rect x="32" y="80" width="10" height="6" rx="2" fill={SKIN} />
      <Rect x="58" y="80" width="10" height="6" rx="2" fill={SKIN} />
    </Svg>
  );
}

function Julus() {
  return (
    <Svg viewBox="0 0 100 100">
      <PersonBase />
      {/* Сидячая поза */}
      <Path d="M30,68 L70,68 L74,92 L26,92 Z" fill={BODY} stroke={BODY_DARK} strokeWidth="1" />
      {/* Руки на коленях */}
      <Rect x="32" y="68" width="14" height="6" rx="2" fill={SKIN} />
      <Rect x="54" y="68" width="14" height="6" rx="2" fill={SKIN} />
      {/* Голова прямо */}
      <Circle cx="50" cy="56" r="10" fill={SKIN} stroke={BODY_DARK} strokeWidth="1" />
    </Svg>
  );
}

const STEPS = {
  niyyah: { label: 'Намерение', desc: 'Намерение в сердце совершить намаз',                         C: Kiyam },
  takbir: { label: 'Такбир',     desc: 'Руки поднимаются до ушей; «Аллаху Акбар»',                 C: Takbir },
  kiyam:  { label: 'Кыям',       desc: 'Стояние; чтение Аль-Фатихи и другой суры',                  C: Kiyam },
  ruku:   { label: 'Руку́',       desc: 'Поясной поклон; «Субхана раббия аль-‘азым»',                 C: Ruku },
  itidal: { label: 'Иʿтидаль',   desc: 'Выпрямление; «Сами‘а Аллаху лиман хамида»',                  C: Kiyam },
  sujud:  { label: 'Суджуд',     desc: 'Земной поклон; «Субхана раббия аль-аʿля»',                   C: Sujud },
  julus:  { label: 'Сидение',    desc: 'Между поклонами / ташаххуд + таслим',                         C: Julus },
};

export default function PrayerIllustration({ step, size = 110 }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const entry = STEPS[step];
  if (!entry) return null;
  const { label, desc, C } = entry;
  return (
    <View style={styles.box}>
      <View style={{ width: size, height: size }}>
        <C />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </View>
  );
}

export function PrayerSequence() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const order = ['kiyam', 'ruku', 'itidal', 'sujud', 'julus', 'sujud'];
  return (
    <View style={styles.row}>
      {order.map((s, i) => (
        <View key={i} style={styles.cell}>
          <View style={{ width: 70, height: 70 }}>
            {React.createElement(STEPS[s].C)}
          </View>
          <Text style={styles.cellLabel}>{i + 1}. {STEPS[s].label}</Text>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.sm,
  },
  label: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  desc: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginTop: 4, lineHeight: 18 },

  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: spacing.sm },
  cell: { width: '32%', alignItems: 'center', marginBottom: spacing.sm },
  cellLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
