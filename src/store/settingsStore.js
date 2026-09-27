// Маленький стор настроек, не связанных с прогрессом и темой.
// Хранит:
//   - Сервис для просмотра хадисов (Иснад / Sunnah.com)
//   - API-ключ для AI-помощника (DeepSeek через OpenRouter или официальный)
//   - Провайдер AI (openrouter | deepseek)

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// ===== Защищённое хранение AI-ключа =====
// На iOS/Android ключ лежит в Keychain/Keystore (expo-secure-store),
// на вебе SecureStore недоступен — остаётся AsyncStorage.
// При первом запуске ключ автоматически мигрирует из AsyncStorage.
const SECURE_AI_KEY = 'nur_ai_api_key_v1'; // SecureStore не допускает '@' и '/'
const secureAvailable = Platform.OS !== 'web';

async function loadAiKey(legacyKey) {
  if (secureAvailable) {
    try {
      const v = await SecureStore.getItemAsync(SECURE_AI_KEY);
      if (v) return v;
      // Миграция со старого незащищённого хранилища
      const old = await AsyncStorage.getItem(legacyKey);
      if (old) {
        await SecureStore.setItemAsync(SECURE_AI_KEY, old);
        await AsyncStorage.removeItem(legacyKey);
        return old;
      }
      return '';
    } catch { /* fallthrough на AsyncStorage */ }
  }
  return (await AsyncStorage.getItem(legacyKey)) || '';
}

async function persistAiKey(legacyKey, value) {
  if (secureAvailable) {
    try {
      if (value) await SecureStore.setItemAsync(SECURE_AI_KEY, value);
      else await SecureStore.deleteItemAsync(SECURE_AI_KEY);
      return;
    } catch { /* fallthrough */ }
  }
  if (value) await AsyncStorage.setItem(legacyKey, value);
  else await AsyncStorage.removeItem(legacyKey);
}

const HADITH_SERVICE_KEY = '@nur_app/hadith_service_v1';
const AI_API_KEY = '@nur_app/ai_api_key_v1';
const AI_PROVIDER_KEY = '@nur_app/ai_provider_v1';

export const HADITH_SERVICES = {
  ISNAD: 'isnad',
  SUNNAH: 'sunnah',
};

export const HADITH_SERVICE_LABEL = {
  [HADITH_SERVICES.ISNAD]:  { short: 'Иснад',      long: 'Иснад (Isnad.link, рус.)' },
  [HADITH_SERVICES.SUNNAH]: { short: 'Sunnah.com', long: 'Sunnah.com (англ./араб.)' },
};

const DEFAULT_HADITH_SERVICE = HADITH_SERVICES.ISNAD;

// AI-провайдеры
export const AI_PROVIDERS = {
  OPENROUTER: 'openrouter', // OpenRouter с моделью DeepSeek V4 Flash (free)
  DEEPSEEK:   'deepseek',   // Официальный API DeepSeek (https://api.deepseek.com)
};

export const AI_PROVIDER_LABEL = {
  [AI_PROVIDERS.OPENROUTER]: {
    short: 'OpenRouter',
    long:  'OpenRouter — бесплатные модели (Free Router)',
    keyUrl: 'https://openrouter.ai/settings/keys',
  },
  [AI_PROVIDERS.DEEPSEEK]: {
    short: 'DeepSeek',
    long:  'Официальный DeepSeek API',
    keyUrl: 'https://platform.deepseek.com/api_keys',
  },
};

const DEFAULT_AI_PROVIDER = AI_PROVIDERS.OPENROUTER;

const Ctx = createContext(null);

export function SettingsProvider({ children }) {
  const [hadithService, setHadithServiceState] = useState(DEFAULT_HADITH_SERVICE);
  const [aiApiKey, setAiApiKeyState] = useState('');
  const [aiProvider, setAiProviderState] = useState(DEFAULT_AI_PROVIDER);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(HADITH_SERVICE_KEY);
        if (raw === HADITH_SERVICES.ISNAD || raw === HADITH_SERVICES.SUNNAH) {
          setHadithServiceState(raw);
        }
        const k = await loadAiKey(AI_API_KEY);
        if (k) setAiApiKeyState(k);
        const p = await AsyncStorage.getItem(AI_PROVIDER_KEY);
        if (p === AI_PROVIDERS.OPENROUTER || p === AI_PROVIDERS.DEEPSEEK) {
          setAiProviderState(p);
        }
      } catch (e) { /* ignore */ }
      setLoaded(true);
    })();
  }, []);

  const setHadithService = useCallback(async (next) => {
    if (next !== HADITH_SERVICES.ISNAD && next !== HADITH_SERVICES.SUNNAH) return;
    setHadithServiceState(next);
    try { await AsyncStorage.setItem(HADITH_SERVICE_KEY, next); } catch (e) { /* ignore */ }
  }, []);

  const setAiApiKey = useCallback(async (next) => {
    const trimmed = (next || '').trim();
    setAiApiKeyState(trimmed);
    try {
      await persistAiKey(AI_API_KEY, trimmed);
    } catch (e) { /* ignore */ }
  }, []);

  const setAiProvider = useCallback(async (next) => {
    if (next !== AI_PROVIDERS.OPENROUTER && next !== AI_PROVIDERS.DEEPSEEK) return;
    setAiProviderState(next);
    try { await AsyncStorage.setItem(AI_PROVIDER_KEY, next); } catch (e) { /* ignore */ }
  }, []);

  const value = {
    loaded,
    hadithService, setHadithService,
    aiApiKey, setAiApiKey,
    aiProvider, setAiProvider,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Безопасный fallback вне провайдера
    return {
      loaded: true,
      hadithService: DEFAULT_HADITH_SERVICE, setHadithService: () => {},
      aiApiKey: '', setAiApiKey: () => {},
      aiProvider: DEFAULT_AI_PROVIDER, setAiProvider: () => {},
    };
  }
  return ctx;
}
