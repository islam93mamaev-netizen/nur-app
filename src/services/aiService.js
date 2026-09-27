// Сервис AI-помощника.
//
// Два провайдера (выбираются в Профиле):
//   1) OpenRouter — модель openrouter/free (Free Models Router): автоматически
//      выбирает любую доступную бесплатную модель из текущей ротации.
//      Получить ключ: https://openrouter.ai/settings/keys (регистрация бесплатная).
//      Ключ начинается с "sk-or-...". Лимиты free: 20 запросов/мин, ~50/день
//      (1000/день, если на аккаунте хоть раз покупались кредиты от $10).
//
//   2) DeepSeek (официальный API) — https://api.deepseek.com
//      Получить ключ: https://platform.deepseek.com/api_keys
//      Бесплатные стартовые токены (5М) для новых аккаунтов.
//      Ключ обычно начинается с "sk-...".
//
// Ключ хранится в AsyncStorage (settingsStore), вводится пользователем в Профиле.
// Также поддерживается переменная окружения / app.json как fallback для разработки.
//
// ВНИМАНИЕ: хранение ключа на устройстве ОК для личного использования.
// Для публикации в стор лучше пустить запросы через свой прокси-сервер.


const SYSTEM_PROMPT = `Ты — учитель основ Ислама в обучающем приложении «Нур».
Отвечай на русском языке коротко, дружелюбно, с уважением к источникам.

Правила:
- При толковании Корана и хадисов опирайся на сунну пророка Мухаммада ﷺ
  и общепринятые тафсиры (Ибн Касир, ас-Саади, аль-Куртуби).
- Не делай радикальных или политических заявлений.
- Не выдумывай хадисы. Если не уверен — скажи, что не знаешь источник.
- Арабские термины приводи с переводом: salat (намаз), zakat (закят), и т.д.
- Не давай юридических, медицинских или финансовых рекомендаций — только знания.
- Если вопрос вне рамок ислама — мягко перенаправь.`;

// Конфиги провайдеров: endpoint, модель, обязательные заголовки
const PROVIDER_CONFIG = {
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    // 'openrouter/free' — официальный Free Models Router: сам выбирает любую
    // доступную сейчас бесплатную модель. Надёжнее, чем зашивать конкретный id —
    // список бесплатных моделей постоянно ротируется.
    // https://openrouter.ai/docs/cookbook/get-started/free-models-router-playground
    model: 'openrouter/free',
    // Запасные конкретные модели — если роутер вернул ошибку
    fallbackModels: ['deepseek/deepseek-r1:free', 'deepseek/deepseek-v3:free'],
    // Опциональные заголовки OpenRouter — улучшают аналитику и не обязательны:
    extraHeaders: {
      'HTTP-Referer': 'https://nur-app.local',
      'X-Title': 'Nur — Islamic Learning App',
    },
  },
  deepseek: {
    url: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat', // основной chat-модель DeepSeek
    fallbackModels: [],
    extraHeaders: {},
  },
};

// Ключ вводит сам пользователь в Профиль → AI-помощник.
// Встроенного fallback-ключа больше нет — он утекал в JS-бандл (App Store review это ловит).

/**
 * Проверка, что AI настроен (есть ключ).
 * Принимает текущие настройки из useSettings().
 */
export function isAiConfigured({ aiApiKey } = {}) {
  return !!aiApiKey;
}

/**
 * Запрос к AI. Принимает:
 *   userMessage — текст вопроса
 *   history     — массив сообщений {role: 'user'|'assistant', text}
 *   settings    — { aiApiKey, aiProvider } из useSettings()
 */
export async function askAI(userMessage, history = [], settings = {}) {
  const { aiApiKey, aiProvider = 'openrouter' } = settings;
  const key = aiApiKey;
  if (!key) {
    throw new Error('AI не настроен. Откройте Профиль → AI-помощник и введите API-ключ.');
  }

  const cfg = PROVIDER_CONFIG[aiProvider] || PROVIDER_CONFIG.openrouter;

  // Формируем messages в OpenAI-совместимом формате (оба провайдера его поддерживают)
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text,
    })),
    { role: 'user', content: userMessage },
  ];

  // Пробуем основную модель, при «модель недоступна» — запасные из списка.
  const modelsToTry = [cfg.model, ...(cfg.fallbackModels || [])];
  let lastError = null;

  for (const model of modelsToTry) {
    let res;
    try {
      res = await fetch(cfg.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          ...cfg.extraHeaders,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });
    } catch (e) {
      throw new Error('Сеть недоступна или сервер не отвечает: ' + e.message);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      // Дружелюбные сообщения для типичных ошибок
      if (res.status === 401 || res.status === 403) {
        throw new Error('Неверный API-ключ. Проверьте его в Профиле.');
      }
      if (res.status === 429) {
        throw new Error('Превышен лимит бесплатных запросов (≈50/день). Попробуйте позже.');
      }
      // Частый случай для :free — настройки приватности OpenRouter блокируют
      // бесплатные модели (они обучаются на промптах, нужно явное согласие).
      if (/data policy|privacy|free model publication/i.test(errText)) {
        throw new Error(
          'OpenRouter блокирует бесплатные модели настройкой приватности.\n\n' +
          'Откройте openrouter.ai → Settings → Privacy и включите ' +
          '«Enable free endpoints that may train on inputs» (или «Model Training»), ' +
          'затем повторите вопрос.'
        );
      }
      // 404 / "model not found" — модель ушла из ротации, пробуем следующую
      if (res.status === 404 || /model/i.test(errText)) {
        lastError = new Error(`${model} вернул ${res.status}: ${errText.slice(0, 200)}`);
        continue;
      }
      throw new Error(`${model} вернул ${res.status}: ${errText.slice(0, 200)}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    const text = (typeof content === 'string' ? content : '').trim();
    if (text) return text;
    // Пустой ответ (бывает у free-моделей под нагрузкой) — пробуем следующую
    lastError = new Error(`${model}: пустой ответ`);
  }

  throw lastError || new Error('AI недоступен. Попробуйте позже.');
}

// Обратная совместимость со старым именем
export const askClaude = askAI;
