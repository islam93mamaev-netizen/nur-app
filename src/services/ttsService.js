// Сервис озвучивания текста (TTS).
//
// Архитектура:
//   - На iOS/Android используется expo-speech (системный TTS).
//   - На вебе используется напрямую Web Speech API (window.speechSynthesis),
//     потому что expo-speech на вебе не всегда корректно перечисляет голоса.
//
// Современные браузеры имеют встроенные арабские голоса:
//   - Chrome / Edge: "Google عربي", "Microsoft Hamed/Naayf"
//   - Safari (macOS/iOS web): "Maged", "Tarik"
//   - Firefox: использует системные голоса ОС
//
// Если в браузере нет арабского голоса — пользователю показываем понятное
// сообщение. Аналогично на нативе.

import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { notify } from '../utils/dialogs';

const VOICE_KEY = '@nur_app/tts_voice_id';
const RATE_KEY = '@nur_app/tts_rate';

const isWeb = Platform.OS === 'web';
const hasWebSpeech =
  typeof window !== 'undefined' &&
  typeof window.speechSynthesis !== 'undefined' &&
  typeof window.SpeechSynthesisUtterance !== 'undefined';

let currentlySpeaking = false;
let selectedVoiceId = null;
let selectedRate = 0.6;
let voicesCache = null;

// ===================== Настройки =====================

export async function loadSettings() {
  try {
    const v = await AsyncStorage.getItem(VOICE_KEY);
    const r = await AsyncStorage.getItem(RATE_KEY);
    if (v) selectedVoiceId = v;
    if (r) selectedRate = parseFloat(r) || 0.6;
  } catch {/* ignore */}
}

export async function setVoice(voiceId) {
  selectedVoiceId = voiceId;
  try {
    if (voiceId) await AsyncStorage.setItem(VOICE_KEY, voiceId);
    else await AsyncStorage.removeItem(VOICE_KEY);
  } catch {/* ignore */}
}

export async function setRate(rate) {
  selectedRate = rate;
  try { await AsyncStorage.setItem(RATE_KEY, String(rate)); } catch {/* ignore */}
}

export function getSelectedVoiceId() { return selectedVoiceId; }
export function getRate() { return selectedRate; }

// ===================== Web Speech API =====================

function loadWebVoices() {
  // Chrome загружает голоса асинхронно. Первый вызов может вернуть [].
  // Нужно дождаться voiceschanged либо подождать таймаут.
  return new Promise((resolve) => {
    if (!hasWebSpeech) return resolve([]);
    let voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) return resolve(voices);

    const timeout = setTimeout(() => resolve(window.speechSynthesis.getVoices() || []), 1500);
    const handler = () => {
      clearTimeout(timeout);
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices() || []);
    };
    window.speechSynthesis.onvoiceschanged = handler;
  });
}

async function getWebArabicVoices() {
  const all = await loadWebVoices();
  return all
    .filter((v) => v.lang && v.lang.toLowerCase().startsWith('ar'))
    .map((v) => ({
      identifier: v.voiceURI,
      name: v.name,
      language: v.lang,
      quality: v.localService ? 'локальный' : 'облачный',
      _webVoice: v, // храним оригинальный объект для дальнейшего использования
    }));
}

