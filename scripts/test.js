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
  ['getPrayerTimes', 'getNextPrayer', 'PRAYER_NAMES_RU', 'MECCA_COORDS', 'formatTime']
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

// ===== data/cities (ручной выбор местоположения) =====
console.log('\ndata/cities.js');
const citiesMod = loadModule('src/data/cities.js', {}, ['cities', 'findCity', 'citiesByCountry']);

test('у всех городов корректные координаты и уникальные id', () => {
  const ids = new Set();
  for (const c of citiesMod.cities) {
    assert.ok(!ids.has(c.id), `дубль id ${c.id}`);
    ids.add(c.id);
    assert.ok(Math.abs(c.latitude) <= 90 && Math.abs(c.longitude) <= 180, `координаты ${c.id}`);
  }
});

test('все часовые пояса существуют в ICU', () => {
  for (const c of citiesMod.cities) {
    assert.doesNotThrow(
      () => new Date().toLocaleTimeString('ru-RU', { timeZone: c.tz }),
      `неизвестный пояс ${c.tz} у ${c.id}`
    );
  }
});

test('поиск и группировка по странам', () => {
  const ru = citiesMod.citiesByCountry('казань');
  assert.strictEqual(ru.length, 1);
  assert.strictEqual(ru[0].title, 'Россия');
  const by = citiesMod.citiesByCountry('беларусь');
  assert.ok(by[0].data.some((c) => c.id === 'minsk'));
  assert.strictEqual(citiesMod.citiesByCountry('xyz-нет-такого').length, 0);
});

test('formatTime показывает время в поясе выбранного города', () => {
  const d = new Date(Date.UTC(2026, 0, 1, 12, 0)); // 12:00 UTC
  assert.strictEqual(prayer.formatTime(d, 'Europe/Moscow'), '15:00');
  assert.strictEqual(prayer.formatTime(d, 'Asia/Almaty').length, 5);
  assert.ok(prayer.formatTime(d, 'Нет/Такого').length === 5, 'неизвестный пояс должен падать на время устройства');
});

// ===== Целостность данных (контент) =====
// Ловит ошибки в data-файлах: дубли id, пустые обязательные поля,
// ссылки на несуществующие экраны, хадисы без источника.
console.log('\nЦелостность данных');
const babel = require('@babel/core');
const Module = require('module');
const esmCache = {};
// ESM → CJS через babel; всё, что не data/constants/utils, подменяется заглушкой
function loadEsm(rel) {
  const abs = path.resolve(ROOT, rel.endsWith('.js') ? rel : rel + '.js');
  if (esmCache[abs]) return esmCache[abs].exports;
  const { code } = babel.transformFileSync(abs, {
    babelrc: false, configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const m = new Module(abs);
  esmCache[abs] = m;
  m.require = (req) => {
    const ok = req.startsWith('.') && /\/(data|constants|utils)\//.test(path.resolve(path.dirname(abs), req) + '/');
    if (req.startsWith('.') && (ok || /\/src\/(data|constants|utils)\//.test(path.resolve(path.dirname(abs), req)))) {
      return loadEsm(path.relative(ROOT, path.resolve(path.dirname(abs), req)));
    }
    const stub = new Proxy(function () {}, { get: (t, k) => (k === '__esModule' ? true : stub), apply: () => stub });
    return stub;
  };
  m._compile(code, abs);
  return m.exports;
}

const dataDir = path.join(ROOT, 'src/data');
const dataFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('.js'));
const loaded = {};
test(`все ${dataFiles.length} data-файлов загружаются`, () => {
  for (const f of dataFiles) loaded[f] = loadEsm('src/data/' + f);
});

test('нет дублей id внутри списков', () => {
  const problems = [];
  for (const [f, mod] of Object.entries(loaded)) {
    for (const [name, val] of Object.entries(mod)) {
      if (!Array.isArray(val)) continue;
      const seen = new Set();
      for (const it of val) {
        if (!it || typeof it !== 'object' || it.id == null) continue;
        if (seen.has(it.id)) problems.push(`${f}:${name} → ${it.id}`);
        seen.add(it.id);
      }
    }
  }
  assert.deepStrictEqual(problems, []);
});

const HADITH_SETS = [['hadiths.js', 'hadiths'], ['arbain.js', 'arbainHadiths']];
test('у каждого хадиса есть источник и текст', () => {
  const bad = [];
  for (const [f, key] of HADITH_SETS) {
    const list = loaded[f] && loaded[f][key];
    assert.ok(Array.isArray(list), `${f}: нет экспорта ${key}`);
    for (const h of list) {
      const id = h.id ?? h.n;
      if (!String(h.source || '').trim()) bad.push(`${f}:${id} без источника`);
      if (!String(h.text || h.ru || '').trim()) bad.push(`${f}:${id} без текста`);
    }
  }
  assert.deepStrictEqual(bad, []);
});

test('FAQ: вопрос, ответ, мазхаб и существующая категория', () => {
  const { faqs, faqCategories } = loaded['faq.js'];
  const cats = new Set(faqCategories.map((c) => c.id));
  const bad = faqs.filter((q) => !q.question || !q.answer || !q.mazhabNote || !cats.has(q.category)).map((q) => q.id);
  assert.deepStrictEqual(bad, []);
});

// Зарегистрированные экраны (stack + вкладки)
const navSrc = ['src/navigation/RootNavigator.js', 'src/navigation/TabNavigator.js']
  .map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
const ROUTES = new Set([...navSrc.matchAll(/name="([A-Za-z]+)"/g)].map((m) => m[1]));

test('кнопки главной ведут на существующие экраны', () => {
  const { HOME_SECTIONS } = loaded['homeSections.js'];
  const bad = HOME_SECTIONS.flatMap((s) => s.items).filter((i) => !ROUTES.has(i.route)).map((i) => i.route);
  assert.deepStrictEqual(bad, []);
});

test('сунны дня ссылаются на существующие экраны', () => {
  const bad = loaded['sunnahDaily.js'].sunnahDaily.filter((s) => s.refRoute && !ROUTES.has(s.refRoute)).map((s) => s.refRoute);
  assert.deepStrictEqual(bad, []);
});

const { hadithGrade } = loadEsm('src/utils/hadithGrade.js');
test('степень хадиса: Бухари/Муслим → сахих, иначе только явно', () => {
  assert.strictEqual(hadithGrade({ source: 'Бухари 8, Муслим 16' }).id, 'sahih');
  assert.strictEqual(hadithGrade({ source: 'Тирмизи 2516' }), null);
  assert.strictEqual(hadithGrade({ source: 'Тирмизи', grade: 'hasan' }).id, 'hasan');
  assert.strictEqual(hadithGrade({ source: 'передан как хасан' }).id, 'hasan');
});

// Отчёт для проверки знающим человеком (не ошибка)
const ungraded = HADITH_SETS
  .flatMap(([f, k]) => (loaded[f]?.[k] || []).filter((h) => !hadithGrade(h)).map((h) => `${k}:${h.id ?? h.n} (${h.source})`));
if (ungraded.length) {
  console.log(`  ℹ хадисов без указанной степени: ${ungraded.length} — ждут проверки`);
  if (process.env.VERBOSE) ungraded.forEach((u) => console.log('     ·', u));
}

// ===== Итог =====
console.log(`\n${passed} прошло, ${failed} упало`);
process.exit(failed ? 1 : 0);
