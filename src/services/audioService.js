// Аудио-сервис на базе expo-audio (Expo SDK 54+).
// Поддерживает одиночное воспроизведение аятов и переключение между URL.
//
// Миграция с expo-av:
//   Audio.Sound.createAsync  → createAudioPlayer
//   sound.playAsync          → player.play()
//   sound.pauseAsync         → player.pause()
//   sound.stopAsync          → player.pause() + player.seekTo(0)
//   sound.unloadAsync        → player.remove()
//   sound.getStatusAsync     → player.playing / player.currentTime / ...

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

let currentPlayer = null;  // expo-audio player (native) | HTMLAudioElement (web)
let currentUrl = null;
let audioModeSet = false;

async function ensureAudioMode() {
  if (audioModeSet) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      // Чтение Корана продолжается при блокировке экрана / сворачивании.
      // Для standalone-сборки также нужен UIBackgroundModes: ['audio'] в app.json (iOS).
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
      interruptionModeAndroid: 'duckOthers',
    });
    audioModeSet = true;
  } catch {
    /* ignore */
  }
}

// source: строка-URL ИЛИ локальный ассет (результат require('...mp3')).
// onStart — вызывается, когда звук реально начал играть (для индикатора загрузки CDN).
export async function play(source, { onFinish, onStart } = {}) {
  const key = typeof source === 'string' ? source : `asset:${source}`;
  // Если уже играет тот же источник — пауза/возобновление
  if (currentPlayer && currentUrl === key) {
    try {
      if (isWeb) {
        if (currentPlayer.paused) currentPlayer.play();
        else currentPlayer.pause();
      } else {
        if (currentPlayer.playing) currentPlayer.pause();
        else currentPlayer.play();
      }
    } catch { /* ignore */ }
    return currentPlayer;
  }
  await stop();

  // ===== WEB: нативный HTMLAudioElement =====
  // expo-audio на вебе не поддерживает события didJustFinish надёжно,
  // поэтому на вебе используем HTMLAudioElement напрямую — его 'ended' работает стабильно.
  if (isWeb) {
    try {
      const url = typeof source === 'string' ? source : null;
      if (!url) throw new Error('web: local assets not supported via HTML Audio');
      const el = new window.Audio(url);
      el.oncanplay = () => { if (onStart) onStart(); };
      el.onended = () => { if (onFinish) onFinish(); };
      el.onerror = () => { if (onFinish) onFinish(); }; // не подвешиваем цепочку при ошибке
      await el.play();
      currentPlayer = el;
      currentUrl = key;
      return el;
    } catch (e) {
      console.warn('Web Audio play failed', e);
      currentPlayer = null;
      currentUrl = null;
      throw e;
    }
  }

  // ===== NATIVE: expo-audio =====
  await ensureAudioMode();
  try {
    const player = createAudioPlayer(typeof source === 'string' ? { uri: source } : source);
    if (onFinish || onStart) {
      let started = false;
      const sub = player.addListener('playbackStatusUpdate', (status) => {
        if (!started && status?.playing) {
          started = true;
          if (onStart) onStart();
        }
        if (status?.didJustFinish) {
          if (onFinish) onFinish();
          try { sub.remove(); } catch { /* ignore */ }
        }
      });
    }
    player.play();
    currentPlayer = player;
    currentUrl = key;
    return player;
  } catch (e) {
    console.warn('Audio play failed', e);
    currentPlayer = null;
    currentUrl = null;
    throw e;
  }
}

export async function stop() {
  if (currentPlayer) {
    try {
      currentPlayer.pause();
      if (!isWeb) currentPlayer.remove(); // HTMLAudioElement нет .remove()
    } catch {
      /* ignore */
    }
    currentPlayer = null;
    currentUrl = null;
  }
}

export async function pause() {
  if (currentPlayer) {
    try { currentPlayer.pause(); } catch { /* ignore */ }
  }
}

export function getCurrentUrl() {
  return currentUrl;
}