async function webSpeak(text, { rate, voice } = {}) {
  if (!hasWebSpeech) return false;

  // ВАЖНО: первый вызов getVoices() в Chrome возвращает [] — голоса грузятся
  // асинхронно. Дожидаемся их, иначе первое нажатие «Play» молчит.
  const all = await loadWebVoices();

  try {
    window.speechSynthesis.cancel();
  } catch {/* ignore */}
  // Chrome-баг: speak() сразу после cancel() иногда игнорируется. Короткая пауза.
  await new Promise((r) => setTimeout(r, 60));

  return new Promise((resolve) => {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = rate ?? selectedRate ?? 0.6;
    utterance.pitch = 1.0;

    // Выбор конкретного голоса
    const voiceId = voice ?? selectedVoiceId;
    let chosen = null;
    if (voiceId) {
      chosen = all.find((v) => v.voiceURI === voiceId);
    }
    if (!chosen) {
      chosen = all.find((v) => v.lang && v.lang.toLowerCase().startsWith('ar'));
    }
    if (chosen) utterance.voice = chosen;

    // Chrome-баг: utterance может быть собран GC до конца речи — onend не придёт.
    // Держим глобальную ссылку, пока говорим.
    window.__nurUtterance = utterance;

    let settled = false;
    let watchdog = null;
    const settle = (ok) => {
      if (settled) return;
      settled = true;
      currentlySpeaking = false;
      if (watchdog) clearTimeout(watchdog);
      if (window.__nurUtterance === utterance) window.__nurUtterance = null;
      resolve(ok);
    };

    // Страховка: если onend/onerror так и не пришли (ещё один баг Chrome),
    // резолвим по таймауту, чтобы UI не «завис» в состоянии воспроизведения.
    watchdog = setTimeout(() => settle(false), Math.max(10000, text.length * 400));

    utterance.onend = () => settle(true);
    utterance.onerror = () => settle(false);

    currentlySpeaking = true;
    try {
      window.speechSynthesis.speak(utterance);
      // Chrome иногда остаётся в paused-состоянии после cancel()
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    } catch {
      settle(false);
    }
  });
}

function webStop() {
  if (!hasWebSpeech) return;
  try { window.speechSynthesis.cancel(); } catch {/* ignore */}
  currentlySpeaking = false;
}

// ===================== Native (expo-speech) =====================

async function getNativeArabicVoices() {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices
      .filter((v) => v.language?.toLowerCase().startsWith('ar'))
      .map((v) => ({
        identifier: v.identifier,
        name: v.name || v.identifier,
        language: v.language,
        quality: v.quality || '',
      }));
  } catch {
    return [];
  }
}

function nativeSpeak(text, opts = {}) {
  return new Promise((resolve) => {
    try {
      Speech.stop();
    } catch {/* ignore */}
    currentlySpeaking = true;
    Speech.speak(text, {
      language: 'ar',
      pitch: 1.0,
      rate: opts.rate ?? selectedRate,
      voice: opts.voice ?? selectedVoiceId ?? undefined,
      onDone: () => { currentlySpeaking = false; resolve(true); },
      onStopped: () => { currentlySpeaking = false; resolve(false); },
      onError: () => { currentlySpeaking = false; resolve(false); },
    });
  });
}

function nativeStop() {
  try { Speech.stop(); } catch {/* ignore */}
  currentlySpeaking = false;
}

// ===================== Публичный API =====================

export async function getArabicVoices() {
  // Пустой список не кэшируем: на вебе голоса могут «доехать» позже.
  if (voicesCache && voicesCache.length > 0) return voicesCache;
  if (isWeb) {
    voicesCache = await getWebArabicVoices();
  } else {
    voicesCache = await getNativeArabicVoices();
  }
  return voicesCache;
}

export async function refreshVoices() {
  voicesCache = null;
  return getArabicVoices();
}

export async function hasArabicVoice() {
  const list = await getArabicVoices();
  return list.length > 0;
}

export async function speak(text, opts = {}) {
  try {
    if (isWeb) return await webSpeak(text, opts);
    return await nativeSpeak(text, opts);
  } catch {
    currentlySpeaking = false;
    return false;
  }
}

export async function stop() {
  if (isWeb) webStop();
  else nativeStop();
}

export function isSpeaking() { return currentlySpeaking; }

// Единое кросс-платформенное уведомление «нет арабского голоса»
export function notifyNoArabicVoice() {
  const title = 'Озвучка недоступна';
  const msg =
    Platform.OS === 'ios'
      ? 'На устройстве нет арабского голоса.\n\nУстановите его: Настройки → Универсальный доступ → Устный контент → Голоса → Арабский.'
      : Platform.OS === 'android'
        ? 'На устройстве нет арабского голоса.\n\nУстановите «Синтез речи Google» и добавьте арабский язык: Настройки → Система → Язык и ввод → Синтез речи.'
        : 'В браузере нет арабского голоса. Попробуйте Chrome, Edge или Safari.';
  notify(title, msg);
}

// Платформа — для UI (показать подсказку под платформу пользователя)
export const platformInfo = {
  isWeb,
  hasWebSpeech,
  os: Platform.OS,
};
