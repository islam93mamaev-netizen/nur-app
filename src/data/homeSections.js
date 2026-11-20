// Секции быстрых действий на главной.
// Цвета подобраны средней яркости, чтобы читались и в светлой, и в тёмной теме.

export const HOME_SECTIONS = [
  {
    id: 'worship',
    title: 'Поклонение',
    items: [
      { icon: 'clock',    title: 'Намазы',     route: 'PrayerTimes', color: '#1E7B5F' },
      { icon: 'compass',  title: 'Кибла',      route: 'Qibla',       color: '#3D6E94' },
      { icon: 'beads',    title: 'Тасбих',     route: 'Tasbih',      color: '#C9A55B' },
      { icon: 'dua',      title: 'Дуа',        route: 'Duas',        color: '#2E7D5B' },
      { icon: 'sunrise',  title: 'Азкары',     route: 'Adhkar',      color: '#A68641' },
      { icon: 'mosque',   title: 'Практика',   route: 'Practice',    color: '#2E7D5B' },
      { icon: 'check',    title: 'Сунны',      route: 'Sunnah',      color: '#2E7D5B' },
      { icon: 'moon',     title: 'Пост',       route: 'Fasting',     color: '#3D6E94' },
      { icon: 'star',     title: 'Рамадан',    route: 'Ramadan',     color: '#C9A55B' },
    ],
  },
  {
    id: 'language',
    title: 'Изучение языка',
    items: [
      { icon: 'map',      title: 'Путь',       route: 'ArabicPath',  color: '#1E9C76' },
      { icon: 'type',     title: 'Алфавит',    route: 'Alphabet',    color: '#B23A48' },
      { icon: 'pen',      title: 'Грамматика', route: 'Grammar',     color: '#1E7B5F' },
      { icon: 'layers',   title: 'Карточки',   route: 'Flashcards',  color: '#3D6E94' },
      { icon: 'sparkle',  title: '99 имён',    route: 'Asma',        color: '#C9A55B' },
      { icon: 'target',   title: 'Таджвид',    route: 'Tajwid',      color: '#1E7B5F' },
    ],
  },
  {
    id: 'knowledge',
    title: 'Знание',
    items: [
      { icon: 'scroll',     title: 'Хадисы',  route: 'Hadiths', color: '#C9A55B' },
      { icon: 'scale',      title: 'Этика',   route: 'Ethics',  color: '#1E7B5F' },
      { icon: 'helpCircle', title: 'Вопросы', route: 'Faq',     color: '#8C8C8C' },
      { icon: 'feather',    title: 'Сира',    route: 'Sira',    color: '#B23A48' },
      { icon: 'users',      title: 'Сахабы',  route: 'Sahaba',  color: '#1E7B5F' },
      { icon: 'columns',    title: 'Мазхабы', route: 'Mazhabs', color: '#A68641' },
    ],
  },
  {
    id: 'tools',
    title: 'Инструменты',
    items: [
      { icon: 'award',         title: 'Тесты',    route: 'Exams',       color: '#1E7B5F' },
      { icon: 'calendar',      title: 'Хиджра',   route: 'Hijri',       color: '#A68641' },
      { icon: 'bookmark',      title: 'Закладки', route: 'Bookmarks',   color: '#3D6E94' },
      { icon: 'messageCircle', title: 'AI',       route: 'AIAssistant', color: '#2E7D5B' },
      { icon: 'percent',       title: 'Закят',    route: 'Zakat',       color: '#C9A55B' },
    ],
  },
];

// Порядок секций в зависимости от цели профиля. «Инструменты» всегда внизу.
const GOAL_ORDER = {
  salat:  ['worship', 'knowledge', 'language', 'tools'],
  islam:  ['knowledge', 'worship', 'language', 'tools'],
  quran:  ['language', 'worship', 'knowledge', 'tools'],
  arabic: ['language', 'knowledge', 'worship', 'tools'],
};
const DEFAULT_ORDER = ['worship', 'language', 'knowledge', 'tools'];

export function getOrderedSections(goal) {
  const order = GOAL_ORDER[goal] || DEFAULT_ORDER;
  return order.map((id) => HOME_SECTIONS.find((s) => s.id === id)).filter(Boolean);
}
