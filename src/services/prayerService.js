// Локальное вычисление времён намазов через библиотеку adhan.
// adhan-js — официальный JS-порт классических астрономических алгоритмов
// (Umm al-Qura, Muslim World League, ISNA, Egyptian и др.).
// https://github.com/batoulapps/adhan-js

import { CalculationMethod, Coordinates, PrayerTimes, Madhab, HighLatitudeRule } from 'adhan';

export const METHODS = {
  MuslimWorldLeague: 'Muslim World League',
  Egyptian: 'Egyptian',
  Karachi: 'Karachi',
  UmmAlQura: 'Umm al-Qura',
  Dubai: 'Dubai',
  MoonsightingCommittee: 'Moonsighting Committee',
  NorthAmerica: 'North America (ISNA)',
  Kuwait: 'Kuwait',
  Qatar: 'Qatar',
  Singapore: 'Singapore',
  Tehran: 'Tehran',
  Turkey: 'Turkey',
};

function getMethodFn(name) {
  switch (name) {
    case 'Egyptian': return CalculationMethod.Egyptian();
    case 'Karachi': return CalculationMethod.Karachi();
    case 'UmmAlQura': return CalculationMethod.UmmAlQura();
    case 'Dubai': return CalculationMethod.Dubai();
    case 'MoonsightingCommittee': return CalculationMethod.MoonsightingCommittee();
    case 'NorthAmerica': return CalculationMethod.NorthAmerica();
    case 'Kuwait': return CalculationMethod.Kuwait();
    case 'Qatar': return CalculationMethod.Qatar();
    case 'Singapore': return CalculationMethod.Singapore();
    case 'Tehran': return CalculationMethod.Tehran();
    case 'Turkey': return CalculationMethod.Turkey();
    case 'MuslimWorldLeague':
    default: return CalculationMethod.MuslimWorldLeague();
  }
}

// Возвращает объект с временами намазов на указанную дату.
export function getPrayerTimes({
  latitude,
  longitude,
  date = new Date(),
  method = 'MuslimWorldLeague',
  madhab = 'Shafi', // 'Shafi' | 'Hanafi'
}) {
  const coords = new Coordinates(latitude, longitude);
  const params = getMethodFn(method);
  params.madhab = madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;

  const times = new PrayerTimes(coords, date, params);

  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
    nextPrayer: () => {
      const now = new Date();
      const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
      for (const k of order) {
        if (times[k] > now) return { name: k, time: times[k] };
      }
      return null;
    },
  };
}

export const PRAYER_NAMES_RU = {
  fajr: 'Фаджр',
  sunrise: 'Восход',
  dhuhr: 'Зухр',
  asr: 'Аср',
  maghrib: 'Магриб',
  isha: 'Иша',
};

// tz (необязательно) — часовой пояс IANA выбранного вручную города:
// время показывается по местному времени города, а не телефона.
// Если движок не знает этот пояс — показываем по времени устройства.
export function formatTime(date, tz) {
  if (!date) return '';
  const opts = { hour: '2-digit', minute: '2-digit' };
  if (tz) {
    try {
      return date.toLocaleTimeString('ru-RU', { ...opts, timeZone: tz });
    } catch { /* неизвестный пояс — fallback ниже */ }
  }
  return date.toLocaleTimeString('ru-RU', opts);
}

// Общие ключи AsyncStorage — используются экраном «Намазы» и виджетом на главной,
// чтобы настройки и последние координаты были едиными во всём приложении.
export const PRAYER_STORAGE = {
  // JSON: { latitude, longitude, city, tz?, cityId? } — tz/cityId есть у ручного выбора
  COORDS: '@nur_app/prayer_coords_v1',
  METHOD: '@nur_app/prayer_method_v1',   // строка из METHODS
  MADHAB: '@nur_app/prayer_madhab_v1',   // 'Shafi' | 'Hanafi'
  // 'auto' — по GPS (по умолчанию), 'manual' — город выбран вручную
  LOCATION_MODE: '@nur_app/prayer_location_mode_v1',
};

// Мекка — запасные координаты, когда геолокация недоступна.
export const MECCA_COORDS = { latitude: 21.4225, longitude: 39.8262 };

// Следующий намаз (без восхода — он не является намазом).
// Если все намазы сегодня прошли — возвращает завтрашний фаджр.
export function getNextPrayer({ latitude, longitude, method, madhab }) {
  const now = new Date();
  const today = getPrayerTimes({ latitude, longitude, method, madhab });
  const order = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  for (const k of order) {
    if (today[k] > now) return { name: k, time: today[k] };
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const t = getPrayerTimes({ latitude, longitude, date: tomorrow, method, madhab });
  return { name: 'fajr', time: t.fajr };
}
