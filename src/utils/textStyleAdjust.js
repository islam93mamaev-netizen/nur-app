// Общая логика глобальной «подстройки» <Text> (подключается из textPatch.web.js / textPatch.native.js):
//  1) масштаб шрифта из настроек (global.__nurFontScale, его пишет ThemeProvider);
//  2) арабский текст без явного fontFamily получает Noto Naskh Arabic.
// Работает с ВХОДНЫМИ props компонента, поэтому одинаково на iOS, Android и Web.

import { StyleSheet } from 'react-native';

const AR_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
// Кэш для строк: патч вызывается для каждого <Text> — горячий путь
const arCache = new Map();
function isArabicString(s) {
  let v = arCache.get(s);
  if (v === undefined) {
    v = AR_RE.test(s);
    if (arCache.size > 3000) arCache.clear();
    arCache.set(s, v);
  }
  return v;
}
function hasArabic(children, depth = 0) {
  if (depth > 3 || children == null) return false;
  if (typeof children === 'string') return isArabicString(children);
  if (Array.isArray(children)) return children.some((c) => hasArabic(c, depth + 1));
  return false;
}

// Возвращает те же props (если менять нечего) или копию с дополнительным стилем.
export function adjustTextProps(props) {
  if (!props || props.allowFontScaling === false) return props; // опт-аут

  const scale = global.__nurFontScale || 1;
  const arabic = hasArabic(props.children);
  // Быстрый выход для большинства текстов
  if (scale === 1 && !arabic) return props;

  const flat = StyleSheet.flatten(props.style) || {};
  const extra = {};
  if (scale !== 1) {
    if (flat.fontSize) extra.fontSize = flat.fontSize * scale;
    if (flat.lineHeight) extra.lineHeight = flat.lineHeight * scale;
  }
  if (arabic && !flat.fontFamily) {
    const w = parseInt(flat.fontWeight, 10);
    extra.fontFamily = w >= 600 ? 'NotoNaskhArabic_700Bold' : 'NotoNaskhArabic_400Regular';
  }
  if (Object.keys(extra).length === 0) return props;
  return { ...props, style: [props.style, extra] };
}
