// goldPriceService — получение текущей цены золота и серебра
// в выбранной валюте.
//
// Используем 2 бесплатных API без API-ключа:
//   1. https://api.gold-api.com/price/XAU  — цена за тройскую унцию (31.1035 г) в USD
//      и /price/XAG для серебра
//   2. https://api.frankfurter.app/latest?from=USD&to=RUB,EUR,...  — курсы валют (ЕЦБ)
//
// Если запрос упал — возвращаем null, и UI просит ввести цену вручную.
//
// Простой in-memory кэш на 1 час (цена золота не меняется драматически за час).

const TROY_OZ_GRAMS = 31.1034768;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 час

let cache = { ts: 0, data: null };

async function fetchJson(url, timeoutMs = 8000) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Возвращает цены золота и серебра в выбранной валюте (за грамм).
 *
 * @param {string} currency — код валюты (USD, EUR, RUB, ...)
 * @returns {Promise<{ gold: number, silver: number, currency: string, ts: number } | null>}
 */
export async function fetchMetalPrices(currency = 'USD') {
  const now = Date.now();
  if (cache.data && cache.data.currency === currency && now - cache.ts < CACHE_TTL_MS) {
    return cache.data;
  }

  // 1. Получаем XAU и XAG в USD за унцию
  const goldUSD = await fetchJson('https://api.gold-api.com/price/XAU');
  const silverUSD = await fetchJson('https://api.gold-api.com/price/XAG');
  if (!goldUSD || !silverUSD || typeof goldUSD.price !== 'number') {
    return null;
  }
  const goldUsdPerOz = goldUSD.price;
  const silverUsdPerOz = typeof silverUSD.price === 'number' ? silverUSD.price : null;

  // 2. Конвертируем в нужную валюту (если не USD)
  let rate = 1;
  if (currency.toUpperCase() !== 'USD') {
    const fx = await fetchJson(`https://api.frankfurter.app/latest?from=USD&to=${currency.toUpperCase()}`);
    if (fx && fx.rates && typeof fx.rates[currency.toUpperCase()] === 'number') {
      rate = fx.rates[currency.toUpperCase()];
    } else {
      return null; // не получилось получить курс
    }
  }

  const result = {
    gold: (goldUsdPerOz * rate) / TROY_OZ_GRAMS,
    silver: silverUsdPerOz ? (silverUsdPerOz * rate) / TROY_OZ_GRAMS : null,
    currency: currency.toUpperCase(),
    ts: now,
  };
  cache = { ts: now, data: result };
  return result;
}

// Сбросить кэш — например, при ручном «обновить»
export function clearMetalPriceCache() {
  cache = { ts: 0, data: null };
}
