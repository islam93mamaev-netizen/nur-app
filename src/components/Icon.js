// Единый набор векторных иконок приложения «Нур».
// Основан на стиле Feather/Lucide (MIT): stroke 2, скруглённые концы, viewBox 24×24.
// Преимущества перед эмодзи: одинаковый вид на iOS/Android/Web,
// перекрашиваются под тему, масштабируются без потери качества.
//
// Использование:
//   <Icon name="home" size={24} color={colors.primary} />

import React from 'react';
import Svg, { Path, Circle, Line, Polyline, Polygon, Rect } from 'react-native-svg';

// Каждая иконка — массив примитивов [Component, props]
const ICONS = {
  // ─── Таб-бар ───
  home: [
    [Path, { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
    [Polyline, { points: '9 22 9 12 15 12 15 22' }],
  ],
  book: [
    [Path, { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }],
    [Path, { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' }],
  ],
  bookOpen: [
    [Path, { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }],
    [Path, { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' }],
  ],
  type: [
    [Polyline, { points: '4 7 4 4 20 4 20 7' }],
    [Line, { x1: 9, y1: 20, x2: 15, y2: 20 }],
    [Line, { x1: 12, y1: 4, x2: 12, y2: 20 }],
  ],
  user: [
    [Path, { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }],
    [Circle, { cx: 12, cy: 7, r: 4 }],
  ],

  // ─── Поклонение ───
  clock: [
    [Circle, { cx: 12, cy: 12, r: 10 }],
    [Polyline, { points: '12 6 12 12 16 14' }],
  ],
  compass: [
    [Circle, { cx: 12, cy: 12, r: 10 }],
    [Polygon, { points: '16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76' }],
  ],
  // Тасбих — кольцо из бусин
  beads: [
    [Circle, { cx: 12, cy: 4.5, r: 1.7, fill: true }],
    [Circle, { cx: 17.3, cy: 6.7, r: 1.7, fill: true }],
    [Circle, { cx: 19.5, cy: 12, r: 1.7, fill: true }],
    [Circle, { cx: 17.3, cy: 17.3, r: 1.7, fill: true }],
    [Circle, { cx: 12, cy: 19.5, r: 1.7, fill: true }],
    [Circle, { cx: 6.7, cy: 17.3, r: 1.7, fill: true }],
    [Circle, { cx: 4.5, cy: 12, r: 1.7, fill: true }],
    [Circle, { cx: 6.7, cy: 6.7, r: 1.7, fill: true }],
  ],
  // Дуа — раскрытые ладони (упрощённо)
  dua: [
    [Path, { d: 'M7 11V5.5a1.5 1.5 0 0 1 3 0V10' }],
    [Path, { d: 'M10 10V4.5a1.5 1.5 0 0 1 3 0V10' }],
    [Path, { d: 'M13 10V5.5a1.5 1.5 0 0 1 3 0V12' }],
    [Path, { d: 'M16 12V8.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7v-2.5a1.5 1.5 0 0 1 3 0' }],
  ],
  sunrise: [
    [Path, { d: 'M17 18a5 5 0 0 0-10 0' }],
    [Line, { x1: 12, y1: 2, x2: 12, y2: 9 }],
    [Line, { x1: 4.22, y1: 10.22, x2: 5.64, y2: 11.64 }],
    [Line, { x1: 1, y1: 18, x2: 3, y2: 18 }],
    [Line, { x1: 21, y1: 18, x2: 23, y2: 18 }],
    [Line, { x1: 18.36, y1: 11.64, x2: 19.78, y2: 10.22 }],
    [Line, { x1: 23, y1: 22, x2: 1, y2: 22 }],
    [Polyline, { points: '8 6 12 2 16 6' }],
  ],
  // Мечеть — купол с основанием
  mosque: [
    [Path, { d: 'M3 21h18' }],
    [Path, { d: 'M5 21v-8' }],
    [Path, { d: 'M19 21v-8' }],
    [Path, { d: 'M5 13a7 7 0 0 1 14 0' }],
    [Line, { x1: 12, y1: 3, x2: 12, y2: 6 }],
    [Circle, { cx: 12, cy: 2.2, r: 0.4, fill: true }],
    [Path, { d: 'M10 21v-3a2 2 0 0 1 4 0v3' }],
  ],
  moon: [
    [Path, { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }],
  ],

  // ─── Язык ───
  pen: [
    [Path, { d: 'M12 20h9' }],
    [Path, { d: 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' }],
  ],
  layers: [
    [Polygon, { points: '12 2 2 7 12 12 22 7 12 2' }],
    [Polyline, { points: '2 17 12 22 22 17' }],
    [Polyline, { points: '2 12 12 17 22 12' }],
  ],
  star: [
    [Polygon, { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }],
  ],
  target: [
    [Circle, { cx: 12, cy: 12, r: 10 }],
    [Circle, { cx: 12, cy: 12, r: 6 }],
    [Circle, { cx: 12, cy: 12, r: 2 }],
  ],

  // ─── Знание ───
  scroll: [
    [Path, { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }],
    [Polyline, { points: '14 2 14 8 20 8' }],
    [Line, { x1: 16, y1: 13, x2: 8, y2: 13 }],
    [Line, { x1: 16, y1: 17, x2: 8, y2: 17 }],
  ],
  // Весы — этика/фикх
  scale: [
    [Line, { x1: 12, y1: 3, x2: 12, y2: 21 }],
    [Path, { d: 'M8 21h8' }],
    [Line, { x1: 4, y1: 7, x2: 20, y2: 7 }],
    [Path, { d: 'M5 7l-3 6a3 3 0 0 0 6 0z' }],
    [Path, { d: 'M19 7l-3 6a3 3 0 0 0 6 0z' }],
  ],
  helpCircle: [
    [Circle, { cx: 12, cy: 12, r: 10 }],
    [Path, { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }],
    [Line, { x1: 12, y1: 17, x2: 12.01, y2: 17 }],
  ],
  feather: [
    [Path, { d: 'M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z' }],
    [Line, { x1: 16, y1: 8, x2: 2, y2: 22 }],
    [Line, { x1: 17.5, y1: 15, x2: 9, y2: 15 }],
  ],
  users: [
    [Path, { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }],
    [Circle, { cx: 9, cy: 7, r: 4 }],
    [Path, { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }],
    [Path, { d: 'M16 3.13a4 4 0 0 1 0 7.75' }],
  ],
  // Здание с колоннами — мазхабы
  columns: [
    [Path, { d: 'M3 21h18' }],
    [Path, { d: 'M5 21V8l7-5 7 5v13' }],
    [Line, { x1: 9, y1: 21, x2: 9, y2: 12 }],
    [Line, { x1: 15, y1: 21, x2: 15, y2: 12 }],
  ],

  // ─── Инструменты ───
  award: [
    [Circle, { cx: 12, cy: 8, r: 7 }],
    [Polyline, { points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' }],
  ],
  calendar: [
    [Rect, { x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 }],
    [Line, { x1: 16, y1: 2, x2: 16, y2: 6 }],
    [Line, { x1: 8, y1: 2, x2: 8, y2: 6 }],
    [Line, { x1: 3, y1: 10, x2: 21, y2: 10 }],
  ],
  bookmark: [
    [Path, { d: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' }],
  ],
  sparkle: [
    [Path, { d: 'M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z' }],
  ],
  messageCircle: [
    [Path, { d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' }],
  ],
  percent: [
    [Line, { x1: 19, y1: 5, x2: 5, y2: 19 }],
    [Circle, { cx: 6.5, cy: 6.5, r: 2.5 }],
    [Circle, { cx: 17.5, cy: 17.5, r: 2.5 }],
  ],

  // ─── Категории (дуа, FAQ, этика, слова) ───
  droplet: [
    [Path, { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' }],
  ],
  cloudRain: [
    [Line, { x1: 16, y1: 13, x2: 16, y2: 21 }],
    [Line, { x1: 8, y1: 13, x2: 8, y2: 21 }],
    [Line, { x1: 12, y1: 15, x2: 12, y2: 23 }],
    [Path, { d: 'M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25' }],
  ],
  shield: [
    [Path, { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }],
  ],
  heart: [
    [Path, { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' }],
  ],
  utensils: [
    [Path, { d: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2' }],
    [Line, { x1: 7, y1: 2, x2: 7, y2: 22 }],
    [Path, { d: 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7' }],
  ],
  navigation: [
    [Polygon, { points: '3 11 22 2 13 21 11 13 3 11' }],
  ],
  lifeBuoy: [
    [Circle, { cx: 12, cy: 12, r: 10 }],
    [Circle, { cx: 12, cy: 12, r: 4 }],
    [Line, { x1: 4.93, y1: 4.93, x2: 9.17, y2: 9.17 }],
    [Line, { x1: 14.83, y1: 14.83, x2: 19.07, y2: 19.07 }],
    [Line, { x1: 14.83, y1: 9.17, x2: 19.07, y2: 4.93 }],
    [Line, { x1: 4.93, y1: 19.07, x2: 9.17, y2: 14.83 }],
  ],
  sunset: [
    [Path, { d: 'M17 18a5 5 0 0 0-10 0' }],
    [Line, { x1: 12, y1: 9, x2: 12, y2: 2 }],
    [Line, { x1: 4.22, y1: 10.22, x2: 5.64, y2: 11.64 }],
    [Line, { x1: 1, y1: 18, x2: 3, y2: 18 }],
    [Line, { x1: 21, y1: 18, x2: 23, y2: 18 }],
    [Line, { x1: 18.36, y1: 11.64, x2: 19.78, y2: 10.22 }],
    [Line, { x1: 23, y1: 22, x2: 1, y2: 22 }],
    [Polyline, { points: '16 5 12 9 8 5' }],
  ],
  kaaba: [
    [Rect, { x: 4, y: 5, width: 16, height: 15, rx: 1, ry: 1 }],
    [Line, { x1: 4, y1: 9, x2: 20, y2: 9 }],
    [Line, { x1: 10, y1: 20, x2: 10, y2: 14 }],
    [Line, { x1: 14, y1: 20, x2: 14, y2: 14 }],
    [Line, { x1: 10, y1: 14, x2: 14, y2: 14 }],
  ],
  creditCard: [
    [Rect, { x: 1, y: 4, width: 22, height: 16, rx: 2, ry: 2 }],
    [Line, { x1: 1, y1: 10, x2: 23, y2: 10 }],
  ],
  link: [
    [Path, { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }],
    [Path, { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }],
  ],
  globe: [
    [Circle, { cx: 12, cy: 12, r: 10 }],
    [Line, { x1: 2, y1: 12, x2: 22, y2: 12 }],
    [Path, { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }],
  ],
  hash: [
    [Line, { x1: 4, y1: 9, x2: 20, y2: 9 }],
    [Line, { x1: 4, y1: 15, x2: 20, y2: 15 }],
    [Line, { x1: 10, y1: 3, x2: 8, y2: 21 }],
    [Line, { x1: 16, y1: 3, x2: 14, y2: 21 }],
  ],
  leaf: [
    [Path, { d: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z' }],
    [Path, { d: 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12' }],
  ],
  shirt: [
    [Path, { d: 'M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z' }],
  ],
  cart: [
    [Circle, { cx: 9, cy: 21, r: 1 }],
    [Circle, { cx: 20, cy: 21, r: 1 }],
    [Path, { d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' }],
  ],

  // Карта — «Путь арабского»
  map: [
    [Polygon, { points: '1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6' }],
    [Line, { x1: 8, y1: 2, x2: 8, y2: 18 }],
    [Line, { x1: 16, y1: 6, x2: 16, y2: 22 }],
  ],

  // ─── Плеер ───
  play: [
    [Polygon, { points: '7 4 20 12 7 20', fill: true }],
  ],
  pause: [
    [Rect, { x: 6, y: 5, width: 4, height: 14, rx: 1, fill: true }],
    [Rect, { x: 14, y: 5, width: 4, height: 14, rx: 1, fill: true }],
  ],

  // ─── Сервисные ───
  flame: [
    [Path, { d: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' }],
  ],
  refresh: [
    [Polyline, { points: '23 4 23 10 17 10' }],
    [Path, { d: 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10' }],
  ],
  check: [
    [Polyline, { points: '20 6 9 17 4 12' }],
  ],
  chevronRight: [
    [Polyline, { points: '9 18 15 12 9 6' }],
  ],
  search: [
    [Circle, { cx: 11, cy: 11, r: 8 }],
    [Line, { x1: 21, y1: 21, x2: 16.65, y2: 16.65 }],
  ],
};

export const ICON_NAMES = Object.keys(ICONS);

export default function Icon({ name, size = 24, color = '#000', strokeWidth = 2, style }) {
  const shapes = ICONS[name];
  if (!shapes) {
    console.warn(`Icon: неизвестное имя "${name}"`);
    return null;
  }
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      {shapes.map(([Cmp, props], i) => {
        const { fill, ...rest } = props;
        return (
          <Cmp
            key={i}
            stroke={fill ? 'none' : color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fill ? color : 'none'}
            {...rest}
          />
        );
      })}
    </Svg>
  );
}
