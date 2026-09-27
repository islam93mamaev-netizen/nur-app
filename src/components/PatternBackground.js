// Фон с градиентом и исламским геометрическим орнаментом (восьмиконечная
// звезда из двух повёрнутых квадратов — классический мотив гирих).
//
// Реализация: меряем контейнер через onLayout и рисуем SVG в явных пикселях.
// Процентные размеры и <Pattern> в react-native-svg ведут себя по-разному
// на iOS/Android (артефакты «тёмного квадрата»), поэтому тайлы орнамента
// генерируются циклом, а градиент задаётся в userSpaceOnUse-координатах.
//
// Родитель должен иметь overflow: 'hidden' (для скругления углов).

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Rect, LinearGradient, Stop, G } from 'react-native-svg';

let uid = 0;

export default function PatternBackground({
  from = '#0F4C3A',
  to = '#063326',
  patternColor = '#FFFFFF',
  patternOpacity = 0.07,
  cell = 46,
  style,
}) {
  const idRef = React.useRef(`pbg${++uid}`);
  const [size, setSize] = useState(null);

  const q = cell * 0.42;       // сторона квадрата звезды
  const o = (cell - q) / 2;    // отступ внутри ячейки
  const half = cell / 2;

  // Тайлы орнамента: пары повёрнутых квадратов по сетке
  let tiles = null;
  if (size) {
    const cols = Math.ceil(size.width / cell) + 1;
    const rows = Math.ceil(size.height / cell) + 1;
    tiles = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cell;
        const y = r * cell;
        tiles.push(
          <G key={`${r}-${c}`}>
            <Rect
              x={x + o} y={y + o} width={q} height={q}
              fill="none"
              stroke={patternColor}
              strokeOpacity={patternOpacity}
              strokeWidth={1.2}
            />
            <Rect
              x={x + o} y={y + o} width={q} height={q}
              fill="none"
              stroke={patternColor}
              strokeOpacity={patternOpacity}
              strokeWidth={1.2}
              transform={`rotate(45 ${x + half} ${y + half})`}
            />
          </G>
        );
      }
    }
  }

  return (
    <View
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) setSize({ width, height });
      }}
    >
      {size && (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <LinearGradient
              id={idRef.current}
              gradientUnits="userSpaceOnUse"
              x1="0" y1="0" x2={size.width} y2={size.height}
            >
              <Stop offset="0" stopColor={from} />
              <Stop offset="1" stopColor={to} />
            </LinearGradient>
          </Defs>
          <Rect width={size.width} height={size.height} fill={`url(#${idRef.current})`} />
          {tiles}
        </Svg>
      )}
    </View>
  );
}
