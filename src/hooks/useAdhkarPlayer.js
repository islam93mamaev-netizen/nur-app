// useAdhkarPlayer — вся логика воспроизведения азкаров:
//  - тексты без коранического аудио → TTS по кускам (splitArabic)
//  - записи с quranAudio → чтение Корана (локальный mp3 или CDN), последовательно
//  - отдельные фрагменты (одна сура/один аят) с паузой/возобновлением
//  - токены защищают от «гонок» при быстром переключении
// Автоматически глушит звук при уходе с экрана (unmount + потеря фокуса).
//
// Использование:
//   const player = useAdhkarPlayer();
//   player.getStatus(id) → 'idle' | 'playing' | 'paused'
//   player.playState[id] → { chunks, idx, status, single? }
//   player.togglePlay(item) / player.toggleFragment(item, i) / player.resetPlay(item)
//   player.stopAll() — например, в onBack шапки

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { speak, stop as ttsStop, hasArabicVoice, notifyNoArabicVoice } from '../services/ttsService';
import { splitArabic } from '../utils/arabicParser';
import * as audio from '../services/audioService';
import { resolveQuranAudio } from '../data/quranAudioAssets';

// Полная остановка всего звука: и TTS, и аудио-плеера Корана.
async function stopAllSound() {
  try { await ttsStop(); } catch { /* ignore */ }
  try { await audio.stop(); } catch { /* ignore */ }
}

const hasQuranAudio = (it) => Array.isArray(it.quranAudio) && it.quranAudio.length > 0;

