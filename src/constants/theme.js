// Единая дизайн-система приложения «Нур»
// Поддерживает две темы: светлую (по умолчанию) и тёмную.
// Цветовая палитра вдохновлена исламским искусством:
// глубокий изумруд, тёплое золото, кремовый фон.

export const lightColors = {
  // Основная палитра
  primary: '#0F4C3A',        // глубокий изумруд
  primaryDark: '#063326',
  primaryLight: '#1E7B5F',

  accent: '#C9A55B',         // тёплое золото
  accentDark: '#A68641',
  accentLight: '#E2C58A',

  // Поверхности
  background: '#F8F4EC',     // кремовый
  surface: '#FFFFFF',
  surfaceAlt: '#F1EADE',
  card: '#FFFFFF',

  // Текст
  textPrimary: '#1A1A1A',
  textSecondary: '#5A5A5A',
  textMuted: '#8C8C8C',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#1A1A1A',

  // Сервисные
  success: '#2E7D5B',
  warning: '#D9A441',
  danger: '#B23A48',
  info: '#3D6E94',

  // Границы / разделители
  border: '#E5DDD0',
  divider: '#EFE7D7',

  // Прогресс
  progressBg: '#E5DDD0',
  progressFill: '#0F4C3A',

  // Арабский акцент
  arabicAccent: '#0F4C3A',
};

export const darkColors = {
  // Основная палитра (чуть ярче для контраста на тёмном)
  primary: '#1E9C76',
  primaryDark: '#0F4C3A',
  primaryLight: '#3DBE96',

  accent: '#E2C58A',
  accentDark: '#C9A55B',
  accentLight: '#F0DDB0',

  // Поверхности (глубокий тёплый чёрно-зелёный)
  background: '#0E1614',
  surface: '#172420',
  surfaceAlt: '#1F2D29',
  card: '#172420',

  // Текст
  textPrimary: '#F2EFE7',
  textSecondary: '#B5B1A8',
  textMuted: '#7A7770',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#1A1A1A',

  // Сервисные
  success: '#4CAF82',
  warning: '#E0B45A',
  danger: '#D45062',
  info: '#5C8FB8',

  // Границы / разделители
  border: '#2A3934',
  divider: '#243430',

  // Прогресс
  progressBg: '#2A3934',
  progressFill: '#3DBE96',

  // Арабский акцент
  arabicAccent: '#E2C58A',
};

// Обратная совместимость: статический экспорт `colors` остаётся как светлая палитра.
// Все экраны, импортирующие `colors` напрямую, не сломаются — для динамической темы
// используйте useTheme() из ThemeContext.
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

// Семейства шрифтов.
// Кириллица/латиница — Manrope (загружается в App.js через expo-font).
// Арабский — Amiri: классический насх, корректно отображает харакаты.
// Каждый вес — отдельное семейство (так устроены пакеты @expo-google-fonts).
export const fonts = {
  regular:    'Manrope_400Regular',
  medium:     'Manrope_500Medium',
  semibold:   'Manrope_600SemiBold',
  bold:       'Manrope_700Bold',
  extrabold:  'Manrope_800ExtraBold',
  // Noto Naskh Arabic — ровный экранный насх: чёткие формы букв и огласовки,
  // лучше для обучения. Amiri (каллиграфический) остаётся загруженным —
  // можно вернуть для «книжного» вида Корана.
  arabic:     'NotoNaskhArabic_400Regular',
  arabicBold: 'NotoNaskhArabic_700Bold',
  arabicCalligraphy: 'Amiri_400Regular',
};

export const typography = {
  h1: { fontSize: 32, fontFamily: fonts.bold, fontWeight: '700', lineHeight: 38 },
  h2: { fontSize: 26, fontFamily: fonts.bold, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontFamily: fonts.semibold, fontWeight: '600', lineHeight: 26 },
  h4: { fontSize: 18, fontFamily: fonts.semibold, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontFamily: fonts.regular, fontWeight: '400', lineHeight: 22 },
  bodyMedium: { fontSize: 16, fontFamily: fonts.medium, fontWeight: '500', lineHeight: 22 },
  small: { fontSize: 14, fontFamily: fonts.regular, fontWeight: '400', lineHeight: 19 },
  caption: { fontSize: 12, fontFamily: fonts.regular, fontWeight: '400', lineHeight: 16 },
  button: { fontSize: 16, fontFamily: fonts.semibold, fontWeight: '600', lineHeight: 20 },
  // У арабских шрифтов высокие надстрочные знаки (харакаты) — lineHeight с запасом.
  arabic: { fontSize: 30, fontFamily: fonts.arabic, lineHeight: 56 },
  arabicLarge: { fontSize: 38, fontFamily: fonts.arabic, lineHeight: 70 },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const palettes = { light: lightColors, dark: darkColors };

// brandPalette — фиксированные цвета категорий и тем.
// Используются в data-файлах (где нельзя вызвать useTheme): иконки разделов,
// цвета пиллов, акценты заголовков. Эти цвета НЕ зависят от темы.
export const brandPalette = {
  emerald:    '#0F4C3A',  // primary green — основной зелёный
  emeraldDark:'#063326',
  emeraldLight:'#1E7B5F',
  gold:       '#C9A55B',  // gold — золотой
  goldDark:   '#A68641',
  goldLight:  '#E2C58A',
  navy:       '#3D6E94',  // navy — синий
  crimson:    '#B23A48',  // crimson — глубокий красный
  forest:     '#2E7D5B',  // forest — насыщенный зелёный
  graphite:   '#5A5A5A',  // graphite — серый

  // Тематические алиасы (semantic) — рекомендуется их использовать в data
  islam:      '#0F4C3A',  // ислам, основы
  quran:      '#1E7B5F',  // Коран
  hadith:     '#C9A55B',  // хадисы
  fiqh:       '#063326',  // фикх / детальные вопросы
  arabic:     '#3D6E94',  // арабский язык / алфавит
  practice:   '#2E7D5B',  // практика
  ethics:     '#0F4C3A',  // этика
  women:      '#B23A48',  // женские темы
  prophet:    '#3D6E94',  // пророки
  sira:       '#B23A48',  // сира
  duas:       '#2E7D5B',  // дуа
  asma:       '#0F4C3A',  // 99 имён
};

export default { colors, lightColors, darkColors, spacing, radii, typography, shadows, palettes, brandPalette, fonts };
