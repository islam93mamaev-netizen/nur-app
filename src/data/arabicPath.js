// «Путь арабского» — направляемая дорожка обучения с нуля до чтения Корана.
// Собирается из УЖЕ существующего контента (alphabet, harakat, words, grammar,
// quran) — здесь только структура этапов и генерация мини-тестов.
//
// Линейная разблокировка: шаг открывается после прохождения предыдущего.
// Прогресс хранится в progressStore.completedPathUnits.

import { letters, letterGroups } from './alphabet';
import { harakat } from './harakat';
import { words } from './words';
import { grammarLessons } from './grammar';
import { surahs } from './quran';

// ===== Помощники =====

const lettersById = Object.fromEntries(letters.map((l) => [l.id, l]));
const wordsById = Object.fromEntries(words.map((w) => [w.id, w]));

export function getLettersOfUnit(unit) {
  return (unit.letters || []).map((id) => lettersById[id]).filter(Boolean);
}

export function getWordsOfUnit(unit) {
  return (unit.words || []).map((id) => wordsById[id]).filter(Boolean);
}

export function getHarakatOfUnit(unit) {
  return (unit.harakat || []).map((id) => harakat.find((h) => h.id === id)).filter(Boolean);
}

// Топ-50 самых частых слов Корана — батчами по 10
const topWords = [...words]
  .filter((w) => (w.freq || 0) > 0)
  .sort((a, b) => (b.freq || 0) - (a.freq || 0))
  .slice(0, 50);

const wordBatches = [];
for (let i = 0; i < topWords.length; i += 10) {
  wordBatches.push(topWords.slice(i, i + 10).map((w) => w.id));
}

// ===== Слоговый тренажёр =====
// Буквы с «чистым» однобуквенным русским звуком — для слогов буква+огласовка.
const SYLLABLE_LETTER_SOUNDS = {
  l2: 'б',  // ب
  l3: 'т',  // ت
  l8: 'д',  // د
  l10: 'р', // ر
  l12: 'с', // س
  l20: 'ф', // ف
  l22: 'к', // ك
  l23: 'л', // ل
  l24: 'м', // م
  l25: 'н', // ن
};
// Три коротких гласных: знак хараката → русский звук
const SHORT_VOWELS = [
  { id: 'h1', ru: 'а' }, // фатха
  { id: 'h2', ru: 'и' }, // касра
  { id: 'h3', ru: 'у' }, // дамма
];

export function getSyllableSamples() {
  // Примеры для обучения: каждая буква с тремя огласовками
  const out = [];
  for (const [lid, cons] of Object.entries(SYLLABLE_LETTER_SOUNDS)) {
    const letter = lettersById[lid];
    if (!letter) continue;
    out.push({
      letterName: letter.name,
      syllables: SHORT_VOWELS.map((v) => {
        const h = harakat.find((x) => x.id === v.id);
        return { ar: letter.letter + (h?.sign || ''), ru: cons + v.ru };
      }),
    });
  }
  return out;
}

// ===== Структура пути =====

export const pathStages = [
  {
    id: 'st_letters',
    title: 'Буквы',
    desc: '28 букв алфавита группами по форме',
    color: '#1E7B5F',
    units: letterGroups.map((g) => ({
      id: `pl_${g.id}`,
      type: 'letters',
      title: g.title,
      subtitle: g.description,
      letters: g.letters,
    })),
  },
  {
    id: 'st_harakat',
    title: 'Огласовки',
    desc: 'Учимся читать: знаки гласных',
    color: '#C9A55B',
    units: [
      {
        id: 'ph_1',
        type: 'harakat',
        title: 'Фатха, касра, дамма',
        subtitle: 'Три коротких гласных',
        harakat: harakat.slice(0, 3).map((h) => h.id),
      },
      {
        id: 'ph_2',
        type: 'harakat',
        title: 'Сукун, шадда и остальные',
        subtitle: 'Остальные знаки + танвины',
        harakat: harakat.slice(3).map((h) => h.id),
      },
      {
        id: 'ph_3',
        type: 'syllables',
        title: 'Тренажёр слогов',
        subtitle: 'Буква + огласовка = читаем слог',
      },
    ],
  },
  {
    id: 'st_words',
    title: 'Первые 50 слов',
    desc: 'Самые частые слова Корана — больше половины текста',
    color: '#3D6E94',
    units: [
      ...wordBatches.map((batch, i) => ({
        id: `pw_${i + 1}`,
        type: 'words',
        title: `Слова ${i * 10 + 1}–${i * 10 + batch.length}`,
        subtitle: 'Запомните 10 слов и пройдите проверку',
        words: batch,
      })),
      {
        id: 'pw_review',
        type: 'review',
        title: 'Большое повторение',
        subtitle: 'Случайные слова из всех 50 — закрепляем',
        words: topWords.map((w) => w.id),
      },
    ],
  },
  {
    id: 'st_grammar',
    title: 'Базовая грамматика',
    desc: 'Уровень A1 — первые конструкции',
    color: '#A68641',
    units: grammarLessons
      .filter((l) => l.level === 'a1')
      .map((l) => ({
        id: `pg_${l.id}`,
        type: 'grammar',
        title: l.title,
        subtitle: 'Откройте урок, изучите и отметьте пройденным',
        lessonId: l.id,
      })),
  },
  {
    id: 'st_quran',
    title: 'Читаем Коран',
    desc: 'Короткие суры — слушайте и следите за текстом',
    color: '#B23A48',
    units: [112, 113, 114, 103, 1]
      .map((id) => surahs.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => ({
        id: `ps_${s.id}`,
        type: 'sura',
        title: `Сура «${s.name}»`,
        subtitle: `${s.ayatCount} аят. — ${s.translation}`,
        surahId: s.id,
      })),
  },
];

