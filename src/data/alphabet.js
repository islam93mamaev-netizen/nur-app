// 28 букв арабского алфавита.
//
// Для каждой буквы указано:
//   - letter      — изолированная форма
//   - name        — название буквы
//   - nameAr      — арабское название
//   - tr          — академическая транскрипция (IPA-приближённая)
//   - ru          — русское фонетическое описание
//   - sound       — короткое описание звука
//   - forms       — { isolated, initial, medial, final }
//                    у несоединяющихся слева букв initial/medial = isolated
//   - example     — { ar, tr, ru } — слово, в котором эта буква хорошо слышна
//   - tip         — подсказка для запоминания
//   - connectsLeft— соединяется ли с буквой слева
//
// Транскрипция и описания звуков сверены с академическими источниками
// (Brockelmann, Wright's Arabic Grammar, общепринятая система IJMES).

// 6 «несоединяющихся» букв (соединяются только справа):
// ا د ذ ر ز و — у них только isolated и final формы.

export const letters = [
  {
    id: 'l1', letter: 'ا', name: 'Алиф', nameAr: 'ألف',
    tr: 'ʾ / ā', ru: 'а / долгая «а»',
    sound: 'Носитель хамзы, либо долгая «а» (после фатхи)',
    forms: { isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا' },
    connectsLeft: false,
    example: { ar: 'أَرْض', tr: 'arḍ', ru: 'земля' },
    tip: 'Похожа на вертикальную палочку. Самая первая буква алфавита.',
  },
  {
    id: 'l2', letter: 'ب', name: 'Ба', nameAr: 'باء',
    tr: 'b', ru: 'б',
    sound: 'Как русское «б»',
    forms: { isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب' },
    connectsLeft: true,
    example: { ar: 'بَيْت', tr: 'bayt', ru: 'дом' },
    tip: 'Одна точка СНИЗУ. «Б — внизу».',
  },
  {
    id: 'l3', letter: 'ت', name: 'Та', nameAr: 'تاء',
    tr: 't', ru: 'т',
    sound: 'Как русское «т» (твёрдое)',
    forms: { isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت' },
    connectsLeft: true,
    example: { ar: 'تَمْر', tr: 'tamr', ru: 'финик' },
    tip: 'Две точки СВЕРХУ. Та же форма что и ب, но точки наверху.',
  },
  {
    id: 'l4', letter: 'ث', name: 'Са', nameAr: 'ثاء',
    tr: 'ṯ / th', ru: 'английское th (как в think)',
    sound: 'Межзубный глухой, кончик языка между зубами',
    forms: { isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث' },
    connectsLeft: true,
    example: { ar: 'ثَلَاثَة', tr: 'ṯalāṯa', ru: 'три' },
    tip: 'Три точки сверху. Звук — как в английском «think».',
  },
  {
    id: 'l5', letter: 'ج', name: 'Джим', nameAr: 'جيم',
    tr: 'j', ru: 'дж',
    sound: 'Как английское «j» в слове joy',
    forms: { isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج' },
    connectsLeft: true,
    example: { ar: 'جَبَل', tr: 'jabal', ru: 'гора' },
    tip: 'Дугообразная форма с точкой внутри. В Египте часто читают как «г».',
  },
  {
    id: 'l6', letter: 'ح', name: 'Ха', nameAr: 'حاء',
    tr: 'ḥ', ru: 'глубокая «х»',
    sound: 'Глубокий горловой выдох, как при «h» с напряжением гортани',
    forms: { isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح' },
    connectsLeft: true,
    example: { ar: 'حَيَاة', tr: 'ḥayāh', ru: 'жизнь' },
    tip: 'Та же форма что و ج خ, но БЕЗ точек. Звук — как будто дышишь на стекло.',
  },
  {
    id: 'l7', letter: 'خ', name: 'Кха', nameAr: 'خاء',
    tr: 'ḫ / kh', ru: 'кх (как немецкое ch в Bach)',
    sound: 'Глухой задненёбный, как в шотландском loch',
    forms: { isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ' },
    connectsLeft: true,
    example: { ar: 'خَيْر', tr: 'ḫayr', ru: 'добро' },
    tip: 'Точка СВЕРХУ. Звук жёсткий, царапающий горло.',
  },
  {
    id: 'l8', letter: 'د', name: 'Даль', nameAr: 'دال',
    tr: 'd', ru: 'д',
    sound: 'Как русское «д»',
    forms: { isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد' },
    connectsLeft: false,
    example: { ar: 'دِين', tr: 'dīn', ru: 'религия' },
    tip: 'Похожа на крючок. НЕ соединяется со следующей буквой.',
  },
  {
    id: 'l9', letter: 'ذ', name: 'Заль', nameAr: 'ذال',
    tr: 'ḏ / dh', ru: 'английское th (как в this)',
    sound: 'Межзубный звонкий, язык между зубами + голос',
    forms: { isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ' },
    connectsLeft: false,
    example: { ar: 'ذَهَب', tr: 'ḏahab', ru: 'золото' },
    tip: 'Как د с точкой сверху. Звук — как в английском «this». Не соединяется.',
  },
  {
    id: 'l10', letter: 'ر', name: 'Ра', nameAr: 'راء',
    tr: 'r', ru: 'р',
    sound: 'Раскатистое «р», как в русском «рука»',
    forms: { isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر' },
    connectsLeft: false,
    example: { ar: 'رَجُل', tr: 'rajul', ru: 'мужчина' },
    tip: 'Кривая линия, опускается ниже строки. НЕ соединяется.',
  },
  {
    id: 'l11', letter: 'ز', name: 'Зайн', nameAr: 'زاي',
    tr: 'z', ru: 'з',
    sound: 'Как русское «з»',
    forms: { isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز' },
    connectsLeft: false,
    example: { ar: 'زَيْت', tr: 'zayt', ru: 'масло' },
    tip: 'Как ر, но с точкой сверху. Не соединяется.',
  },
  {
    id: 'l12', letter: 'س', name: 'Син', nameAr: 'سين',
    tr: 's', ru: 'с',
    sound: 'Как русское «с»',
    forms: { isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس' },
    connectsLeft: true,
    example: { ar: 'سَلَام', tr: 'salām', ru: 'мир' },
    tip: 'Три «зубца» без точек. Запомни: «син — без точек».',
  },
  {
    id: 'l13', letter: 'ش', name: 'Шин', nameAr: 'شين',
    tr: 'š / sh', ru: 'ш',
    sound: 'Как русское «ш»',
    forms: { isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش' },
    connectsLeft: true,
    example: { ar: 'شَمْس', tr: 'šams', ru: 'солнце' },
    tip: 'Как س, но с тремя точками сверху.',
  },
  {
    id: 'l14', letter: 'ص', name: 'Сад', nameAr: 'صاد',
    tr: 'ṣ', ru: 'твёрдая, эмфатическая «с»',
    sound: 'Глухой эмфатический. Произносится с приподнятым корнем языка',
    forms: { isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص' },
    connectsLeft: true,
    example: { ar: 'صَلَاة', tr: 'ṣalāh', ru: 'молитва' },
    tip: 'Овал с «хвостиком». Звук «толще» чем обычное «с».',
  },
  {
    id: 'l15', letter: 'ض', name: 'Дад', nameAr: 'ضاد',
    tr: 'ḍ', ru: 'твёрдая, эмфатическая «д»',
    sound: 'Звонкий эмфатический. Уникальный для арабского',
    forms: { isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض' },
    connectsLeft: true,
    example: { ar: 'أَرْض', tr: 'arḍ', ru: 'земля' },
    tip: 'Как ص с точкой сверху. Арабов называют «народ ад-дад».',
  },
  {
    id: 'l16', letter: 'ط', name: 'Та (эмф.)', nameAr: 'طاء',
    tr: 'ṭ', ru: 'твёрдая, эмфатическая «т»',
    sound: 'Глухой эмфатический, корень языка приподнят',
    forms: { isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط' },
    connectsLeft: true,
    example: { ar: 'طَعَام', tr: 'ṭaʿām', ru: 'еда' },
    tip: 'Овал с вертикальной чертой. Без точек.',
  },
  {
    id: 'l17', letter: 'ظ', name: 'За (эмф.)', nameAr: 'ظاء',
    tr: 'ẓ', ru: 'твёрдая, эмфатическая «з/дх»',
    sound: 'Звонкий эмфатический межзубный',
    forms: { isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ' },
    connectsLeft: true,
    example: { ar: 'ظِلّ', tr: 'ẓill', ru: 'тень' },
    tip: 'Как ط с точкой сверху.',
  },
  {
    id: 'l18', letter: 'ع', name: 'Айн', nameAr: 'عين',
    tr: 'ʿ', ru: 'гортанный звук (нет аналога в русском)',
    sound: 'Фарингальный звонкий — сжатие гортани со звуком',
    forms: { isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع' },
    connectsLeft: true,
    example: { ar: 'عِلْم', tr: 'ʿilm', ru: 'знание' },
    tip: 'Одна из сложнейших букв. Нужно тренировать с учителем.',
  },
  {
    id: 'l19', letter: 'غ', name: 'Гайн', nameAr: 'غين',
    tr: 'ġ / gh', ru: 'картавая «р» / французское r',
    sound: 'Звонкий задненёбный, как в парижском grand',
    forms: { isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ' },
    connectsLeft: true,
    example: { ar: 'غَيْب', tr: 'ġayb', ru: 'сокровенное' },
    tip: 'Как ع с точкой сверху. Звук — как французская «r».',
  },
  {
    id: 'l20', letter: 'ف', name: 'Фа', nameAr: 'فاء',
    tr: 'f', ru: 'ф',
    sound: 'Как русское «ф»',
    forms: { isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف' },
    connectsLeft: true,
    example: { ar: 'فَجْر', tr: 'fajr', ru: 'рассвет' },
    tip: 'Маленький овал с точкой сверху и хвостом.',
  },
  {
    id: 'l21', letter: 'ق', name: 'Каф', nameAr: 'قاف',
    tr: 'q', ru: 'глубокая «к» из горла',
    sound: 'Глухой увулярный, дальше чем русское «к»',
    forms: { isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق' },
    connectsLeft: true,
    example: { ar: 'قَلْب', tr: 'qalb', ru: 'сердце' },
    tip: 'Овал с двумя точками сверху. Произносится глубже чем обычное «к».',
  },
  {
    id: 'l22', letter: 'ك', name: 'Кяф', nameAr: 'كاف',
    tr: 'k', ru: 'к',
    sound: 'Как русское «к» (мягкое)',
    forms: { isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك' },
    connectsLeft: true,
    example: { ar: 'كِتَاب', tr: 'kitāb', ru: 'книга' },
    tip: 'Угловатая форма с «крючком» внутри.',
  },
  {
    id: 'l23', letter: 'ل', name: 'Лям', nameAr: 'لام',
    tr: 'l', ru: 'л',
    sound: 'Как русское «л»',
    forms: { isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل' },
    connectsLeft: true,
    example: { ar: 'لَيْل', tr: 'layl', ru: 'ночь' },
    tip: 'Высокая палочка с крючком внизу.',
  },
  {
    id: 'l24', letter: 'م', name: 'Мим', nameAr: 'ميم',
    tr: 'm', ru: 'м',
    sound: 'Как русское «м»',
    forms: { isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم' },
    connectsLeft: true,
    example: { ar: 'مَاء', tr: 'māʾ', ru: 'вода' },
    tip: 'Круглая «головка» с хвостом, опускается ниже строки.',
  },
  {
    id: 'l25', letter: 'ن', name: 'Нун', nameAr: 'نون',
    tr: 'n', ru: 'н',
    sound: 'Как русское «н»',
    forms: { isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن' },
    connectsLeft: true,
    example: { ar: 'نُور', tr: 'nūr', ru: 'свет' },
    tip: 'В изолированной форме — как чашка с точкой.',
  },
  {
    id: 'l26', letter: 'ه', name: 'Ха (мягкая)', nameAr: 'هاء',
    tr: 'h', ru: 'h (как английское в hello)',
    sound: 'Гортанный мягкий выдох',
    forms: { isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه' },
    connectsLeft: true,
    example: { ar: 'هَدَى', tr: 'hadā', ru: 'вести (по пути)' },
    tip: 'Имеет очень разные формы — обязательно учить каждую.',
  },
  {
    id: 'l27', letter: 'و', name: 'Уау', nameAr: 'واو',
    tr: 'w / ū', ru: 'в / долгая «у»',
    sound: 'Как английское «w» или долгая «у» (после даммы)',
    forms: { isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو' },
    connectsLeft: false,
    example: { ar: 'وَلَد', tr: 'walad', ru: 'ребёнок' },
    tip: 'Кружок с хвостом. Также служебная: «и» (و) — союз. Не соединяется.',
  },
  {
    id: 'l28', letter: 'ي', name: 'Йа', nameAr: 'ياء',
    tr: 'y / ī', ru: 'й / долгая «и»',
    sound: 'Как русское «й» или долгая «и» (после касры)',
    forms: { isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي' },
    connectsLeft: true,
    example: { ar: 'يَوْم', tr: 'yawm', ru: 'день' },
    tip: 'В изолированной форме — две точки внизу под крюком.',
  },
];

// Хамза — это не буква алфавита, а особый знак, но её важно знать.
export const hamza = {
  id: 'hamza', letter: 'ء', name: 'Хамза', nameAr: 'همزة',
  tr: 'ʾ', ru: 'твёрдый приступ (как пауза между «а-а»)',
  sound: 'Гортанная смычка, как пауза в «не-а»',
  variants: [
    { form: 'ء', desc: 'отдельная' },
    { form: 'أ', desc: 'на алифе сверху' },
    { form: 'إ', desc: 'на алифе снизу (с касрой)' },
    { form: 'ؤ', desc: 'на уау' },
    { form: 'ئ', desc: 'на йа' },
  ],
  example: { ar: 'أَرْض', tr: 'arḍ', ru: 'земля' },
  tip: 'Самое сложное в арабской орфографии — её правописание.',
};

// Группы по похожей графической форме — для быстрого освоения.
export const letterGroups = [
  {
    id: 'g1',
    title: 'Палочка',
    description: 'Простая вертикальная форма',
    letters: ['l1'], // ا
  },
  {
    id: 'g2',
    title: 'Зубчики (ب ت ث)',
    description: 'Одинаковая форма, разное число и расположение точек',
    letters: ['l2', 'l3', 'l4'],
  },
  {
    id: 'g3',
    title: 'Дуга с точкой (ج ح خ)',
    description: 'Большая дуга. Различаются точкой',
    letters: ['l5', 'l6', 'l7'],
  },
  {
    id: 'g4',
    title: 'Несоединяющиеся (د ذ ر ز)',
    description: 'Эти буквы не соединяются со следующей',
    letters: ['l8', 'l9', 'l10', 'l11'],
  },
  {
    id: 'g5',
    title: 'Зубчики свистящих (س ش)',
    description: 'Три волны. Шин с точками',
    letters: ['l12', 'l13'],
  },
  {
    id: 'g6',
    title: 'Эмфатические (ص ض ط ظ)',
    description: 'Овалы. Произносятся «жирнее»',
    letters: ['l14', 'l15', 'l16', 'l17'],
  },
  {
    id: 'g7',
    title: 'Горловые (ع غ)',
    description: 'Самые сложные звуки для русскоязычных',
    letters: ['l18', 'l19'],
  },
  {
    id: 'g8',
    title: 'Простые согласные (ف ق ك)',
    description: 'Ф, глубокая К и обычная К',
    letters: ['l20', 'l21', 'l22'],
  },
  {
    id: 'g9',
    title: 'Сонорные (ل م ن)',
    description: 'Л, М, Н — как в русском',
    letters: ['l23', 'l24', 'l25'],
  },
  {
    id: 'g10',
    title: 'Полугласные (ه و ي)',
    description: 'Мягкая Х, В/У, Й/И',
    letters: ['l26', 'l27', 'l28'],
  },
];

export function findLetter(id) {
  return letters.find((l) => l.id === id);
}

export function getGroup(id) {
  return letterGroups.find((g) => g.id === id);
}
