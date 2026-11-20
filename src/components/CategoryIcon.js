// CategoryIcon — иконка категории из data-файлов.
// В данных у категорий хранятся эмодзи (icon: '🌅'). Компонент показывает
// вместо эмодзи векторную иконку из Icon.js по таблице соответствия.
// Если для эмодзи соответствия нет — показывает сам эмодзи (ничего не ломается),
// поэтому замену можно расширять постепенно, не трогая данные.
//
//   <CategoryIcon icon={cat.icon} size={26} color={cat.color} />

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Icon, { ICON_NAMES } from './Icon';
import { useTheme } from '../store/themeStore';

// эмодзи → имя иконки в Icon.js
const EMOJI_TO_ICON = {
  // время суток и намаз
  '🌅': 'sunrise', '🌆': 'sunset', '🌙': 'moon', '🕌': 'mosque', '🕋': 'kaaba',
  // дуа
  '💧': 'droplet', '🚿': 'cloudRain', '🍽': 'utensils', '🛣': 'navigation',
  '🏠': 'home', '🏘': 'home', '💪': 'lifeBuoy', '🛡': 'shield', '🤲': 'dua',
  // FAQ
  '💰': 'percent', '👨‍👩‍👧': 'users', '💳': 'creditCard', '✨': 'sparkle', '🌸': 'heart', '❓': 'helpCircle',
  // основы и знание
  '📖': 'bookOpen', '📜': 'scroll', '⚖': 'scale', '🌿': 'leaf',
  // этика
  '🤵': 'user', '👴': 'users', '👶': 'user', '💍': 'heart', '💬': 'messageCircle',
  '👕': 'shirt', '🤝': 'users', '🛒': 'cart',
  // сунны дня
  '🌤': 'sunrise', '📿': 'beads', '🦷': 'sparkle', '🛏': 'moon', '💚': 'heart',
  // общие подписи и категории (грамматика, тесты, сира, сахабы, мазхабы, пост, достижения)
  '⭐': 'star', '🌟': 'star', '★': 'starFilled', '☆': 'star', '🏆': 'trophy', '🥇': 'trophy', '🎓': 'award', '👑': 'award',
  '🌱': 'leaf', '🌳': 'leaf', '🌹': 'heart', '📚': 'book', '🔤': 'type', '✏': 'pen', '📝': 'pen',
  '⚙': 'settings', '⚡': 'zap', '🎯': 'target', '🔥': 'flame', '🕯': 'flame', '☀': 'sun', '🌄': 'sunrise',
  '🏛': 'columns', '⚔': 'shield', '🌊': 'droplet', '🌐': 'globe', '🇷🇺': 'book', '📅': 'calendar',
  '🎉': 'sparkle', '💎': 'sparkle', '💡': 'bulb', '🔊': 'volume', '🗣': 'volume', '🎙': 'mic', '🎵': 'volume',
  '⚠': 'alert', '📌': 'pin', '🔒': 'lock', '🖼': 'image', '📊': 'barChart', '📈': 'barChart', '🔍': 'search',
  '🔗': 'link', '🔖': 'bookmark', '📳': 'smartphone', '✅': 'check', '👁': 'eye', '🙈': 'eyeOff',
  '🎲': 'refresh', '👥': 'users', '💵': 'creditCard', '💸': 'creditCard', '🏦': 'columns', '⚖': 'scale',
  '👍': 'check', '💪': 'zap', '👨‍🏫': 'user', '🏫': 'columns', '🚫': 'x', '👋': 'user', '👉': 'chevronRight',
  '🤫': 'messageCircle', '🐪': 'navigation', '🐑': 'star', '⏪': 'refresh', '↔': 'link',
  // категории слов
  '👤': 'user', '🔗': 'link', '🔁': 'refresh', '👥': 'users', '⏳': 'clock',
  '🌍': 'globe', '🎨': 'pen', '🔢': 'hash',
};

// Убираем вариационный селектор (U+FE0F): '🍽️' и '🍽' — одна иконка
const normalize = (s) => (s || '').replace(/️/g, '');

export function iconNameFor(emoji) {
  const name = EMOJI_TO_ICON[normalize(emoji)];
  return name && ICON_NAMES.includes(name) ? name : null;
}

// Относительная яркость цвета #RRGGBB (0 — чёрный, 1 — белый)
function luminance(hex) {
  const m = /^#?([0-9a-f]{6})/i.exec(hex || '');
  if (!m) return 1;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

// textStyle — стиль <Text>, который раньше рисовал эмодзи: из него берутся
// размер (fontSize), цвет и отступы, поэтому замену можно делать механически:
//   <Text style={s.icon}>{x.icon}</Text>  →  <CategoryIcon icon={x.icon} textStyle={s.icon} />
export default function CategoryIcon({ icon, size, color, style, textStyle }) {
  const { isDark, colors } = useTheme();
  const name = iconNameFor(icon);
  // Нет соответствия (например, арабская буква) — рисуем как раньше, исходным стилем
  if (!name && textStyle) return <Text style={textStyle}>{icon}</Text>;
  if (textStyle) {
    const flat = StyleSheet.flatten(textStyle) || {};
    const { fontSize, color: tColor, lineHeight, fontWeight, fontFamily, textAlign, ...box } = flat;
    size = size ?? (fontSize ? Math.round(fontSize * 0.95) : 24);
    color = color ?? tColor ?? colors.primary;
    style = [box, style];
  }
  size = size ?? 24;
  color = color ?? colors.primary;
  // В данных у части категорий очень тёмные цвета (#063326, #0F4C3A): на тёмной
  // теме тонкая иконка такого цвета почти не видна — подменяем светлым изумрудным.
  const safeColor = isDark && luminance(color) < 0.08 ? colors.primaryLight : color;
  if (name) return <Icon name={name} size={size} color={safeColor} style={style} />;
  // запасной вариант — эмодзи, примерно того же размера
  return <Text style={[style, { fontSize: size, lineHeight: size * 1.25 }]}>{icon}</Text>;
}
