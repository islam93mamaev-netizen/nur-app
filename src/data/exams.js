// Тематические тесты и общий экзамен.
// Каждый тест содержит подборку вопросов по теме (или общую выборку).
// Формат совпадает с quizzes.js — поддерживаются типы:
//   choice | match | audio | sequence | fill

import { words } from './words';
import { ethicsPools, ethicsPoolInfo } from './ethicsQuestions';
import { siraPools, siraPoolInfo } from './siraQuestions';
import { prophetsPools, prophetsPoolInfo } from './prophetsQuestions';
import { tajwidPools, tajwidPoolInfo } from './tajwidQuestions';
import { sahabaPools, sahabaPoolInfo } from './sahabaQuestions';
import { examPools, buildMasterPool, buildWordsPool } from './examPools';

// Утилита: создать аудио-вопрос «что означает слово»
function audioWordQ(word) {
  // 3 случайных дистрактора того же типа
  const sameCat = words.filter((w) => w.category === word.category && w.id !== word.id);
  const distractors = shuffle(sameCat).slice(0, 3).map((w) => w.ru);
  const options = shuffle([word.ru, ...distractors]);
  return {
    type: 'audio',
    q: `Что означает: ${word.ar}?`,
    options,
    answer: options.indexOf(word.ru),
  };
}

function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

// =========================
// Тесты по отдельным разделам
// =========================

