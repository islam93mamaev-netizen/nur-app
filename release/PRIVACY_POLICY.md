# Политика конфиденциальности — «Нур»

_Последнее обновление: 14 сентября 2026 г._

Приложение **«Нур»** («мы», «приложение») — это оффлайн-ресурс для изучения основ ислама, чтения Корана и хадисов, поминаний, времён намаза и других повседневных инструментов практикующего мусульманина.

Мы уважаем вашу приватность. Ниже — простое и полное описание того, какие данные приложение обрабатывает, куда они уходят и как вы ими управляете.

## Кратко (TL;DR)

- Мы **не собираем персональные данные** и **не отправляем их на наши серверы** — у нас нет серверов.
- Весь ваш прогресс, закладки и настройки хранятся **только на вашем устройстве** в локальном хранилище приложения.
- Уведомления, геолокация и микрофон — используются локально, только пока приложение работает или запланировано напоминание.
- Сторонние сервисы, к которым приложение обращается (Quran.com, Sunnah.com, isnad.link, OpenRouter/DeepSeek), имеют собственные политики. Обращения к ним — только когда вы этого явно требуете (открытие ссылки, вопрос AI-помощнику).

## 1. Данные, которые обрабатывает приложение

### 1.1 Локально — на вашем устройстве

- **Прогресс уроков, тестов, серии дней, XP, уровень.** Хранятся в `AsyncStorage` устройства. Никогда не отправляются наружу.
- **Закладки** (аяты, хадисы, дуа, имена Аллаха) — локально.
- **Заметки** к урокам — локально.
- **Ваш API-ключ AI-помощника** (если вы его вводите в Профиле) — локально. Приложение никогда не отправляет ключ никуда, кроме API-эндпоинта того сервиса, для которого он предназначен.
- **Настройки** — тема, размер шрифта, выбор источника хадисов, выбор AI-провайдера.

### 1.2 Геолокация

Приложение запрашивает **разрешение на использование геолокации при включённой функции «Времена намаза»**. Координаты используются только для расчёта времён намаза по локальной библиотеке (adhan) прямо на устройстве. **Координаты никуда не отправляются.**

### 1.3 Уведомления

Приложение планирует локальные уведомления (аят дня, напоминания о намазах). Все уведомления генерируются и планируются **локально на устройстве** через iOS/Android API. Push-серверов у приложения нет.

### 1.4 Микрофон

Приложение **не использует микрофон**. Разрешение `NSMicrophoneUsageDescription` присутствует в манифесте только потому, что этого требует зависимость `expo-audio`, — фактическая функциональность записи не задействована.

## 2. Сторонние сервисы

Приложение обращается к следующим внешним API. Обращение происходит **только в момент вашего действия** (открытие суры, тап по ссылке хадиса, отправка вопроса AI). Приложение не отправляет туда персональные данные — только контент запроса.

- **Quran.com API** — для получения текста и переводов сур, аудио декламации. См. https://quran.com/terms
- **Sunnah.com** — открытие внешней ссылки на хадис в браузере, если выбран этот источник в настройках. См. https://sunnah.com/about
- **isnad.link** — открытие внешней ссылки на хадис в браузере (источник по умолчанию для русскоязычного контента).
- **quran.ksu.edu.sa / everyayah.com** — CDN для аудио аятов.
- **AI-помощник (OpenRouter / DeepSeek).** Работает **только если вы ввели свой API-ключ** в разделе «Профиль → AI-помощник». Вопросы, которые вы задаёте помощнику, отправляются в выбранный сервис вместе с вашим ключом. Мы не имеем доступа к этим данным. Правила использования — на стороне провайдера:
  - OpenRouter: https://openrouter.ai/terms
  - DeepSeek: https://platform.deepseek.com/terms

## 3. Данные детей

Приложение подходит для семейного использования, но **не собирает никаких данных о пользователях, включая детей** (COPPA-совместимо, GDPR-Art. 8 совместимо).

## 4. Ваши права

Поскольку никаких данных мы не храним на серверах, все ваши права реализованы вами напрямую:

- **Удалить всё** — удалите приложение с устройства. Все данные (прогресс, закладки, ключ) удалятся вместе с ним. Никаких «остатков» на наших серверах нет, потому что серверов нет.
- **Экспорт данных** — планируется в будущих версиях (кнопка «Экспорт JSON» в Профиле).
- **Отозвать доступ к геолокации / уведомлениям / микрофону** — в Настройках iOS/Android для приложения «Нур».

## 5. Изменения политики

Мы можем обновлять эту политику. Дата вверху документа отражает последнее обновление. Существенные изменения будут анонсированы в описании обновления в App Store.

## 6. Контакты

По вопросам, связанным с приватностью, а также для обратной связи:

**Разработчик:** Ислам Мамаев
**E-mail:** islam93.mamaev@gmail.com

---

# Privacy Policy — “Nur” (English)

_Last updated: September 14, 2026_

**Nur** is an offline-first educational app for Islamic studies: Qur’an reading, hadith, adhkar, prayer times, and daily worship tools.

## TL;DR

- We collect **no personal data** and have **no servers**.
- Progress, bookmarks, settings and your (optional) AI API key are stored **on-device only**.
- Location, notifications, and microphone permissions are used locally.
- Third-party services (Quran.com, Sunnah.com, isnad.link, OpenRouter/DeepSeek) are contacted only when you explicitly invoke them. See their own policies.

## 1. Data handled by the app

**On-device only** (via AsyncStorage): progress, XP, streak, bookmarks, notes, settings, your AI API key.

**Location:** requested for prayer time calculation via the on-device `adhan` library. Coordinates are never transmitted.

**Notifications:** local only, scheduled via iOS/Android APIs. No push servers.

**Microphone:** not used. `NSMicrophoneUsageDescription` is declared solely because the `expo-audio` dependency requires it.

## 2. Third-party services

Contacted only on your explicit action:

- Quran.com API — Surah texts and translations
- Sunnah.com / isnad.link — external hadith links opened in the browser
- everyayah.com / quran.ksu.edu.sa — audio CDN
- OpenRouter / DeepSeek — only when you paste your own key in Profile → AI Assistant. Your prompts are sent to the chosen provider with your key. We have no access.

## 3. Children

No data is collected about any users, including children.

## 4. Your rights

Delete the app to erase all data — there is nothing on our servers because we have none.

## 5. Contact

**Developer:** Islam Mamaev
**E-mail:** islam93.mamaev@gmail.com
