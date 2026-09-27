// Простой store на AsyncStorage + React Context.
// Хранит:
//  - профиль пользователя (имя, цель, уровень)
//  - выполненные уроки и тесты
//  - выученные слова и расписание интервального повторения
//  - XP, серия (streak)
//  - флаг прохождения онбординга

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nur_app/state_v1';

const DEFAULT_STATE = {
  onboardingDone: false,
  profile: {
    name: '',
    goal: null,        // 'islam' | 'quran' | 'arabic' | 'salat'
    level: 'beginner', // 'beginner' | 'middle' | 'advanced'
    dailyMinutes: 10,
  },
  completedLessons: {},  // { [lessonId]: true }
  completedQuizzes: {},  // { [quizId]: { score, total, date } }
  learnedWords: {},      // { [wordId]: { stage, nextReview, lastReviewed } }
  xp: 0,
  streak: { count: 0, lastDate: null },
  lastOpenedLesson: null,
  // Закладки: { [key]: { type, refId, title, subtitle, route, params, addedAt } }
  // key = `${type}:${refId}` — type: 'ayat' | 'hadith' | 'faq' | 'asma' | 'ethics' | 'sira' | 'prophet' | 'dua' | 'lesson'
  bookmarks: {},
  // Заметки: { [id]: { id, text, type, refId, title, createdAt, updatedAt } }
  notes: {},
  // Сунны на день: { date: 'YYYY-MM-DD', done: { [sunnahId]: true } }
  // Сбрасываются автоматически при смене даты.
  sunnahDaily: { date: null, done: {} },
  // «Путь арабского»: пройденные шаги дорожки { [unitId]: { score, date } }
  completedPathUnits: {},
};

const Ctx = createContext(null);

// SRS — упрощённый: 1д -> 3д -> 7д -> 30д
const SRS_INTERVALS = [1, 3, 7, 30];

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function isYesterday(prev, today) {
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  return isSameDay(prev, y.toISOString());
}

