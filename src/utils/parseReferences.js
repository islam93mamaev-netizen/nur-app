// Парсер текстовых ссылок на источники: Коран и хадисы.
//
// Возвращает массив сегментов: { type: 'text' | 'quran' | 'hadith', text, ref }
//
// Для хадиса ref содержит ОБА URL — sunnah.com и isnad.link. Компонент-потребитель
// (ReferenceModal) выберет нужный согласно настройке пользователя.
//
// Поддерживаемые сборники:
//   Бухари, Муслим, Тирмизи, Абу Дауд, Насаи, Ибн Маджа, Малик (Муватта),
//   Ахмад (Муснад), 40 хадисов ан-Навави, Рияд ас-Салихин.

import { findIsnadChapter, isnadChapters } from '../data/isnadChapters';

// Каталог сборников: slug для sunnah.com + slug для isnad.link.
// Если на isnad.link нет конкретного сборника, isnadSlug = null → фоллбек на каталог isnad.
const HADITH_SOURCES = [
  {
    rx: /(?:сахих\s+)?(?:аль-)?бухари/i,
    slug: 'bukhari',
    label: 'Сахих аль-Бухари',
    isnadSlug: 'sahih-al-buhari',
  },
  {
    rx: /(?:сахих\s+)?муслим/i,
    slug: 'muslim',
    label: 'Сахих Муслим',
    isnadSlug: 'sahih-muslim',
  },
  {
    rx: /(?:сунан\s+)?(?:ат-)?тирмизи/i,
    slug: 'tirmidhi',
    label: 'Сунан ат-Тирмизи',
    isnadSlug: 'sunan-at-tirmizi',
  },
  {
    rx: /(?:сунан\s+)?абу\s+да(?:в|у)д/i,
    slug: 'abudawud',
    label: 'Сунан Абу Дауд',
    isnadSlug: 'sunan-abu-dauda',
  },
  {
    rx: /(?:сунан\s+)?(?:ан-?)?насаи/i,
    slug: 'nasai',
    label: 'Сунан ан-Насаи',
    isnadSlug: 'sunan-an-nasai',
  },
  {
    rx: /(?:сунан\s+)?ибн\s+маджа/i,
    slug: 'ibnmajah',
    label: 'Сунан Ибн Маджа',
    isnadSlug: 'sunan-ibn-madzhah',
  },
  {
    rx: /(?:муватта\s+)?малик/i,
    slug: 'malik',
    label: 'Муватта Малика',
    isnadSlug: null,
  },
  {
    rx: /(?:муснад\s+)?ахмад/i,
    slug: 'ahmad',
    label: 'Муснад Ахмада',
    isnadSlug: null,
  },
  {
    rx: /(?:ан-?навави|навави)/i,
    slug: 'nawawi40',
    label: '40 хадисов ан-Навави',
    isnadSlug: 'al-arbauna-an-nawawiyya',
  },
  {
    rx: /рияд\s+ас-?салихин/i,
    slug: 'riyadussalihin',
    label: 'Рияд ас-Салихин',
    isnadSlug: 'riyadh-as-salikhin',
  },
];

const HADITH_SOURCES_RX_STR = HADITH_SOURCES.map((s) => s.rx.source).join('|');

const MASTER_RX = new RegExp(
  // Группы:
  //  1: hadith source
  //  2: hadith number
  //  3: quran surah
  //  4: quran ayat
  //  5: quran ayat end (опц., для диапазона типа 92:5-7)
  `((?:${HADITH_SOURCES_RX_STR}))\\s+(\\d+)` +
    `|` +
    `(?<![\\d:])(\\d{1,3}):(\\d{1,3})(?:-(\\d{1,3}))?(?![\\d:])`,
  'giu'
);

export function parseReferences(text) {
  if (!text) return [];
  const segments = [];
  let lastIdx = 0;
  let m;
  MASTER_RX.lastIndex = 0;
  while ((m = MASTER_RX.exec(text)) !== null) {
    const matchStart = m.index;
    const matchEnd = m.index + m[0].length;
    if (matchStart > lastIdx) {
      segments.push({ type: 'text', text: text.slice(lastIdx, matchStart) });
    }
    if (m[1] && m[2]) {
      const sourceName = m[1].trim();
      const number = parseInt(m[2], 10);
      const sourceMeta = HADITH_SOURCES.find((s) => s.rx.test(sourceName));
      if (sourceMeta) {
        segments.push({
          type: 'hadith',
          text: m[0],
          ref: {
            source: sourceMeta.slug,
            label: sourceMeta.label,
            number,
            // Обратная совместимость со старым кодом, ожидающим .url
            url: sunnahUrl(sourceMeta.slug, number),
            urls: {
              sunnah: sunnahUrl(sourceMeta.slug, number),
              isnad: isnadUrl(sourceMeta.isnadSlug, number),
            },
          },
        });
      } else {
        segments.push({ type: 'text', text: m[0] });
      }
    } else if (m[3] && m[4]) {
      const surah = parseInt(m[3], 10);
      const ayat = parseInt(m[4], 10);
      const ayatEnd = m[5] ? parseInt(m[5], 10) : null;
      if (surah >= 1 && surah <= 114 && ayat >= 1 && ayat <= 286) {
        segments.push({ type: 'quran', text: m[0], ref: { surah, ayat, ayatEnd } });
      } else {
        segments.push({ type: 'text', text: m[0] });
      }
    } else {
      segments.push({ type: 'text', text: m[0] });
    }
    lastIdx = matchEnd;
  }
  if (lastIdx < text.length) {
    segments.push({ type: 'text', text: text.slice(lastIdx) });
  }
  return segments;
}

export function hadithSourceLabel(slug) {
  return HADITH_SOURCES.find((s) => s.slug === slug)?.label || slug;
}

export function hadithSourceMeta(slug) {
  return HADITH_SOURCES.find((s) => s.slug === slug) || null;
}

export function sunnahUrl(slug, number) {
  return `https://sunnah.com/${slug}:${number}`;
}

// isnad.link не поддерживает deep-link на конкретный номер хадиса, но
// мы строим ссылку на ГЛАВУ, в диапазон которой попадает этот номер
// (см. карту в data/isnadChapters.js). Иначе — на страницу сборника,
// или, если и сборника на isnad нет, — на каталог.
export function isnadUrl(isnadSlug, hadithNumber) {
  if (!isnadSlug) return 'https://isnad.link/';
  if (hadithNumber) {
    const chapter = findIsnadChapter(isnadSlug, hadithNumber);
    if (chapter) return `https://isnad.link/book/${isnadSlug}/${chapter}`;
  }
  return `https://isnad.link/book/${isnadSlug}`;
}

// Возвращает {from, to, slug} главы для подсказки «найдите № N в диапазоне X-Y»
export function findIsnadChapterRange(isnadSlug, hadithNumber) {
  if (!isnadSlug || !hadithNumber) return null;
  const chapters = isnadChapters && isnadChapters[isnadSlug];
  if (!chapters) return null;
  for (const [from, to, slug] of chapters) {
    if (hadithNumber >= from && hadithNumber <= to) return { from, to, slug };
  }
  return null;
}

// Выбор URL под выбранный сервис
export function hadithUrlForService(ref, service) {
  if (!ref) return null;
  const urls = ref.urls || { sunnah: ref.url, isnad: null };
  if (service === 'isnad') return urls.isnad || urls.sunnah;
  return urls.sunnah;
}

export function quranComUrl(surah, ayat) {
  return `https://quran.com/${surah}:${ayat}`;
}