export default function useAdhkarPlayer() {
  // { [id]: { chunks, idx, status: 'idle' | 'playing' | 'paused', single? } }
  const [playState, setPlayState] = useState({});
  const tokenRef = useRef(null);

  // Глушим звук при размонтировании и при потере фокуса экраном
  useEffect(() => () => { stopAllSound(); }, []);
  useFocusEffect(
    useCallback(() => {
      return () => {
        tokenRef.current = null;
        stopAllSound();
        setPlayState({});
      };
    }, [])
  );

  const getStatus = (id) => playState[id]?.status || 'idle';

  // Сбрасывает в idle все записи, кроме указанной
  const resetOthers = (keepId) => (s) => {
    const next = { ...s };
    for (const k of Object.keys(next)) {
      if (k !== keepId && next[k].status !== 'idle') {
        next[k] = { ...next[k], status: 'idle', idx: 0 };
      }
    }
    return next;
  };

  // ===== Отдельный фрагмент (одна сура / один аят) =====
  const toggleFragment = async (it, i) => {
    const cur = playState[it.id];
    const sources = cur?.chunks?.length ? cur.chunks : it.quranAudio.map(resolveQuranAudio);

    // Пауза, если играет именно этот фрагмент в одиночном режиме
    if (cur?.single && cur.idx === i && cur.status === 'playing') {
      await audio.pause();
      setPlayState((s) => ({ ...s, [it.id]: { ...cur, status: 'paused' } }));
      return;
    }

    // Возобновление того же фрагмента.
    // ВАЖНО: токен НЕ трогаем — onFinish-слушатель первоначального запуска
    // жив (привязан к старому токену) и корректно завершит фрагмент.
    if (cur?.single && cur.idx === i && cur.status === 'paused') {
      setPlayState((s) => ({ ...s, [it.id]: { ...cur, status: 'playing' } }));
      try { await audio.play(sources[i]); } catch { /* ignore */ }
      return;
    }

    // Свежий запуск фрагмента
    const myToken = Date.now() + '_' + it.id + '_f' + i;
    tokenRef.current = myToken;
    await ttsStop();     // глушим TTS
    await audio.stop();  // сбрасываем плеер: гарантируем новый onFinish-слушатель

    setPlayState((s) => {
      const next = resetOthers(it.id)(s);
      next[it.id] = { chunks: sources, idx: i, status: 'playing', single: true };
      return next;
    });

    const finish = () => {
      if (tokenRef.current === myToken) {
        tokenRef.current = null;
        setPlayState((s) => ({ ...s, [it.id]: { chunks: sources, idx: i, status: 'idle', single: true } }));
      }
    };
    audio.play(sources[i], { onFinish: finish }).catch(finish);
  };

  // ===== Последовательное чтение Корана (quranAudio) =====
  const playQuranSequence = (it, sources, startIdx, myToken) => {
    const playIdx = (i) => {
      if (tokenRef.current !== myToken) return;
      if (i >= sources.length) {
        tokenRef.current = null;
        setPlayState((s) => ({ ...s, [it.id]: { chunks: sources, idx: 0, status: 'idle' } }));
        return;
      }
      setPlayState((s) => ({ ...s, [it.id]: { chunks: sources, idx: i, status: 'playing' } }));
      audio
        .play(sources[i], { onFinish: () => playIdx(i + 1) })
        .catch(() => {
          // Сетевая ошибка / нет файла — останавливаемся аккуратно
          if (tokenRef.current === myToken) {
            tokenRef.current = null;
            setPlayState((s) => ({ ...s, [it.id]: { chunks: sources, idx: 0, status: 'idle' } }));
          }
        });
    };
    playIdx(startIdx);
  };

  const togglePlay = async (it) => {
    const cur = playState[it.id];
    const status = cur?.status || 'idle';
    const isQuran = hasQuranAudio(it);

    if (status === 'playing') {
      if (isQuran) {
        await audio.pause(); // пауза без сброса позиции
      } else {
        tokenRef.current = null;
        await ttsStop();
      }
      setPlayState((s) => ({ ...s, [it.id]: { ...cur, status: 'paused' } }));
      return;
    }

    // --- Чтение Корана (локальный файл или CDN) ---
    if (isQuran) {
      const sources = cur?.chunks?.length ? cur.chunks : it.quranAudio.map(resolveQuranAudio);

      if (status === 'paused' && cur?.chunks?.length) {
        // Возобновление: audio.play с тем же источником продолжает с места паузы.
        // Токен не меняем — живой слушатель продолжит цепочку.
        setPlayState((s) => ({ ...s, [it.id]: { ...cur, status: 'playing' } }));
        try { await audio.play(sources[cur.idx]); } catch { /* ignore */ }
        return;
      }

      const myToken = Date.now() + '_' + it.id;
      tokenRef.current = myToken;
      setPlayState(resetOthers(it.id));
      await ttsStop();
      await audio.stop();
      playQuranSequence(it, sources, 0, myToken);
      return;
    }

    // --- Синтезатор речи ---
    if (!(await hasArabicVoice())) {
      notifyNoArabicVoice();
      return;
    }

    const chunks = cur?.chunks?.length ? cur.chunks : splitArabic(it.ar);
    const startIdx = status === 'paused' ? cur.idx : 0;

    setPlayState((s) => {
      const next = resetOthers(it.id)(s);
      next[it.id] = { chunks, idx: startIdx, status: 'playing' };
      return next;
    });

    const myToken = Date.now() + '_' + it.id;
    tokenRef.current = myToken;
    await stopAllSound();

    for (let i = startIdx; i < chunks.length; i++) {
      if (tokenRef.current !== myToken) return;
      setPlayState((s) => ({ ...s, [it.id]: { chunks, idx: i, status: 'playing' } }));
      await speak(chunks[i], { rate: 0.5 });
      if (tokenRef.current !== myToken) return;
    }

    if (tokenRef.current === myToken) {
      tokenRef.current = null;
      setPlayState((s) => ({ ...s, [it.id]: { chunks, idx: 0, status: 'idle' } }));
    }
  };

  const resetPlay = async (it) => {
    tokenRef.current = null;
    await stopAllSound();
    setPlayState((s) => ({
      ...s,
      [it.id]: {
        chunks: hasQuranAudio(it) ? it.quranAudio.map(resolveQuranAudio) : splitArabic(it.ar),
        idx: 0,
        status: 'idle',
      },
    }));
  };

  return { playState, getStatus, togglePlay, toggleFragment, resetPlay, stopAll: stopAllSound };
}