export const exams = {
  // ----- Общий экзамен (микс по всем темам) -----
  master: {
    title: 'Общий экзамен',
    icon: '🎓',
    description: 'Вопросы по основам Ислама, Корану, хадисам, словам и алфавиту',
    color: '#0F4C3A',
    difficulty: 'Все темы',
    level: 'advanced',
    get pool() { return buildMasterPool(); }, // динамический пул, каждый раз свежий
    pickCount: 20,
    questions: [
      // Основы
      { type: 'choice', q: 'Сколько столпов Ислама?',
        options: ['3', '5', '6', '7'], answer: 1 },
      { type: 'choice', q: 'Сколько столпов имана (веры)?',
        options: ['5', '6', '7', '8'], answer: 1 },
      { type: 'choice', q: 'Размер закята:',
        options: ['1%', '2,5%', '5%', '10%'], answer: 1 },
      // Коран
      { type: 'choice', q: 'Сколько сур в Коране?',
        options: ['100', '110', '114', '120'], answer: 2 },
      { type: 'choice', q: 'Какая сура начинается с «Скажи: Он — Аллах Единый»?',
        options: ['Аль-Фатиха', 'Аль-Ихлас', 'Аль-Каусар', 'Ан-Нас'], answer: 1 },
      // Хадисы
      { type: 'choice', q: 'Первый хадис в сборнике ан-Навави о…',
        options: ['Намазе', 'Намерениях', 'Закяте', 'Хадже'], answer: 1 },
      { type: 'choice', q: 'Самые авторитетные сборники хадисов:',
        options: ['Бухари и Муслим', 'Тирмизи и Ибн Маджа', 'Ан-Насаи и Абу Дауд', 'Малик и Ахмад'], answer: 0 },
      // Алфавит
      { type: 'choice', q: 'Сколько букв в арабском алфавите?',
        options: ['26', '27', '28', '30'], answer: 2 },
      { type: 'choice', q: 'Какие буквы НЕ соединяются со следующей?',
        options: ['ا د ذ ر ز و', 'ب ت ث ج', 'س ش ص ض', 'م ن ل ك'], answer: 0 },
      // Слова
      { type: 'audio', q: 'Что означает: ٱللَّه?',
        options: ['Свет', 'Аллах', 'Книга', 'Сердце'], answer: 1 },
      { type: 'audio', q: 'Что означает: نُور?',
        options: ['Огонь', 'Свет', 'Сердце', 'Земля'], answer: 1 },
      { type: 'audio', q: 'Что означает: صَلَاة?',
        options: ['Пост', 'Молитва', 'Хадж', 'Закят'], answer: 1 },
      { type: 'audio', q: 'Что означает: قَلْب?',
        options: ['Знание', 'Сердце', 'Душа', 'Огонь'], answer: 1 },
      // Намаз
      { type: 'choice', q: 'Сколько ракятов в Фаджре?',
        options: ['2', '3', '4', '5'], answer: 0 },
      { type: 'choice', q: 'Что читается в каждом ракяте?',
        options: ['Аль-Ихлас', 'Аль-Фатиха', 'Аль-Бакара', 'Йа-син'], answer: 1 },
    ],
  },

  // ----- Тест по основам Ислама -----
  foundations: {
    title: 'Основы Ислама',
    icon: '🌙',
    description: 'Проверка знаний об Аллахе, Исламе, столпах веры',
    color: '#0F4C3A',
    difficulty: 'Базовый',
    level: 'beginner',
    pool: examPools.foundations,
    pickCount: 12,
    questions: [
      { type: 'choice', q: 'Что означает «Ислам»?',
        options: ['Покорность и мир', 'Война', 'Молитва', 'Книга'], answer: 0 },
      { type: 'choice', q: 'Что означает «тавхид»?',
        options: ['Покаяние', 'Единобожие', 'Очищение', 'Молитва'], answer: 1 },
      { type: 'choice', q: 'Сколько столпов Ислама?', options: ['4','5','6','7'], answer: 1 },
      { type: 'choice', q: 'Сколько столпов имана?', options: ['5','6','7','8'], answer: 1 },
      { type: 'sequence', q: 'Расставьте столпы Ислама по порядку',
        items: ['Шахада', 'Намаз', 'Закят', 'Пост', 'Хадж'],
        answer: [0,1,2,3,4] },
      { type: 'match', q: 'Соедините',
        pairs: [
          { left: 'Аллах', right: 'Единый Творец' },
          { left: 'Мухаммад ﷺ', right: 'Последний посланник' },
          { left: 'Коран', right: 'Слово Аллаха' },
          { left: 'Кааба', right: 'Дом в Мекке' },
        ] },
      { type: 'fill', q: 'Свидетельство веры называется __________.',
        options: ['Шахада', 'Закят', 'Хадж', 'Намаз'], answer: 0 },
      { type: 'choice', q: 'Сколько лет ниспосылался Коран?',
        options: ['10', '13', '23', '40'], answer: 2 },
    ],
  },

  // ----- Тест по Корану -----
  quran: {
    title: 'Коран',
    icon: '📖',
    description: 'Структура, суры, ниспослание',
    color: '#1E7B5F',
    difficulty: 'Средний',
    level: 'intermediate',
    pool: examPools.quran,
    pickCount: 12,
    questions: [
      { type: 'choice', q: 'Сколько сур в Коране?', options: ['100','110','114','120'], answer: 2 },
      { type: 'choice', q: 'Сколько джузов?', options: ['7','20','30','40'], answer: 2 },
      { type: 'choice', q: 'Самая длинная сура?',
        options: ['Аль-Фатиха','Аль-Бакара','Йа-син','Ан-Нас'], answer: 1 },
      { type: 'choice', q: 'Какая сура НЕ начинается с «Бисмиллях»?',
        options: ['Аль-Фатиха','Ат-Тауба','Аль-Ихлас','Ан-Нас'], answer: 1 },
      { type: 'choice', q: 'Где первое откровение?',
        options: ['Кааба','Медина','Пещера Хира','Гора Тур'], answer: 2 },
      { type: 'choice', q: 'Какая сура говорит о Единстве Аллаха коротко?',
        options: ['Аль-Фатиха','Аль-Ихлас','Аль-Каусар','Ан-Наср'], answer: 1 },
      { type: 'fill', q: 'Заучивание Корана наизусть называется __________.',
        options: ['Хифз','Хадж','Тафсир','Тарджима'], answer: 0 },
      { type: 'match', q: 'Соедините суру и тему',
        pairs: [
          { left: 'Аль-Ихлас', right: 'Единобожие' },
          { left: 'Аль-Фаляк', right: 'Защита от зла' },
          { left: 'Ан-Нас', right: 'Защита от шайтана' },
          { left: 'Аль-Аср', right: 'Время и убыток' },
        ] },
    ],
  },

  // ----- Тест по хадисам -----
  hadiths: {
    title: 'Хадисы',
    icon: '📜',
    description: 'Сборники, достоверность, известные хадисы',
    color: '#C9A55B',
    difficulty: 'Средний',
    pool: examPools.hadiths,
    pickCount: 12,
    level: 'intermediate',
    questions: [
      { type: 'choice', q: 'Хадис — это:',
        options: ['Сура Корана', 'Слова/действия пророка ﷺ', 'Молитва', 'Книга по фикху'],
        answer: 1 },
      { type: 'choice', q: 'Цепочка передатчиков хадиса:',
        options: ['Матн', 'Иснад', 'Сахих', 'Даиф'], answer: 1 },
      { type: 'choice', q: 'Самые авторитетные сборники:',
        options: ['Бухари и Муслим', 'Малик и Ахмад', 'Тирмизи и Абу Дауд', 'Ибн Маджа и Насаи'],
        answer: 0 },
      { type: 'choice', q: 'Сколько хадисов в сборнике имама ан-Навави?',
        options: ['20','30','40','50'], answer: 2 },
      { type: 'match', q: 'Соедините категорию хадиса и описание',
        pairs: [
          { left: 'Сахих', right: 'Достоверный' },
          { left: 'Хасан', right: 'Хороший' },
          { left: 'Даиф', right: 'Слабый' },
          { left: 'Мавду', right: 'Выдуманный' },
        ] },
      { type: 'choice', q: 'Первый хадис в сборнике ан-Навави о:',
        options: ['Молитве','Намерениях','Хадже','Посте'], answer: 1 },
      { type: 'fill', q: '«Религия — это __________» (хадис от Тамима ад-Дари)',
        options: ['искренность','знание','молитва','пост'], answer: 0 },
    ],
  },

  // ----- Тест по словам -----
  words: {
    title: 'Арабские слова',
    icon: '🔤',
    description: 'Самые частые слова Корана',
    color: '#3D6E94',
    difficulty: 'Базовый',
    level: 'beginner',
    get pool() { return buildWordsPool(20); }, // 20 случайных слов каждый раз
    pickCount: 10,
    questions: [
      audioWordQ(words.find((w) => w.id === 'a1')),  // Аллах
      audioWordQ(words.find((w) => w.id === 'a3')),  // Ар-Рахман
      audioWordQ(words.find((w) => w.id === 'n3')),  // Нур
      audioWordQ(words.find((w) => w.id === 'r17')), // Китаб
      audioWordQ(words.find((w) => w.id === 'n6')),  // Калб
      audioWordQ(words.find((w) => w.id === 'r3')),  // Салят
      audioWordQ(words.find((w) => w.id === 'n7')),  // Сабр
      audioWordQ(words.find((w) => w.id === 't1')),  // Лайл
      audioWordQ(words.find((w) => w.id === 'pl1')), // Аль-Ард
      audioWordQ(words.find((w) => w.id === 'pl2')), // Ас-Сама
      { type: 'match', q: 'Соедините слово и перевод',
        pairs: [
          { left: 'سَلَام', right: 'Мир' },
          { left: 'صَبْر', right: 'Терпение' },
          { left: 'يَوْم', right: 'День' },
          { left: 'بَيْت', right: 'Дом' },
        ] },
    ].filter(Boolean),
  },

  // ----- Тест по алфавиту -----
  alphabet: {
    title: 'Алфавит',
    icon: '✏️',
    description: 'Буквы, их формы и звуки',
    color: '#B23A48',
    difficulty: 'Базовый',
    level: 'beginner',
    pool: examPools.alphabet,
    pickCount: 10,
    questions: [
      { type: 'choice', q: 'Сколько букв в арабском алфавите?',
        options: ['26','27','28','29'], answer: 2 },
      { type: 'choice', q: 'Какая буква не соединяется со следующей?',
        options: ['ب','د','س','ك'], answer: 1 },
      { type: 'choice', q: 'Сколько форм у обычной буквы (по позиции в слове)?',
        options: ['2','3','4','5'], answer: 2 },
      { type: 'choice', q: 'Какой знак удваивает букву?',
        options: ['Фатха','Сукун','Шадда','Танвин'], answer: 2 },
      { type: 'choice', q: 'Что обозначает сукун?',
        options: ['Удлинение','Удвоение','Отсутствие гласного','«ан» в конце'], answer: 2 },
      { type: 'match', q: 'Соедините букву и звук',
        pairs: [
          { left: 'ب', right: 'б' },
          { left: 'ت', right: 'т' },
          { left: 'م', right: 'м' },
          { left: 'ن', right: 'н' },
        ] },
      { type: 'audio', q: 'Какая это буква: ج?',
        options: ['Х','Дж','Кх','Г'], answer: 1 },
      { type: 'audio', q: 'Какая это буква: ق?',
        options: ['Глубокая К','Обычная К','Г','Х'], answer: 0 },
      { type: 'fill', q: 'Огласовка «и» сверху/снизу буквы — это __________.',
        options: ['Фатха','Касра','Дамма','Сукун'], answer: 1 },
    ],
  },

  // ----- Тест по практике (намаз, омовение и т.д.) -----
  practice: {
    title: 'Практика мусульманина',
    icon: '🕌',
    description: 'Намаз, омовение, дуа, пост, хадж',
    color: '#3D6E94',
    pool: examPools.practice,
    pickCount: 12,
    difficulty: 'Базовый',
    level: 'beginner',
    questions: [
      { type: 'choice', q: 'Сколько обязательных намазов в день?',
        options: ['3','4','5','7'], answer: 2 },
      { type: 'choice', q: 'Сколько ракятов в Зухре?',
        options: ['2','3','4','5'], answer: 2 },
      { type: 'choice', q: 'Сколько ракятов в Магрибе?',
        options: ['2','3','4','5'], answer: 1 },
      { type: 'sequence', q: 'Этапы омовения по порядку',
        items: ['Намерение','Кисти рук','Рот и нос','Лицо','Руки до локтей','Голова','Ноги'],
        answer: [0,1,2,3,4,5,6] },
      { type: 'choice', q: 'В каком месяце предписан пост?',
        options: ['Шавваль','Рамадан','Раджаб','Зу-ль-Хиджа'], answer: 1 },
      { type: 'choice', q: 'Главный обряд хаджа — это:',
        options: ['Таваф','Стояние на Арафате','Бросание камней','Сай'], answer: 1 },
      { type: 'choice', q: 'С какой стороны начинают мыть руки и ноги?',
        options: ['С левой','С правой','Не важно','Одновременно'], answer: 1 },
    ],
  },

  // ============================================================
  // 99 ИМЁН АЛЛАХА — 3 уровня сложности
  // ============================================================

  // ----- 1. Новичок: узнавание самых известных имён -----
  asma_beginner: {
    title: '99 имён — Знакомство',
    icon: '🌱',
    description: 'Самые известные имена Аллаха — простые вопросы',
    color: '#2E7D5B',
    difficulty: 'Новичок',
    level: 'beginner',
    questions: [
      { type: 'choice', q: 'Что означает «Ар-Рахман» (الرَّحْمَٰن)?',
        options: ['Прощающий','Милостивый','Великий','Знающий'], answer: 1 },
      { type: 'choice', q: 'Что означает «Аль-Малик» (الْمَلِك)?',
        options: ['Свет','Творец','Владыка','Истина'], answer: 2 },
      { type: 'choice', q: 'Что означает «Ан-Нур» (النُّور)?',
        options: ['Свет','Огонь','Дорога','Знание'], answer: 0 },
      { type: 'choice', q: 'Какое имя означает «Творец»?',
        options: ['Аль-Карим','Аль-Халик','Аль-Хаким','Аль-Ваcи'], answer: 1 },
      { type: 'choice', q: 'Какое имя означает «Прощающий»?',
        options: ['Аль-Гафур','Аль-Самад','Аль-Кадир','Ар-Раззак'], answer: 0 },
      { type: 'choice', q: 'Какое имя означает «Дающий пропитание»?',
        options: ['Аль-Карим','Ар-Раззак','Аль-Ваххаб','Аль-Мухсин'], answer: 1 },
      { type: 'match', q: 'Соедините имя и перевод',
        pairs: [
          { left: 'الرَّحِيم', right: 'Милосердный' },
          { left: 'السَّلَام', right: 'Источник мира' },
          { left: 'الْعَلِيم', right: 'Всезнающий' },
          { left: 'السَّمِيع', right: 'Всеслышащий' },
        ] },
      { type: 'audio', q: 'Какое это имя: الْبَصِير?',
        options: ['Всеслышащий','Всевидящий','Всезнающий','Прощающий'], answer: 1 },
      { type: 'audio', q: 'Какое это имя: الْحَيّ?',
        options: ['Вечный','Живой','Единый','Мудрый'], answer: 1 },
      { type: 'choice', q: 'Сколько прекрасных имён у Аллаха?',
        options: ['77','88','99','110'], answer: 2 },
      { type: 'fill', q: 'Имя «__________» означает «Единый, не имеющий подобия».',
        options: ['Аль-Ахад','Аль-Кахар','Аль-Карим','Аль-Хаким'], answer: 0 },
    ],
  },

  // ----- 2. Средний: значения, связи, источники -----
  asma_intermediate: {
    title: '99 имён — Атрибуты и связи',
    icon: '⚖️',
    description: 'Парные имена, тонкие смыслы и источники в Коране',
    color: '#0F4C3A',
    difficulty: 'Средний',
    level: 'intermediate',
    questions: [
      { type: 'choice', q: 'Чем отличаются Ар-Рахман и Ар-Рахим?',
        options: [
          'Это одно и то же',
          'Ар-Рахман — милость ко всем; Ар-Рахим — особая милость к верующим',
          'Ар-Рахман в этой жизни; Ар-Рахим только в Раю',
          'Ар-Рахман только для пророков',
        ], answer: 1 },
      { type: 'choice', q: 'Какое имя из 99 встречается в начале каждой суры (кроме одной)?',
        options: ['Аль-Малик','Ар-Рахман','Аль-Алим','Аль-Хаким'], answer: 1 },
      { type: 'choice', q: 'В аяте «Аят аль-Курси» (2:255) употребляются два имени:',
        options: [
          'Аль-Гафур, Ар-Рахим',
          'Аль-Хайй, Аль-Кайюм',
          'Аль-Малик, Ас-Самад',
          'Аль-Карим, Ар-Раззак',
        ], answer: 1 },
      { type: 'match', q: 'Соедините имена-пары противоположностей',
        pairs: [
          { left: 'Аль-Авваль', right: 'Аль-Ахир' },
          { left: 'Аль-Захир', right: 'Аль-Батин' },
          { left: 'Аль-Кабид', right: 'Аль-Басит' },
          { left: 'Аль-Мухьи', right: 'Аль-Мумит' },
        ] },
      { type: 'choice', q: 'Что означает «Ас-Самад» (الصَّمَد)?',
        options: [
          'Тот, кто никогда не спит',
          'Самодостаточный, в ком все нуждаются',
          'Самый высокий',
          'Самый щедрый',
        ], answer: 1 },
      { type: 'choice', q: 'Какое имя означает «Принимающий покаяние»?',
        options: ['Аль-Гаффар','Ат-Таввab','Аль-Афув','Ар-Рахим'], answer: 1 },
      { type: 'match', q: 'Соедините имя и краткий смысл',
        pairs: [
          { left: 'Аль-Хабир', right: 'Сведущий в деталях' },
          { left: 'Аль-Латиф', right: 'Тонко-сострадательный' },
          { left: 'Аль-Халим', right: 'Кроткий, не торопящий наказание' },
          { left: 'Аль-Хафиз', right: 'Хранящий и оберегающий' },
        ] },
      { type: 'choice', q: 'Какое имя означает «Свет небес и земли» (24:35)?',
        options: ['Ан-Нур','Ан-Нафи','Аль-Хади','Ан-Насир'], answer: 0 },
      { type: 'fill', q: 'Имя «__________» означает «Тот, чья сила непоколебима».',
        options: ['Аль-Кавий','Аль-Ваду','Аль-Гани','Аль-Афув'], answer: 0 },
      { type: 'choice', q: 'Какое имя из 99 описывает Его как «Видящего тончайшие детали»?',
        options: ['Аль-Латиф','Аль-Алим','Аль-Хаким','Ар-Ракиб'], answer: 0 },
      { type: 'audio', q: 'Какое это имя: الْغَفُور?',
        options: ['Прощающий','Кроткий','Терпеливый','Богатый'], answer: 0 },
      { type: 'audio', q: 'Какое это имя: الْكَرِيم?',
        options: ['Щедрый','Сильный','Мудрый','Любящий'], answer: 0 },
    ],
  },

  // ============================================================
  // ЭТИКА И ПРАВА (3 теста)
  // ============================================================

  rights_basic: {
    title: 'Права в Исламе — основы',
    icon: '⚖️',
    description: 'Права женщин, родителей, детей, супругов, соседей',
    color: '#B23A48',
    difficulty: 'Новичок',
    level: 'beginner',
    pool: ethicsPools.beginner,                 // 45+ вопросов в пуле (адаб + права)
    pickCount: ethicsPoolInfo.beginner.pick,    // 15 случайных за попытку
    questions: [
      { type: 'choice', q: 'Сколько раз в хадисе пророк ﷺ упомянул мать прежде отца?',
        options: ['1','2','3','4'], answer: 2 },
      { type: 'choice', q: 'С какого возраста ребёнка следует приказывать к намазу?',
        options: ['С 5','С 7','С 10','С 14'], answer: 1 },
      { type: 'choice', q: 'Брак без согласия женщины — это:',
        options: ['Допустимо','Требует только согласия отца','Недействителен','Действителен с махром'], answer: 2 },
      { type: 'choice', q: 'Чьё имущество принадлежит замужней женщине?',
        options: ['Принадлежит мужу','Принадлежит ей самой','Совместное','Принадлежит отцу'], answer: 1 },
      { type: 'choice', q: 'Кто из родителей имеет приоритет в доброте по хадису?',
        options: ['Отец','Мать','Оба равно','Старший'], answer: 1 },
      { type: 'choice', q: 'Махр (свадебный дар) — это:',
        options: ['Подарок жене (её собственность)','Налог государству','Подарок родителям жены','Долг жены мужу'], answer: 0 },
      { type: 'match', q: 'Соедините категорию и их главное право',
        pairs: [
          { left: 'Сосед', right: 'Не причинять вреда' },
          { left: 'Жена', right: 'Нафака от мужа' },
          { left: 'Родители', right: 'Доброе обращение' },
          { left: 'Дети', right: 'Хорошее имя' },
        ] },
      { type: 'fill', q: 'Финансовое обеспечение семьи мужем называется __________.',
        options: ['Нафака','Махр','Закят','Садака'], answer: 0 },
      { type: 'choice', q: 'Что делать с родителями-немусульманами?',
        options: ['Отречься','Быть добрым, но не подчиняться им в харам','Подчиняться во всём','Не общаться'], answer: 1 },
      { type: 'choice', q: 'Аборт по шариату:',
        options: ['Всегда разрешён','Запрещён без шариатских причин','Разрешён до 7 месяца','Разрешён по желанию мужа'], answer: 1 },
    ],
  },

  ethics_basic: {
    title: 'Этика мусульманина',
    icon: '🌿',
    description: 'Адаб речи, еды, одежды, общения, торговли',
    color: '#2E7D5B',
    difficulty: 'Средний',
    level: 'intermediate',
    pool: ethicsPools.intermediate,           // 45+ вопросов в пуле
    pickCount: ethicsPoolInfo.intermediate.pick, // 15 случайных за попытку
    questions: [
      { type: 'choice', q: 'Что такое гиба?',
        options: [
          'Враньё в лицо',
          'Сказать о человеке за глаза то, что ему не понравилось бы (если правда)',
          'Молитва за грешника',
          'Клятва ложная',
        ], answer: 1 },
      { type: 'choice', q: 'Сколько раз пророк ﷺ сказал «Клянусь Аллахом, не уверует!» о соседе?',
        options: ['1','2','3','5'], answer: 2 },
      { type: 'choice', q: 'Какой рукой следует есть?',
        options: ['Левой','Правой','Любой','Только в перчатках'], answer: 1 },
      { type: 'choice', q: 'Что говорят перед едой?',
        options: ['Альхамдулиллях','Бисмиллях','СубханАллах','Ля иляха илляЛлах'], answer: 1 },
      { type: 'choice', q: 'Что говорят после еды?',
        options: ['Альхамдулиллях','Бисмиллях','СубханАллах','Машаалла'], answer: 0 },
      { type: 'choice', q: 'Кто кому первым приветствует?',
        options: [
          'Стоящий — сидящему',
          'Сидящий — стоящему',
          'Идущий — сидящему',
          'Старший — младшему',
        ], answer: 2 },
      { type: 'choice', q: 'Что такое риба?',
        options: [
          'Любая прибыль',
          'Проценты с займа',
          'Налог государству',
          'Закят с торговли',
        ], answer: 1 },
      { type: 'choice', q: 'Что запрещено мужчинам носить?',
        options: ['Серебряное кольцо','Чистый шёлк и золото','Белую одежду','Чалму'], answer: 1 },
      { type: 'match', q: 'Соедините термин и значение',
        pairs: [
          { left: 'Халяль', right: 'Разрешённое' },
          { left: 'Харам', right: 'Запретное' },
          { left: 'Мушбух', right: 'Сомнительное' },
          { left: 'Адаб', right: 'Этикет' },
        ] },
      { type: 'choice', q: 'Сколько раз стучать в дверь при посещении?',
        options: ['1','3 (максимум)','5','Пока не откроют'], answer: 1 },
      { type: 'fill', q: 'Кто верует в Аллаха и Последний день, пусть говорит __________ или молчит.',
        options: ['благое','правду','много','тихо'], answer: 0 },
      { type: 'choice', q: 'Признаки лицемера (по хадису) — это…',
        options: [
          'Молится только на людях',
          'Лжёт, не выполняет обещаний, предаёт доверие',
          'Носит особую одежду',
          'Постится без намерения',
        ], answer: 1 },
    ],
  },

  ethics_advanced: {
    title: 'Этика и фикх — сложные вопросы',
    icon: '📜',
    description: 'Тонкие моменты адаба, спорные случаи, мнения мазхабов',
    color: '#063326',
    difficulty: 'Сложный',
    level: 'advanced',
    pool: ethicsPools.advanced,                 // 45+ вопросов в пуле
    pickCount: ethicsPoolInfo.advanced.pick,    // 15 случайных за попытку
    questions: [
      { type: 'choice', q: 'В каких случаях допустима «ложь» по сунне?',
        options: [
          'Никогда',
          'В торговле для прибыли',
          'На войне, для примирения, в комплименте супругу',
          'Перед родителями',
        ], answer: 2 },
      { type: 'choice', q: 'Гиба допустима только при:',
        options: [
          'Шутке',
          'Жалобе угнетённого, свидетельстве, фетве, предупреждении',
          'Беседе с друзьями',
          'Не допустима никогда',
        ], answer: 1 },
      { type: 'choice', q: 'Сколько процентов наследства получает мать одновременно с живым отцом?',
        options: ['1/2','1/3','1/6','2/3'], answer: 2 },
      { type: 'choice', q: 'Слово «уфф» (тьфу) родителям — какой статус?',
        options: ['Разрешено','Макрух (нежелательно)','Запрещено Кораном','Нейтрально'], answer: 2 },
      { type: 'choice', q: 'Какая фраза стирает грехи между двумя мусульманами по хадису?',
        options: ['Поцелуй','Рукопожатие','Объятие','Дуа'], answer: 1 },
      { type: 'choice', q: 'Кому из мазхабов не нужен уали (опекун) для совершеннолетней женщины при браке?',
        options: ['Шафиʿи','Малики','Ханбали','Ханафи'], answer: 3 },
      { type: 'match', q: 'Соедините число степеней опасности гибы',
        pairs: [
          { left: 'Если правда', right: 'Гиба' },
          { left: 'Если ложь', right: 'Бухтан (клевета)' },
          { left: 'Передача между двумя', right: 'Намима (донос)' },
          { left: 'Без причины', right: 'Запретно всегда' },
        ] },
      { type: 'choice', q: 'Какие альтернативы риба в исламской экономике?',
        options: [
          'Только дарение',
          'Мурабаха, иджара, мушарака',
          'Бартер',
          'Запрещены любые сделки',
        ], answer: 1 },
      { type: 'choice', q: 'Что сказал пророк ﷺ о торговце, обманывающем покупателя?',
        options: [
          'Аллах простит',
          'Кто обманывает нас — не из нас',
          'Заплатит штраф',
          'Лишится одной руки',
        ], answer: 1 },
      { type: 'choice', q: 'Махр — это:',
        options: [
          'Деньги, которые жена даёт мужу',
          'Свадебный дар мужа жене, её собственность',
          'Калым родителям жены',
          'Подарок гостям на свадьбе',
        ], answer: 1 },
      { type: 'fill', q: 'Принцип «Нет послушания творению в __________ Творца»',
        options: ['ослушании','любви','поклонении','подражании'], answer: 0 },
    ],
  },

  // ----- 3. Сложный: тонкие различия и углублённые смыслы -----
  asma_advanced: {
    title: '99 имён — Углублённый экзамен',
    icon: '🏆',
    description: 'Тонкие различия, источники, контекст в Коране и хадисах',
    color: '#063326',
    difficulty: 'Сложный',
    level: 'advanced',
    questions: [
      { type: 'choice', q: 'В каком хадисе говорится о 99 именах?',
        options: [
          'Бухари 2736, Муслим 2677',
          'Тирмизи 1234',
          'Абу Дауд 567',
          'Ан-Насаи 890',
        ], answer: 0 },
      { type: 'choice', q: 'Что означает арабский глагол «أَحْصَى» в хадисе («кто перечислит»)?',
        options: [
          'Только повторить вслух 99 раз',
          'Перечислить, понять смысл, и жить по ним',
          'Записать в книге',
          'Заучить наизусть',
        ], answer: 1 },
      { type: 'choice', q: 'Имя «Аль-Джаббар» (الْجَبَّار) имеет несколько значений. Какое НЕ относится?',
        options: [
          'Тот, кому подчиняется всё',
          'Исцелитель сломленных сердец',
          'Тот, кто высоко возвышен',
          'Тот, кто требует выплаты долга силой у людей',
        ], answer: 3 },
      { type: 'choice', q: 'Имена «Аль-Мукаддим» и «Аль-Муаххир» означают:',
        options: [
          'Тот, кто видит прошлое и будущее',
          'Тот, кто выдвигает и отодвигает по Своей мудрости',
          'Первый и последний пророк',
          'Восход и закат',
        ], answer: 1 },
      { type: 'choice', q: 'Какое имя из 99 относится к названию суры?',
        options: ['Ар-Рахман','Аль-Малик','Аль-Карим','Ан-Нур'], answer: 0 },
      { type: 'choice', q: 'Имя «Аль-Куддӯс» (القُدُّوس) означает:',
        options: [
          'Святой, чистый от любых недостатков',
          'Создатель Иерусалима',
          'Тот, кто принимает приношения',
          'Творец святых',
        ], answer: 0 },
      { type: 'match', q: 'Соедините имя и сферу проявления',
        pairs: [
          { left: 'Аль-Барр', right: 'Источник всякого блага' },
          { left: 'Аль-Адль', right: 'Совершенная справедливость' },
          { left: 'Аль-Хакам', right: 'Окончательное решение' },
          { left: 'Аль-Муксит', right: 'Воздаяние каждому по справедливости' },
        ] },
      { type: 'choice', q: 'В аяте 57:3 упоминаются 4 имени Аллаха одно за другим. Какие?',
        options: [
          'Аль-Авваль, Аль-Ахир, Аз-Захир, Аль-Батин',
          'Аль-Малик, Аль-Куддӯс, Ас-Салям, Аль-Му́мин',
          'Аль-Гафур, Ар-Рахим, Аль-Вадӯд, Аль-Карим',
          'Аль-Алим, Аль-Хаким, Ас-Самиʿ, Аль-Басир',
        ], answer: 0 },
      { type: 'choice', q: 'Имя «Аль-Му́мин» (الْمُؤْمِن) применительно к Аллаху означает:',
        options: [
          'Верующий в Себя',
          'Дарующий безопасность и подтверждающий истину',
          'Принимающий веру людей',
          'Создающий веру в сердцах',
        ], answer: 1 },
      { type: 'choice', q: 'Имена «Аль-Хафид» и «Ар-Рафиʿ» — это:',
        options: [
          'Имена пророков',
          'Принижающий и Возвышающий — пара',
          'Названия ангелов',
          'Этапы Судного дня',
        ], answer: 1 },
      { type: 'match', q: 'Соедините имя и аят-источник',
        pairs: [
          { left: 'Ас-Самад', right: 'Сура «Аль-Ихлас», 112:2' },
          { left: 'Аль-Кайюм', right: 'Сура «Аль-Бакара», 2:255' },
          { left: 'Аль-Малик', right: 'Сура «Аль-Хашр», 59:23' },
          { left: 'Ар-Раззак', right: 'Сура «Аз-Зарийат», 51:58' },
        ] },
      { type: 'choice', q: 'Сколько раз имя «Аллах» упоминается в Коране (приблизительно)?',
        options: ['~500','~1500','~2700','~5000'], answer: 2 },
      { type: 'fill', q: 'Имя «__________» означает «Тот, к кому возвращается всё после исчезновения творений».',
        options: ['Аль-Варис','Аль-Баки','Аль-Ваджид','Аль-Маджид'], answer: 0 },
      { type: 'choice', q: 'Какое из имён НЕ упоминается в Коране дословно, но взято из достоверной Сунны?',
        options: ['Ар-Рашид','Аль-Алим','Ар-Рахман','Аль-Малик'], answer: 0 },
    ],
  },

  // ============================================================
  // СИРА ПРОРОКА ﷺ (3 теста)
  // ============================================================

  sira_beginner: {
    title: 'Сира Пророка ﷺ — основы',
    icon: '🌟',
    description: 'Рождение, детство, первое откровение, Хиджра, смерть',
    color: '#B23A48',
    difficulty: 'Новичок',
    level: 'beginner',
    pool: siraPools.beginner,
    pickCount: siraPoolInfo.beginner.pick,
    questions: siraPools.beginner.slice(0, 10),
  },

  sira_intermediate: {
    title: 'Сира Пророка ﷺ — углубление',
    icon: '🕌',
    description: 'Призыв, Исра ва Миʿрадж, битвы (Бадр, Ухуд, Хандак), договоры',
    color: '#1E7B5F',
    difficulty: 'Средний',
    level: 'intermediate',
    pool: siraPools.intermediate,
    pickCount: siraPoolInfo.intermediate.pick,
    questions: siraPools.intermediate.slice(0, 10),
  },

  sira_advanced: {
    title: 'Сира Пророка ﷺ — детали',
    icon: '📜',
    description: 'Тонкости: имена сподвижников, договоры, хронология, цитаты',
    color: '#0F4C3A',
    difficulty: 'Сложный',
    level: 'advanced',
    pool: siraPools.advanced,
    pickCount: siraPoolInfo.advanced.pick,
    questions: siraPools.advanced.slice(0, 12),
  },

  // ============================================================
  // 25 ПРОРОКОВ (3 теста)
  // ============================================================

  prophets_beginner: {
    title: '25 пророков — основы',
    icon: '👤',
    description: 'Адам, Нух, Ибрахим, Муса, Иса, Мухаммад ﷺ — главные факты',
    color: '#A68641',
    difficulty: 'Новичок',
    level: 'beginner',
    pool: prophetsPools.beginner,
    pickCount: prophetsPoolInfo.beginner.pick,
    questions: prophetsPools.beginner.slice(0, 10),
  },

  prophets_intermediate: {
    title: '25 пророков — народы и чудеса',
    icon: '🌊',
    description: 'Адиты, Семуд, Бани Исраиль, Улю-ль-азм, чудеса пророков',
    color: '#C9A55B',
    difficulty: 'Средний',
    level: 'intermediate',
    pool: prophetsPools.intermediate,
    pickCount: prophetsPoolInfo.intermediate.pick,
    questions: prophetsPools.intermediate.slice(0, 10),
  },

  prophets_advanced: {
    title: '25 пророков — детали',
    icon: '🌟',
    description: 'Тонкости: Хидр, Зуль-Кифль, имена детей и жён, точные хронологии',
    color: '#063326',
    difficulty: 'Сложный',
    level: 'advanced',
    pool: prophetsPools.advanced,
    pickCount: prophetsPoolInfo.advanced.pick,
    questions: prophetsPools.advanced.slice(0, 10),
  },

  // ============================================================
  // ТАДЖВИД (3 теста)
  // ============================================================

  tajwid_beginner: {
    title: 'Таджвид — введение',
    icon: '📿',
    description: 'Что такое таджвид, махрадж, основные правила нуун сакин',
    color: '#3D6E94',
    difficulty: 'Новичок',
    level: 'beginner',
    pool: tajwidPools.beginner,
    pickCount: tajwidPoolInfo.beginner.pick,
    questions: tajwidPools.beginner.slice(0, 6),
  },

  tajwid_intermediate: {
    title: 'Таджвид — правила',
    icon: '🔤',
    description: 'Иклаб, Ихфа, Калькаля, виды Мадда, Сакта, Раʾ',
    color: '#1E7B5F',
    difficulty: 'Средний',
    level: 'intermediate',
    pool: tajwidPools.intermediate,
    pickCount: tajwidPoolInfo.intermediate.pick,
    questions: tajwidPools.intermediate.slice(0, 6),
  },

  tajwid_advanced: {
    title: 'Таджвид — детали',
    icon: '🌙',
    description: 'Лам шамсия/камария, васл хамза, Саджда тилява, кираʾат',
    color: '#0F4C3A',
    difficulty: 'Сложный',
    level: 'advanced',
    pool: tajwidPools.advanced,
    pickCount: tajwidPoolInfo.advanced.pick,
    questions: tajwidPools.advanced.slice(0, 8),
  },

  // ============================================================
  // САХАБЫ (3 теста)
  // ============================================================

  sahaba_beginner: {
    title: 'Сахабы — основы',
    icon: '⭐',
    description: '4 праведных халифа, Хадиджа, Фатима, Билял, Хамза',
    color: '#B23A48',
    difficulty: 'Новичок',
    level: 'beginner',
    pool: sahabaPools.beginner,
    pickCount: sahabaPoolInfo.beginner.pick,
    questions: sahabaPools.beginner.slice(0, 8),
  },

  sahaba_intermediate: {
    title: 'Сахабы — учёные и герои',
    icon: '📜',
    description: 'Аиша, Абу Хурайра, Сальман, Муаз, Ибн Аббас, события халифата',
    color: '#A68641',
    difficulty: 'Средний',
    level: 'intermediate',
    pool: sahabaPools.intermediate,
    pickCount: sahabaPoolInfo.intermediate.pick,
    questions: sahabaPools.intermediate.slice(0, 8),
  },

  sahaba_advanced: {
    title: 'Сахабы — глубокое',
    icon: '🏆',
    description: 'Халид «Меч Аллаха», Усама, Шура, Сиффин, Карбала, Аббас',
    color: '#063326',
    difficulty: 'Сложный',
    level: 'advanced',
    pool: sahabaPools.advanced,
    pickCount: sahabaPoolInfo.advanced.pick,
    questions: sahabaPools.advanced.slice(0, 10),
  },
};