export function ProgressProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
        }
      } catch (e) {
        console.warn('AsyncStorage load failed', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Дебаунс записи: сериализация всего стейта на КАЖДЫЙ тап (счётчики,
  // сунны, карточки) подтормаживала UI. Пишем через 400 мс после
  // последнего изменения — JS-поток свободен во время анимаций.
  const pendingRef = useRef(null);
  const timerRef = useRef(null);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingRef.current == null) return;
    const data = pendingRef.current;
    pendingRef.current = null;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('AsyncStorage save failed', e);
    }
  }, []);

  const persist = useCallback((next) => {
    pendingRef.current = next;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, 400);
  }, [flush]);

  // На размонтировании провайдера дописываем несохранённое
  useEffect(() => () => { flush(); }, [flush]);

  // При сворачивании приложения — немедленно сохраняем (debounce мог не успеть)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') flush();
    });
    return () => sub.remove();
  }, [flush]);

  const update = useCallback(
    (mutator) => {
      setState((prev) => {
        const next = typeof mutator === 'function' ? mutator(prev) : { ...prev, ...mutator };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // ----- Действия -----

  const completeOnboarding = (profile) =>
    update((s) => ({ ...s, onboardingDone: true, profile: { ...s.profile, ...profile } }));

  const completeLesson = (lessonId, xpGain = 10) =>
    update((s) => bumpStreak(addXp({ ...s, completedLessons: { ...s.completedLessons, [lessonId]: true }, lastOpenedLesson: lessonId }, xpGain)));

  const recordQuiz = (quizId, score, total) => {
    const xpGain = Math.round((score / Math.max(1, total)) * 30);
    update((s) =>
      bumpStreak(
        addXp(
          {
            ...s,
            completedQuizzes: {
              ...s.completedQuizzes,
              [quizId]: { score, total, date: new Date().toISOString() },
            },
          },
          xpGain
        )
      )
    );
  };

  // Шаг «Пути арабского» пройден (score — доля правильных в финальном тесте 0..1)
  const completePathUnit = (unitId, score = 1) => {
    const xpGain = 10 + Math.round(score * 10); // 10..20 XP
    update((s) =>
      bumpStreak(
        addXp(
          {
            ...s,
            completedPathUnits: {
              ...s.completedPathUnits,
              [unitId]: { score, date: new Date().toISOString() },
            },
          },
          xpGain
        )
      )
    );
  };

  const markWordLearned = (wordId, correct = true) => {
    update((s) => {
      const prev = s.learnedWords[wordId];
      const stage = correct ? Math.min((prev?.stage ?? -1) + 1, SRS_INTERVALS.length - 1) : 0;
      const next = new Date();
      next.setDate(next.getDate() + SRS_INTERVALS[stage]);
      return bumpStreak(
        addXp(
          {
            ...s,
            learnedWords: {
              ...s.learnedWords,
              [wordId]: {
                stage,
                nextReview: next.toISOString(),
                lastReviewed: new Date().toISOString(),
              },
            },
          },
          correct ? 3 : 1
        )
      );
    });
  };

  // ----- Закладки -----

  const bookmarkKey = (type, refId) => `${type}:${refId}`;

  const toggleBookmark = (entry) => {
    // entry: { type, refId, title, subtitle?, route?, params? }
    const key = bookmarkKey(entry.type, entry.refId);
    update((s) => {
      const next = { ...(s.bookmarks || {}) };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = { ...entry, addedAt: new Date().toISOString() };
      }
      return { ...s, bookmarks: next };
    });
  };

  const removeBookmark = (type, refId) => {
    const key = bookmarkKey(type, refId);
    update((s) => {
      const next = { ...(s.bookmarks || {}) };
      delete next[key];
      return { ...s, bookmarks: next };
    });
  };

  const isBookmarked = (type, refId) => {
    return !!(state.bookmarks || {})[bookmarkKey(type, refId)];
  };

  // ----- Заметки -----

  const addNote = ({ text, type, refId, title }) => {
    const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    update((s) => ({
      ...s,
      notes: {
        ...(s.notes || {}),
        [id]: { id, text, type: type || 'free', refId: refId || null, title: title || '', createdAt: now, updatedAt: now },
      },
    }));
    return id;
  };

  const updateNote = (id, patch) => {
    update((s) => {
      const cur = (s.notes || {})[id];
      if (!cur) return s;
      return {
        ...s,
        notes: { ...(s.notes || {}), [id]: { ...cur, ...patch, updatedAt: new Date().toISOString() } },
      };
    });
  };

  const removeNote = (id) => {
    update((s) => {
      const next = { ...(s.notes || {}) };
      delete next[id];
      return { ...s, notes: next };
    });
  };

  // ----- Ежедневные сунны -----

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Возвращает map выполненных id на сегодня (с авто-сбросом, если день сменился)
  const getSunnahDoneToday = () => {
    const cur = state.sunnahDaily || { date: null, done: {} };
    return cur.date === todayKey() ? (cur.done || {}) : {};
  };

  const toggleSunnahDone = (sunnahId) => {
    update((s) => {
      const today = todayKey();
      const cur = s.sunnahDaily || { date: null, done: {} };
      const done = cur.date === today ? { ...(cur.done || {}) } : {};
      const wasDone = !!done[sunnahId];
      if (wasDone) delete done[sunnahId];
      else done[sunnahId] = true;
      // Небольшой XP за каждую сунну (1 раз в день, не за «снять галочку»)
      const xpDelta = wasDone ? 0 : 2;
      return addXp({ ...s, sunnahDaily: { date: today, done } }, xpDelta);
    });
  };

  const reset = () => {
    setState(DEFAULT_STATE);
    persist(DEFAULT_STATE);
  };

  const resetQuiz = (quizId) => {
    update((s) => {
      const next = { ...s.completedQuizzes };
      delete next[quizId];
      return { ...s, completedQuizzes: next };
    });
  };

  const resetAllQuizzes = () => {
    update((s) => ({ ...s, completedQuizzes: {} }));
  };

  // ----- Чтения -----

  const wordsDueForReview = () => {
    const now = Date.now();
    return Object.entries(state.learnedWords)
      .filter(([, v]) => new Date(v.nextReview).getTime() <= now)
      .map(([id]) => id);
  };

  const value = {
    loaded,
    state,
    completeOnboarding,
    completeLesson,
    recordQuiz,
    markWordLearned,
    reset,
    resetQuiz,
    resetAllQuizzes,
    wordsDueForReview,
    toggleBookmark,
    removeBookmark,
    isBookmarked,
    addNote,
    updateNote,
    removeNote,
    getSunnahDoneToday,
    toggleSunnahDone,
    completePathUnit,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}

// --- helpers ---

function addXp(state, amount) {
  return { ...state, xp: (state.xp || 0) + amount };
}

function bumpStreak(state) {
  const today = new Date().toISOString();
  const last = state.streak.lastDate;
  if (!last) return { ...state, streak: { count: 1, lastDate: today } };
  if (isSameDay(last, today)) return state;
  if (isYesterday(last, today))
    return { ...state, streak: { count: state.streak.count + 1, lastDate: today } };
  return { ...state, streak: { count: 1, lastDate: today } };
}

export function levelFromXp(xp) {
  if (xp < 50) return { name: 'Новичок', current: xp, next: 50, index: 0 };
  if (xp < 200) return { name: 'Студент', current: xp - 50, next: 150, index: 1 };
  if (xp < 500) return { name: 'Исследователь', current: xp - 200, next: 300, index: 2 };
  if (xp < 1000) return { name: 'Хафиз слов', current: xp - 500, next: 500, index: 3 };
  return { name: 'Знаток Корана', current: xp - 1000, next: 1000, index: 4 };
}
