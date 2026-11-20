// Города для ручного выбора местоположения (экран «Времена намазов»).
// Страны одной недостаточно: в России 11 часовых поясов, а времена намазов
// зависят от точных координат, — поэтому выбирается город.
//
// tz — часовой пояс IANA: времена показываются по местному времени города,
// даже если телефон в другом поясе. Используются «классические» имена
// (Europe/Kiev, а не Europe/Kyiv) — они есть во всех версиях ICU.

const c = (id, name, country, lat, lng, tz) => ({ id, name, country, latitude: lat, longitude: lng, tz });

export const cities = [
  // Россия
  c('moscow',      'Москва',            'Россия', 55.7558, 37.6173, 'Europe/Moscow'),
  c('spb',         'Санкт-Петербург',   'Россия', 59.9343, 30.3351, 'Europe/Moscow'),
  c('kazan',       'Казань',            'Россия', 55.7963, 49.1088, 'Europe/Moscow'),
  c('grozny',      'Грозный',           'Россия', 43.3178, 45.6949, 'Europe/Moscow'),
  c('makhachkala', 'Махачкала',         'Россия', 42.9849, 47.5047, 'Europe/Moscow'),
  c('nazran',      'Назрань',           'Россия', 43.2257, 44.7645, 'Europe/Moscow'),
  c('nalchik',     'Нальчик',           'Россия', 43.4853, 43.6071, 'Europe/Moscow'),
  c('vladikavkaz', 'Владикавказ',       'Россия', 43.0367, 44.6678, 'Europe/Moscow'),
  c('cherkessk',   'Черкесск',          'Россия', 44.2269, 42.0578, 'Europe/Moscow'),
  c('maykop',      'Майкоп',            'Россия', 44.6098, 40.1006, 'Europe/Moscow'),
  c('rostov',      'Ростов-на-Дону',    'Россия', 47.2357, 39.7015, 'Europe/Moscow'),
  c('nnovgorod',   'Нижний Новгород',   'Россия', 56.2965, 43.9361, 'Europe/Moscow'),
  c('astrakhan',   'Астрахань',         'Россия', 46.3497, 48.0408, 'Europe/Astrakhan'),
  c('samara',      'Самара',            'Россия', 53.1959, 50.1002, 'Europe/Samara'),
  c('ufa',         'Уфа',               'Россия', 54.7388, 55.9721, 'Asia/Yekaterinburg'),
  c('ekb',         'Екатеринбург',      'Россия', 56.8389, 60.6057, 'Asia/Yekaterinburg'),
  c('tyumen',      'Тюмень',            'Россия', 57.1530, 65.5343, 'Asia/Yekaterinburg'),
  c('surgut',      'Сургут',            'Россия', 61.2540, 73.3962, 'Asia/Yekaterinburg'),
  c('novosibirsk', 'Новосибирск',       'Россия', 55.0084, 82.9357, 'Asia/Novosibirsk'),

  // Беларусь
  c('minsk',       'Минск',             'Беларусь', 53.9006, 27.5590, 'Europe/Minsk'),
  c('brest',       'Брест',             'Беларусь', 52.0976, 23.7341, 'Europe/Minsk'),
  c('gomel',       'Гомель',            'Беларусь', 52.4412, 30.9878, 'Europe/Minsk'),

  // Казахстан
  c('almaty',      'Алматы',            'Казахстан', 43.2220, 76.8512, 'Asia/Almaty'),
  c('astana',      'Астана',            'Казахстан', 51.1694, 71.4491, 'Asia/Almaty'),
  c('shymkent',    'Шымкент',           'Казахстан', 42.3417, 69.5901, 'Asia/Almaty'),

  // Средняя Азия и Кавказ
  c('tashkent',    'Ташкент',           'Узбекистан', 41.2995, 69.2401, 'Asia/Tashkent'),
  c('samarkand',   'Самарканд',         'Узбекистан', 39.6270, 66.9750, 'Asia/Samarkand'),
  c('bukhara',     'Бухара',            'Узбекистан', 39.7747, 64.4286, 'Asia/Samarkand'),
  c('dushanbe',    'Душанбе',           'Таджикистан', 38.5598, 68.7870, 'Asia/Dushanbe'),
  c('bishkek',     'Бишкек',            'Кыргызстан', 42.8746, 74.5698, 'Asia/Bishkek'),
  c('osh',         'Ош',                'Кыргызстан', 40.5283, 72.7985, 'Asia/Bishkek'),
  c('ashgabat',    'Ашхабад',           'Туркменистан', 37.9601, 58.3261, 'Asia/Ashgabat'),
  c('baku',        'Баку',              'Азербайджан', 40.4093, 49.8671, 'Asia/Baku'),
  c('tbilisi',     'Тбилиси',           'Грузия', 41.7151, 44.8271, 'Asia/Tbilisi'),
  c('kyiv',        'Киев',              'Украина', 50.4501, 30.5234, 'Europe/Kiev'),

  // Ближний Восток и Африка
  c('mecca',       'Мекка',             'Саудовская Аравия', 21.4225, 39.8262, 'Asia/Riyadh'),
  c('medina',      'Медина',            'Саудовская Аравия', 24.4672, 39.6111, 'Asia/Riyadh'),
  c('dubai',       'Дубай',             'ОАЭ', 25.2048, 55.2708, 'Asia/Dubai'),
  c('istanbul',    'Стамбул',           'Турция', 41.0082, 28.9784, 'Europe/Istanbul'),
  c('ankara',      'Анкара',            'Турция', 39.9334, 32.8597, 'Europe/Istanbul'),
  c('cairo',       'Каир',              'Египет', 30.0444, 31.2357, 'Africa/Cairo'),

  // Европа и Америка
  c('berlin',      'Берлин',            'Германия', 52.5200, 13.4050, 'Europe/Berlin'),
  c('paris',       'Париж',             'Франция', 48.8566, 2.3522, 'Europe/Paris'),
  c('london',      'Лондон',            'Великобритания', 51.5074, -0.1278, 'Europe/London'),
  c('warsaw',      'Варшава',           'Польша', 52.2297, 21.0122, 'Europe/Warsaw'),
  c('vienna',      'Вена',              'Австрия', 48.2082, 16.3738, 'Europe/Vienna'),
  c('newyork',     'Нью-Йорк',          'США', 40.7128, -74.0060, 'America/New_York'),
];

export function findCity(id) {
  return cities.find((x) => x.id === id) || null;
}

// Группировка по странам для списка выбора (порядок стран — как в массиве выше)
export function citiesByCountry(query = '') {
  const q = query.trim().toLowerCase();
  const groups = [];
  const index = {};
  for (const city of cities) {
    if (q && !`${city.name} ${city.country}`.toLowerCase().includes(q)) continue;
    if (!index[city.country]) {
      index[city.country] = { title: city.country, data: [] };
      groups.push(index[city.country]);
    }
    index[city.country].data.push(city);
  }
  return groups;
}
