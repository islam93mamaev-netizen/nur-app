// Парсер арабского слова на отдельные «слоги» (буква + её огласовка).
// Используется для разбора слова по буквам — как слоги в русском языке.
//
// Принцип: проходим по строке слева направо (Unicode-порядок == логический).
// - Буквы — обычные арабские символы.
// - Харакаты (огласовки) — combining-символы, прикрепляются к предыдущей букве.
// - Tatweel, ZWJ, ZWNJ — игнорируем.
//
// На основе позиции в слове и того, соединяется ли предыдущая буква слева,
// определяем форму буквы: isolated / initial / medial / final.

import { letters as alphabetLetters } from '../data/alphabet';

// Буквы, которые НЕ соединяются слева (после них всегда «разрыв»).
const NON_CONNECTING_LEFT = new Set([
  'ا', 'ﺍ', 'ﺎ',           // алиф
  'د', 'ﺩ', 'ﺪ',           // даль
  'ذ', 'ﺫ', 'ﺬ',           // заль
  'ر', 'ﺭ', 'ﺮ',           // ра
  'ز', 'ﺯ', 'ﺰ',           // зайн
  'و', 'ﻭ', 'ﻮ',           // уау
  'ؤ',                       // хамза на уау
  'إ', 'أ', 'آ', 'ٱ',       // хамза на алифе / алиф-васла
  'ء',                       // отдельная хамза
  'ة',                       // та-марбута (тоже не соединяется слева)
  'ى',                       // алиф-максура
]);

// Карта для нормализации хамзованных алифов к базовой букве для поиска
const NORMALIZE = {
  'أ': 'ا', 'إ': 'ا', 'آ': 'ا',
  'ٱ': 'ا', // алиф-васла (частый в Коране: ٱللَّه, ٱلرَّحْمَٰن)
  'ؤ': 'و',
  'ئ': 'ي',
  'ى': 'ي',
  'ة': 'ت',
};

// Базовые латинские транскрипции каждой буквы (для построения слогов)
const LETTER_TRANSLIT = {
  'ا': 'ā', 'أ': 'a', 'إ': 'i', 'آ': 'ā', 'ء': 'ʾ', 'ٱ': 'a',
  'ب': 'b', 'ت': 't', 'ث': 'ṯ',
  'ج': 'j', 'ح': 'ḥ', 'خ': 'ḫ',
  'د': 'd', 'ذ': 'ḏ',
  'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'š',
  'ص': 'ṣ', 'ض': 'ḍ',
  'ط': 'ṭ', 'ظ': 'ẓ',
  'ع': 'ʿ', 'غ': 'ġ',
  'ف': 'f', 'ق': 'q',
  'ك': 'k', 'ل': 'l',
  'م': 'm', 'ن': 'n',
  'ه': 'h', 'ة': 'h',
  'و': 'w', 'ي': 'y',
  'ؤ': 'ʾ', 'ئ': 'ʾ', 'ى': 'ā',
};

// Харакаты и их транскрипции
const HARAKAT = {
  'َ': 'a',  // فتحة (фатха)
  'ُ': 'u',  // ضمة (дамма)
  'ِ': 'i',  // كسرة (касра)
  'ْ': '',   // سكون (сукун — нет гласного)
  'ً': 'an', // فتحتان (танвин фатхи)
  'ٌ': 'un', // ضمتان (танвин даммы)
  'ٍ': 'in', // كسرتان (танвин касры)
  'ّ': 'ː',  // شدة (шадда — удвоение)
};

const HARAKAT_NAMES = {
  'َ': 'фатха',
  'ُ': 'дамма',
  'ِ': 'касра',
  'ْ': 'сукун',
  'ً': 'танвин-фатха',
  'ٌ': 'танвин-дамма',
  'ٍ': 'танвин-касра',
  'ّ': 'шадда',
};

const TATWEEL = 'ـ';
const ZWJ = '‍';
const ZWNJ = '‌';

// Проверка — символ ли это харакат (combining diacritical)
function isHarakat(ch) {
  const code = ch.charCodeAt(0);
  return code >= 0x064B && code <= 0x0652;
}

// Проверка — арабская буква?
function isArabicLetter(ch) {
  const code = ch.charCodeAt(0);
  return code >= 0x0621 && code <= 0x064A;
}

