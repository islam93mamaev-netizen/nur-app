// Сервис для работы с Кораном через AlQuran Cloud API.
// API публичный, без ключа, без лимитов запросов (в разумных пределах).
// Документация: https://alquran.cloud/api
//
// Используются базовые домены с автоматическим fallback:
//   - https://api.alquran.cloud
//   - https://alquran.api.islamic.network
//
// Все запросы кэшируются в AsyncStorage с TTL = 7 дней.

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASES = [
  'https://api.alquran.cloud/v1',
  'https://alquran.api.islamic.network/v1',
];

const CACHE_PREFIX = '@nur_app/quran/';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function getCached(key) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return value;
  } catch {
    return null;
  }
}

async function setCached(key, value) {
  try {
    await AsyncStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ value, ts: Date.now() })
    );
  } catch {
    /* ignore */
  }
}

async function tryFetch(path) {
  let lastErr;
  for (const base of BASES) {
    try {
      const res = await fetch(base + path);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (json?.code !== 200 || !json?.data) throw new Error('Bad payload');
      return json.data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('All API hosts failed');
}

// ----- API -----

export async function getChaptersList() {
  const cached = await getCached('chapters');
  if (cached) return cached;

  const data = await tryFetch('/surah');
  // Сохраняем только нужные поля
  const list = data.map((s) => ({
    id: s.number,
    name: s.englishName,
    nameAr: s.name,
    translation: s.englishNameTranslation,
    type: s.revelationType.toLowerCase() === 'meccan' ? 'meccan' : 'medinan',
    ayatCount: s.numberOfAyahs,
  }));
  await setCached('chapters', list);
  return list;
}

// Возвращает суру со всеми аятами в трёх «измерениях»:
// арабский (Уthmani), транслитерация (en.transliteration), русский перевод (ru.kuliev).
export async function getSurah(chapterNumber) {
  const key = `surah_${chapterNumber}`;
  const cached = await getCached(key);
  if (cached) return cached;

  const data = await tryFetch(
    `/surah/${chapterNumber}/editions/quran-uthmani,en.transliteration,ru.kuliev`
  );

  const [ar, tr, ru] = data;
  const surah = {
    id: ar.number,
    name: ar.englishName,
    nameAr: ar.name,
    translation: ar.englishNameTranslation,
    type: ar.revelationType.toLowerCase() === 'meccan' ? 'meccan' : 'medinan',
    ayatCount: ar.numberOfAyahs,
    ayats: ar.ayahs.map((a, i) => ({
      n: a.numberInSurah,
      globalN: a.number,
      ar: a.text,
      tr: tr.ayahs[i]?.text || '',
      ru: ru.ayahs[i]?.text || '',
    })),
  };
  await setCached(key, surah);
  return surah;
}

// Получить один аят (для аята дня и т.п.)
export async function getAyat(reference) {
  const key = `ayat_${reference}`;
  const cached = await getCached(key);
  if (cached) return cached;

  const data = await tryFetch(
    `/ayah/${reference}/editions/quran-uthmani,en.transliteration,ru.kuliev`
  );
  const [ar, tr, ru] = data;
  const out = {
    ar: ar.text,
    tr: tr.text,
    ru: ru.text,
    ref: `${ar.surah.englishName} (${ar.surah.number}:${ar.numberInSurah})`,
    surah: ar.surah.number,
    n: ar.numberInSurah,
    globalN: ar.number,
  };
  await setCached(key, out);
  return out;
}

// ===== Чтецы (декламация) =====
// ayah  — имя папки на everyayah.com (поаятное аудио)
// surah — id издания на cdn.islamic.network (аудио целой суры)
export const RECITERS = [
  { id: 'alafasy',    name: 'Мишари аль-Афаси',      ayah: 'Alafasy_128kbps',                surah: 'ar.alafasy' },
  { id: 'husary',     name: 'Махмуд аль-Хусари',     ayah: 'Husary_128kbps',                 surah: 'ar.husary' },
  { id: 'abdulbasit', name: 'Абдуль-Басит',          ayah: 'Abdul_Basit_Murattal_192kbps',   surah: 'ar.abdulbasitmurattal' },
  { id: 'minshawi',   name: 'Сыддик аль-Миншави',    ayah: 'Minshawy_Murattal_128kbps',      surah: 'ar.minshawi' },
  { id: 'sudais',     name: 'Абдуррахман ас-Судайс', ayah: 'Abdurrahmaan_As-Sudais_192kbps', surah: 'ar.abdurrahmaansudais' },
];

const RECITER_KEY = '@nur_app/reciter_v1';
let currentReciter = RECITERS[0];

export function getReciter() {
  return currentReciter;
}

export async function loadReciter() {
  try {
    const id = await AsyncStorage.getItem(RECITER_KEY);
    const found = RECITERS.find((r) => r.id === id);
    if (found) currentReciter = found;
  } catch { /* ignore */ }
  return currentReciter;
}

export async function setReciter(id) {
  const found = RECITERS.find((r) => r.id === id);
  if (!found) return currentReciter;
  currentReciter = found;
  try { await AsyncStorage.setItem(RECITER_KEY, id); } catch { /* ignore */ }
  return currentReciter;
}

// URL аудио для одного аята в декламации выбранного чтеца
// (everyayah.com — стабильный CDN, не требует подписки)
export function getAyatAudioUrl(surah, ayatNumber, reciter) {
  const folder = reciter || currentReciter.ayah;
  const s = String(surah).padStart(3, '0');
  const a = String(ayatNumber).padStart(3, '0');
  return `https://everyayah.com/data/${folder}/${s}${a}.mp3`;
}

// URL аудио всей суры (например, для непрерывного чтения)
export function getSurahAudioUrl(surahNumber, reciter) {
  const edition = reciter || currentReciter.surah;
  return `https://cdn.islamic.network/quran/audio-surah/128/${edition}/${surahNumber}.mp3`;
}

// Сбросить кэш (для настроек)
export async function clearCache() {
  const keys = await AsyncStorage.getAllKeys();
  const toDel = keys.filter((k) => k.startsWith(CACHE_PREFIX));
  if (toDel.length) await AsyncStorage.multiRemove(toDel);
}
