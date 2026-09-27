// Конвертация григорианской даты в хиджри и названия лунных месяцев.
// Используется на экране «Календарь хиджры» и в виджете на главной.

export const HIJRI_MONTHS = [
  'Мухаррам',          // 1
  'Сафар',             // 2
  'Раби аль-Авваль',   // 3
  'Раби ас-Сани',      // 4
  'Джумада аль-Уля',   // 5
  'Джумада ас-Сания',  // 6
  'Раджаб',            // 7
  'Шаабан',            // 8
  'Рамадан',           // 9
  'Шавваль',           // 10
  'Зу-ль-Каʿда',       // 11
  'Зу-ль-Хиджа',       // 12
];

// Приблизительная конвертация по табличному (арифметическому) календарю.
// Возможно расхождение ±1 день с фактическим наблюдением луны.
export function gregorianToHijri(d) {
  // Считаем от ЛОКАЛЬНОЙ календарной даты (год-месяц-день), а не от timestamp:
  // иначе в таймзонах восточнее UTC (например, Минск UTC+3) с полуночи до
  // 00:00+offset показывалась вчерашняя дата хиджры.
  const jd = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) + 2440588;
  const days = jd - 1948440 + 10632;
  const n = Math.floor((days - 1) / 10631);
  const days2 = days - 10631 * n + 354;
  const j =
    Math.floor((10985 - days2) / 5316) * Math.floor((50 * days2) / 17719) +
    Math.floor(days2 / 5670) * Math.floor((43 * days2) / 15238);
  const days3 = days2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * days3) / 709);
  const day = days3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

// Краткая строка для виджетов: «14 Рамадан 1447 г.х.»
export function formatHijri(d = new Date()) {
  const h = gregorianToHijri(d);
  return `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${h.year} г.х.`;
}
