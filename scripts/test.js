// Мини-тесты чистых утилит без тестового фреймворка: `npm test`.
// ESM-модули проекта загружаются упрощённым лоадером (срезаем import/export),
// зависимости подставляются вручную. Для React-компонентов не подходит —
// только для чистых функций (hijri, suraTexts, prayerService).

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');

// Загрузка ESM-файла: убираем import/export, инжектим зависимости, возвращаем имена
function loadModule(file, injects, returnNames) {
  let code = fs.readFileSync(path.join(ROOT, file), 'utf8');
  code = code.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];\s*$/gm, '');
  code = code.replace(/^export default[\s\S]*?;\s*$/m, '');
  code = code.replace(/^export /gm, '');
  const body = `${code}\n;return { ${returnNames.join(', ')} };`;
  // eslint-disable-next-line no-new-func
  const fn = new Function(...Object.keys(injects), body);
  return fn(...Object.values(injects));
}

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓', name);
  } catch (e) {
    failed++;
    console.log('  ✗', name, '—', e.message);
  }
}

// ===== utils/hijri =====
console.log('\nutils/hijri.js');
const hijri = loadModule('src/utils/hijri.js', {}, ['gregorianToHijri', 'formatHijri', 'HIJRI_MONTHS']);

test('12 месяцев в списке', () => assert.strictEqual(hijri.HIJRI_MONTHS.length, 12));

test('11 марта 2024 = 1 Рамадан 1445', () => {
  // Совпадает с календарём Умм аль-Кура; табличный алгоритм может
  // отклоняться от наблюдения луны на ±1 день — это норма.
  const h = hijri.gregorianToHijri(new Date(2024, 2, 11));
  assert.deepStrictEqual(h, { year: 1445, month: 9, day: 1 });
});

test('gregorianToHijri не зависит от времени суток и TZ', () => {
  const morning = hijri.gregorianToHijri(new Date(2024, 2, 12, 0, 5));
  const evening = hijri.gregorianToHijri(new Date(2024, 2, 12, 23, 55));
  assert.deepStrictEqual(morning, evening);
});

test('16 июня 2026 ≈ начало Мухаррама 1448 (новый год)', () => {
  const h = hijri.gregorianToHijri(new Date(2026, 5, 16));
  // Арифметический календарь допускает ±1 день: либо конец 1447, либо начало 1448
  assert.ok(
    (h.year === 1448 && h.month === 1) || (h.year === 1447 && h.month === 12),
    `получено ${h.year}/${h.month}/${h.day}`
  );
});

test('formatHijri возвращает строку с годом и «г.х.»', () => {
  const s = hijri.formatHijri(new Date(2024, 2, 15));
  assert.ok(s.includes('1445') && s.includes('г.х.'), s);
});

// ===== data/suraTexts (через data/quran) =====
console.log('\ndata/suraTexts.js');
const quran = loadModule('src/data/quran.js', {}, ['surahs']);
const suraTexts = loadModule(
  'src/data/suraTexts.js',
  { surahs: quran.surahs },
  ['getSuraBlock', 'getProtectiveSurasBlock', 'AYAT_KURSI_TEXT', 'LAST_BAQARAH_TEXT']
);

test('getSuraBlock(112) собирает аль-Ихляс', () => {
  const b = suraTexts.getSuraBlock(112);
  assert.ok(b.ar.includes('قُلْ هُوَ'), 'нет арабского текста');
  assert.ok(b.tr.includes('Куль'), 'нет кириллической транскрипции');
  assert.ok(b.ru.length > 50, 'перевод подозрительно короткий');
});

test('блок трёх сур содержит все три', () => {
  const p = suraTexts.getProtectiveSurasBlock();
  for (const part of ['Аль-Ихлас', 'Аль-Фаляк', 'Ан-Нас']) {
    assert.ok(p.tr.includes(part), `нет ${part}`);
  }
  assert.strictEqual(p.ar.split('\n').length, 3);
});

test('аят аль-Курси и 2:285-286 — полные', () => {
  assert.ok(suraTexts.AYAT_KURSI_TEXT.ar.length > 300, 'аль-Курси обрезан');
  assert.ok(suraTexts.LAST_BAQARAH_TEXT.ar.includes('٢٨٦'), 'нет второго аята');
  assert.ok(!/\.\.\.$/.test(suraTexts.AYAT_KURSI_TEXT.tr), 'транскрипция обрезана');
});