// Получить русское имя буквы из нашей базы
function getLetterMeta(ch) {
  const normalized = NORMALIZE[ch] || ch;
  const meta = alphabetLetters.find((l) => l.letter === normalized || l.letter === ch);
  if (meta) {
    return { name: meta.name, tr: meta.tr };
  }
  // Fallback для хамзы и др.
  const fallbackNames = {
    'أ': 'Хамза (на алифе сверху)',
    'إ': 'Хамза (на алифе снизу)',
    'آ': 'Алиф с маддой',
    'ؤ': 'Хамза на уау',
    'ئ': 'Хамза на йа',
    'ة': 'Та-марбута',
    'ى': 'Алиф-максура',
    'ء': 'Хамза',
  };
  return { name: fallbackNames[ch] || ch, tr: LETTER_TRANSLIT[ch] || '?' };
}

// Определить форму буквы по позиции в слове
function getForm(letterObj, idx, allLetters) {
  const isFirst = idx === 0;
  const isLast = idx === allLetters.length - 1;
  const prev = idx > 0 ? allLetters[idx - 1] : null;
  const prevConnectsLeft = prev && !NON_CONNECTING_LEFT.has(prev.letter);

  if (isFirst && isLast) return 'isolated';
  if (isFirst) return NON_CONNECTING_LEFT.has(letterObj.letter) ? 'isolated' : 'initial';
  if (isLast) return prevConnectsLeft ? 'final' : 'isolated';
  if (prevConnectsLeft) {
    return NON_CONNECTING_LEFT.has(letterObj.letter) ? 'final' : 'medial';
  }
  return NON_CONNECTING_LEFT.has(letterObj.letter) ? 'isolated' : 'initial';
}

const FORM_LABELS = {
  isolated: 'отдельная',
  initial: 'начальная',
  medial: 'средняя',
  final: 'конечная',
};

// Получить визуальную форму буквы (как она выглядит в данной позиции)
function getVisualForm(letter, form) {
  const meta = alphabetLetters.find((l) => l.letter === letter || NORMALIZE[letter] === l.letter);
  if (meta?.forms) {
    return meta.forms[form] || letter;
  }
  return letter;
}

// Главная функция: разбить слово на буквы со всей информацией
export function parseArabicWord(word) {
  if (!word) return [];

  // Шаг 1: собираем буквы и их харакаты
  const raw = [];
  for (const ch of word) {
    if (ch === TATWEEL || ch === ZWJ || ch === ZWNJ || ch === ' ') continue;
    if (isHarakat(ch)) {
      if (raw.length > 0) {
        raw[raw.length - 1].harakat += ch;
      }
      continue;
    }
    raw.push({ letter: ch, harakat: '' });
  }

  // Шаг 2: обогащаем — форма, имя, транскрипция слога
  return raw.map((item, idx) => {
    const form = getForm(item, idx, raw);
    const visual = getVisualForm(item.letter, form);
    const meta = getLetterMeta(item.letter);
    const letterTr = LETTER_TRANSLIT[item.letter] || meta.tr || '?';

    // Построим транскрипцию слога: буква + гласный из харакатов
    let syllable = letterTr;
    let harakatNames = [];
    let hasShadda = false;
    let vowel = '';
    let isSilent = false;
    let isTanwin = false;

    for (const h of item.harakat) {
      if (h === 'ّ') {
        hasShadda = true;
      } else if (h === 'ْ') {
        isSilent = true;
      } else {
        const v = HARAKAT[h];
        if (v && (v === 'an' || v === 'un' || v === 'in')) {
          vowel = v;
          isTanwin = true;
        } else if (v) {
          vowel = v;
        }
      }
      const name = HARAKAT_NAMES[h];
      if (name) harakatNames.push(name);
    }

    if (hasShadda) syllable = letterTr + letterTr;
    syllable += vowel;

    return {
      letter: item.letter,
      visual,
      form,
      formLabel: FORM_LABELS[form],
      name: meta.name,
      letterTr,
      harakat: item.harakat,
      harakatNames,
      vowel,
      syllable,
      isSilent,
      isTanwin,
      hasShadda,
    };
  });
}

// Утилита: чистая транскрипция всего слова (склейка слогов)
export function transliterate(word) {
  const parsed = parseArabicWord(word);
  return parsed.map((p) => p.syllable).join('');
}

// Разбивка арабского текста на «смысловые куски» для озвучки по частям:
// по коранич. знакам остановки, пунктуации и переносам строк.
// Единая реализация (раньше дублировалась в экранах азкаров и урока намаза).
export function splitArabic(text) {
  if (!text) return [];
  const parts = text
    .split(/(?<=[ۚۖۗۘۙۛۜ،.!?۝])\s*|(\n+)/)
    .map((s) => (s || '').trim())
    .filter((s) => s.length > 0);
  return parts.length ? parts : [text];
}