// Плоский список шагов (для линейной разблокировки)
export const allUnits = pathStages.flatMap((s) => s.units);

export function findUnit(unitId) {
  for (const stage of pathStages) {
    const unit = stage.units.find((u) => u.id === unitId);
    if (unit) return { stage, unit };
  }
  return null;
}

// Следующий непройденный шаг (для кнопки «Продолжить»)
export function getNextUnit(completed = {}) {
  return allUnits.find((u) => !completed[u.id]) || null;
}

// Разблокирован ли шаг: первый — всегда, дальше — после предыдущего
export function isUnitUnlocked(unitId, completed = {}) {
  const idx = allUnits.findIndex((u) => u.id === unitId);
  if (idx <= 0) return idx === 0;
  return !!completed[allUnits[idx - 1].id];
}

// ===== Генерация мини-тестов =====

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOptions(correct, pool, n = 4) {
  const others = shuffle(pool.filter((x) => x !== correct)).slice(0, n - 1);
  return shuffle([correct, ...others]);
}

// Тест шага. Возвращает [{ prompt, promptAr?, options: [..], answer }]
// prompt — текст вопроса, promptAr — крупный арабский (если есть).
export function buildUnitQuiz(unit) {
  if (unit.type === 'letters') {
    const unitLetters = getLettersOfUnit(unit);
    const allNames = letters.map((l) => l.name);
    const qs = unitLetters.map((l) => ({
      prompt: 'Как называется эта буква?',
      promptAr: l.letter,
      options: pickOptions(l.name, allNames),
      answer: l.name,
    }));
    // Обратные вопросы: название → буква
    const reverse = shuffle(unitLetters).slice(0, 2).map((l) => ({
      prompt: `Найдите букву «${l.name}»`,
      promptAr: null,
      options: pickOptions(l.letter, letters.map((x) => x.letter)),
      answer: l.letter,
      arabicOptions: true,
    }));
    // Контекстные формы: буква в начале/середине/конце выглядит иначе —
    // именно это сложнее всего при чтении настоящего текста.
    const FORM_LABELS = { initial: 'в начале слова', medial: 'в середине слова', final: 'в конце слова' };
    const formQs = shuffle(unitLetters)
      .map((l) => {
        const keys = shuffle(['initial', 'medial', 'final'])
          .filter((k) => l.forms?.[k] && l.forms[k] !== l.forms.isolated);
        if (!keys.length) return null;
        const k = keys[0];
        return {
          prompt: `Какая это буква (${FORM_LABELS[k]})?`,
          promptAr: l.forms[k],
          options: pickOptions(l.name, allNames),
          answer: l.name,
        };
      })
      .filter(Boolean)
      .slice(0, 3);
    return shuffle([...qs, ...reverse, ...formQs]).slice(0, 8);
  }

  if (unit.type === 'syllables') {
    // Слог = буква + короткая гласная. Варианты: та же буква с другими
    // гласными + та же гласная с другой буквой (самые частые ошибки).
    const entries = Object.entries(SYLLABLE_LETTER_SOUNDS);
    const qs = [];
    const used = new Set();
    while (qs.length < 10 && used.size < entries.length * SHORT_VOWELS.length) {
      const [lid, cons] = entries[Math.floor(Math.random() * entries.length)];
      const v = SHORT_VOWELS[Math.floor(Math.random() * SHORT_VOWELS.length)];
      const key = lid + v.id;
      if (used.has(key)) continue;
      used.add(key);
      const letter = lettersById[lid];
      const h = harakat.find((x) => x.id === v.id);
      if (!letter || !h) continue;
      const answer = cons + v.ru;
      const sameLetter = SHORT_VOWELS.filter((x) => x.id !== v.id).map((x) => cons + x.ru);
      const otherCons = shuffle(entries.filter(([id]) => id !== lid))[0][1] + v.ru;
      qs.push({
        prompt: 'Прочитайте слог',
        promptAr: letter.letter + h.sign,
        options: shuffle([answer, ...sameLetter, otherCons]),
        answer,
      });
    }
    return qs;
  }

  if (unit.type === 'review') {
    // Большое повторение: случайные слова из всего списка
    const pool = (unit.words || []).map((id) => wordsById[id]).filter(Boolean);
    const allRu = words.map((w) => w.ru);
    return shuffle(pool)
      .slice(0, 10)
      .map((w) => ({
        prompt: 'Что означает это слово?',
        promptAr: w.ar,
        options: pickOptions(w.ru, allRu),
        answer: w.ru,
      }));
  }

  if (unit.type === 'harakat') {
    const items = getHarakatOfUnit(unit);
    const allNames = harakat.map((h) => h.name);
    return shuffle(
      items.map((h) => ({
        prompt: `Какой это знак? (${h.ru})`,
        promptAr: h.onLetter,
        options: pickOptions(h.name, allNames),
        answer: h.name,
      }))
    );
  }

  if (unit.type === 'words') {
    const unitWords = getWordsOfUnit(unit);
    const allRu = words.map((w) => w.ru);
    return shuffle(
      unitWords.map((w) => ({
        prompt: 'Что означает это слово?',
        promptAr: w.ar,
        options: pickOptions(w.ru, allRu),
        answer: w.ru,
      }))
    ).slice(0, 8);
  }

  // grammar и sura — без теста, завершаются вручную после изучения
  return [];
}