export const examsList = [
  'master',
  'foundations',
  'quran',
  'hadiths',
  'practice',
  'alphabet',
  'words',
  'asma_beginner',
  'asma_intermediate',
  'asma_advanced',
  'rights_basic',
  'ethics_basic',
  'ethics_advanced',
  'sira_beginner',
  'sira_intermediate',
  'sira_advanced',
  'prophets_beginner',
  'prophets_intermediate',
  'prophets_advanced',
  'tajwid_beginner',
  'tajwid_intermediate',
  'tajwid_advanced',
  'sahaba_beginner',
  'sahaba_intermediate',
  'sahaba_advanced',
];

// Группировка по уровню сложности — для красивого отображения.
export const examLevels = [
  {
    id: 'beginner',
    title: 'Новичок',
    description: 'Начинающим — простые вопросы для знакомства',
    icon: '🌱',
    color: '#2E7D5B',
  },
  {
    id: 'intermediate',
    title: 'Средний',
    description: 'Углубление в смыслы и связи',
    icon: '⚖️',
    color: '#C9A55B',
  },
  {
    id: 'advanced',
    title: 'Сложный',
    description: 'Тонкие различия, источники, контекст',
    icon: '🏆',
    color: '#063326',
  },
];

export function getExam(id) {
  return exams[id];
}

export function getExamsByLevel(level) {
  return examsList.filter((id) => exams[id]?.level === level);
}