// ===== data/arabicPath =====
console.log('\ndata/arabicPath.js');
const alphabet = loadModule('src/data/alphabet.js', {}, ['letters', 'letterGroups', 'hamza']);
const harakatMod = loadModule('src/data/harakat.js', {}, ['harakat']);
const wordsMod = loadModule('src/data/words.js', {}, ['words']);
const grammarMod = loadModule('src/data/grammar.js', {}, ['grammarLessons']);
const arabicPath = loadModule(
  'src/data/arabicPath.js',
  {
    letters: alphabet.letters,
    letterGroups: alphabet.letterGroups,
    hamza: alphabet.hamza,
    harakat: harakatMod.harakat,
    words: wordsMod.words,
    grammarLessons: grammarMod.grammarLessons,
    surahs: quran.surahs,
  },
  ['pathStages', 'allUnits', 'getNextUnit', 'isUnitUnlocked', 'buildUnitQuiz', 'getLettersOfUnit', 'getWordsOfUnit', 'getSyllableSamples']
);

test('путь содержит 5 этапов и 20+ шагов', () => {
  assert.strictEqual(arabicPath.pathStages.length, 5);
  assert.ok(arabicPath.allUnits.length >= 20, `шагов: ${arabicPath.allUnits.length}`);
});

test('все ссылки на буквы и слова резолвятся', () => {
  for (const u of arabicPath.allUnits) {
    if (u.type === 'letters') {
      assert.strictEqual(arabicPath.getLettersOfUnit(u).length, u.letters.length, `битые буквы в ${u.id}`);
    }
    if (u.type === 'words') {
      assert.strictEqual(arabicPath.getWordsOfUnit(u).length, u.words.length, `битые слова в ${u.id}`);
    }
  }
});

test('линейная разблокировка работает', () => {
  const first = arabicPath.allUnits[0];
  const second = arabicPath.allUnits[1];
  assert.ok(arabicPath.isUnitUnlocked(first.id, {}), 'первый шаг должен быть открыт');
  assert.ok(!arabicPath.isUnitUnlocked(second.id, {}), 'второй шаг должен быть закрыт');
  assert.ok(arabicPath.isUnitUnlocked(second.id, { [first.id]: true }), 'второй открывается после первого');
  assert.strictEqual(arabicPath.getNextUnit({}).id, first.id);
});

test('тесты шагов: 4 варианта, ответ среди них', () => {
  for (const u of arabicPath.allUnits) {
    const quiz = arabicPath.buildUnitQuiz(u);
    if (['letters', 'harakat', 'words', 'syllables', 'review'].includes(u.type)) {
      assert.ok(quiz.length >= 2, `мало вопросов в ${u.id}`);
      for (const q of quiz) {
        assert.strictEqual(q.options.length, 4, `не 4 варианта в ${u.id}`);
        assert.ok(q.options.includes(q.answer), `ответа нет среди вариантов в ${u.id}`);
      }
    }
  }
});

test('слоговый тренажёр: примеры собираются', () => {
  const samples = arabicPath.getSyllableSamples();
  assert.ok(samples.length >= 8, `букв в тренажёре: ${samples.length}`);
  for (const row of samples) {
    assert.strictEqual(row.syllables.length, 3, `не 3 слога у ${row.letterName}`);
    for (const s of row.syllables) assert.ok(s.ar && s.ru);
  }
});

// ===== services/prayerService (через adhan) =====
console.log('\nservices/prayerService.js');
const adhan = require('adhan');
const prayer = loadModule(
  'src/services/prayerService.js',
  {
    CalculationMethod: adhan.CalculationMethod,
    Coordinates: adhan.Coordinates,
    PrayerTimes: adhan.PrayerTimes,
    Madhab: adhan.Madhab,
    HighLatitudeRule: adhan.HighLatitudeRule,
  },
  ['getPrayerTimes', 'getNextPrayer', 'PRAYER_NAMES_RU', 'MECCA_COORDS']
);

test('времена намазов в Мекке идут по порядку', () => {
  const t = prayer.getPrayerTimes({ ...prayer.MECCA_COORDS });
  assert.ok(t.fajr < t.sunrise && t.sunrise < t.dhuhr && t.dhuhr < t.asr && t.asr < t.maghrib && t.maghrib < t.isha);
});

test('getNextPrayer возвращает намаз (не восход) в будущем', () => {
  const next = prayer.getNextPrayer({ ...prayer.MECCA_COORDS });
  assert.ok(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(next.name), next.name);
  assert.ok(next.time > new Date(Date.now() - 60000), 'время в прошлом');
  assert.ok(prayer.PRAYER_NAMES_RU[next.name], 'нет русского названия');
});

// ===== Итог =====
console.log(`\n${passed} прошло, ${failed} упало`);
process.exit(failed ? 1 : 0);
