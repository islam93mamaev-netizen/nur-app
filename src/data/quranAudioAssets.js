// Локальные аудио сур/аятов, вшитые в приложение (мгновенный доступ офлайн).
//
// React Native не умеет require() с динамическим путём, поэтому файлы
// перечисляются явно. Если файла нет локально — резолвер вернёт URL CDN
// (everyayah.com для отдельных аятов, cdn.islamic.network для целых сур).
//
// ЧТОБЫ ДОБАВИТЬ ЛОКАЛЬНОЕ АУДИО:
//   1. Положите mp3 в assets/quran/ (например falaq.mp3, nas.mp3, ayat_kursi.mp3)
//   2. Добавьте require() в карту ниже
// Скачать декламацию Alafasy можно с everyayah.com / quranicaudio.com.

import { getAyatAudioUrl, getSurahAudioUrl, getReciter } from '../services/quranService';

// Сура целиком: { [номер суры]: require(...) }
const LOCAL_SURAH_AUDIO = {
  112: require('../../assets/prayer/audio/ihlas.mp3'), // уже есть в уроке намаза
  // 113: require('../../assets/quran/falaq.mp3'),
  // 114: require('../../assets/quran/nas.mp3'),
};

// Отдельный аят: ключ — `${сура}:${аят}`
const LOCAL_AYAH_AUDIO = {
  // '2:255': require('../../assets/quran/ayat_kursi.mp3'),
};

// Резолвер источника звука для записи { surah, ayah? }:
// локальный ассет (если вшит) → иначе URL CDN с выбранным чтецом.
// Локальные файлы используются только для чтеца по умолчанию (аль-Афаси) —
// иначе уважаем выбор пользователя и берём CDN.
// Возвращаемое значение можно передавать прямо в audioService.play().
export function resolveQuranAudio({ surah, ayah }) {
  const useLocal = getReciter().id === 'alafasy';
  if (ayah != null) {
    return (useLocal && LOCAL_AYAH_AUDIO[`${surah}:${ayah}`]) || getAyatAudioUrl(surah, ayah);
  }
  return (useLocal && LOCAL_SURAH_AUDIO[surah]) || getSurahAudioUrl(surah);
}
