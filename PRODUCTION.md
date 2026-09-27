# Production-гайд «Нур»

Пошаговая инструкция: от чистого репозитория до публикации в App Store и Google Play.
Всё, что нужно сделать одному разработчику без команды.

---

## 0. Предусловия

- Аккаунт Apple Developer ($99 / год) — нужен для App Store
- Аккаунт Google Play Developer ($25 единоразово) — нужен для Play Store
- Аккаунт [Expo](https://expo.dev) (бесплатный)
- Установлено: Node.js ≥ 18, npm, Git

Без аккаунтов разработчика можно собирать APK для тестирования и публиковать веб-версию,
но магазины приложений будут недоступны.

---

## 1. Подготовка проекта

### 1.1. Установка зависимостей

```bash
cd NurApp
npm install
```

### 1.2. Проверка ключевых полей в `app.json`

Откройте `app.json` и убедитесь, что заполнено:

```jsonc
{
  "expo": {
    "name": "Нур",                          // отображаемое имя
    "slug": "nur-app",                      // slug в Expo (без пробелов)
    "version": "1.0.0",                     // SemVer
    "ios": {
      "bundleIdentifier": "com.yourname.nur", // ❗ замените на свой reverse-domain
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourname.nur",         // ❗ замените
      "versionCode": 1
    },
    "extra": {
      "eas": { "projectId": "..." },         // ❗ заполнится при первом `eas init`
      "claudeApiKey": ""                     // оставьте пустым в коммите; задавайте через secrets
    }
  }
}
```

> **Важно**: `bundleIdentifier` нельзя менять после первой публикации в App Store.

### 1.3. Проверка иконок и splash-screen

В `app.json` указаны:

- `icon` → `./assets/icon.png` (1024×1024)
- `splash.image` → `./assets/splash.png` (≥ 1242×2436)
- `android.adaptiveIcon.foregroundImage`

Замените их на свои финальные ассеты. Прозрачность у iOS-иконки не допускается.

---

## 2. Чек-лист контента и качества

Перед сборкой пройдитесь по списку:

- [ ] Все экраны работают и в **светлой**, и в **тёмной** теме (Профиль → Оформление)
- [ ] Тексты Корана/хадисов сверены с источниками (см. README раздел «Достоверность»)
- [ ] Ссылки на источники в `ReferenceText` открываются (нажмите на «(2:255)» в любом аяте)
- [ ] Аудио чтения Корана воспроизводится (Surah → Play)
- [ ] Времена намазов рассчитываются корректно (PrayerTimes — нужно разрешение геолокации)
- [ ] Кибла-компас вращается (Qibla)
- [ ] Тасбих считает нажатия и сохраняет счётчик после перезапуска
- [ ] Сира и Истории 25 пророков открываются и листаются
- [ ] Закладки/Заметки сохраняются после перезапуска
- [ ] Push-уведомления приходят (PrayerTimes → разрешите уведомления)
- [ ] AI работает (с ключом — Claude, без — fallback-ответы)
- [ ] Онбординг проходится с нуля (Profile → Сбросить прогресс)

---

## 3. EAS Build — облачная сборка

EAS Build собирает iOS-сборки на Mac в облаке Expo, поэтому Mac локально не нужен.

### 3.1. Установка и логин

```bash
npm install -g eas-cli
eas login                  # введите credentials аккаунта Expo
eas init                   # создаст extra.eas.projectId в app.json
```

### 3.2. Конфигурация `eas.json`

В проекте уже есть готовый `eas.json` с тремя профилями:

| Профиль       | Что выдаёт                                  | Когда использовать                  |
|---------------|---------------------------------------------|-------------------------------------|
| `development` | dev-сборка для подключения к Expo Dev Client | повседневная разработка             |
| `preview`     | внутренняя APK / IPA (Ad-hoc)                | тестирование на устройствах         |
| `production`  | бинарь для магазинов (AAB / IPA)             | релиз в App Store / Google Play     |

### 3.3. Первая сборка под Android (быстрее и без подписки Apple)

```bash
eas build --platform android --profile preview
```

- Сборка идёт ≈ 15–25 минут
- В конце получите ссылку на `.apk` — установите её через ADB или просто скачайте на телефон

### 3.4. Production-сборка под Android (AAB для Play)

```bash
eas build --platform android --profile production
```

EAS автоматически создаст keystore и сохранит его в облаке (не теряйте — для обновлений нужен тот же).
Скачайте `.aab` после завершения.

### 3.5. Production-сборка под iOS

```bash
eas build --platform ios --profile production
```

При первом запуске EAS попросит:
1. Войти в Apple Developer аккаунт
2. Создать App ID + Provisioning Profile + Distribution Certificate (всё автоматически)

Получите `.ipa` для App Store.

---

## 4. Секретные ключи (Claude API)

Не коммитьте ключ в `app.json`. Используйте EAS Secrets:

```bash
eas secret:create --scope project --name CLAUDE_API_KEY --value sk-ant-...
```

В `app.json` оставьте `extra.claudeApiKey: ""`. В `src/services/aiService.js` поменяйте чтение
на `process.env.CLAUDE_API_KEY || Constants.expoConfig?.extra?.claudeApiKey`.

> **Лучшая практика**: вместо встраивания ключа в клиент — поднимите Cloudflare Worker / Vercel
> Function как прокси, который добавляет заголовок `x-api-key` на стороне сервера.
> Иначе ключ можно вытащить из бинарника.

---

## 5. Публикация в App Store

### 5.1. App Store Connect

1. Зайдите на [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps → +** → New App
3. Заполните: Platform: iOS, Name: Нур, Primary Language: Russian, Bundle ID: тот, что в `app.json`
4. SKU: любой уникальный, например `nur-001`

### 5.2. Загрузка билда

```bash
eas submit --platform ios --latest
```

EAS возьмёт последний production-билд и загрузит через App Store Connect API.
Альтернатива — Transporter (десктоп) или `xcrun altool`.

После загрузки билд появится в App Store Connect через 5–30 минут (после processing).

### 5.3. Метаданные в App Store Connect

Заполните во вкладке **App Information** и **Version 1.0.0**:

| Поле                  | Что писать                                                          |
|-----------------------|---------------------------------------------------------------------|
| Promotional Text      | «Изучайте Ислам шаг за шагом: Коран, хадисы, арабский, намаз»       |
| Description           | См. ниже                                                            |
| Keywords              | ислам,коран,намаз,хадис,арабский,дуа,кибла,муслим                  |
| Support URL           | ссылка на лендинг / email                                           |
| Category              | Education (Primary), Lifestyle (Secondary)                          |
| Age Rating            | 4+ (без ограничений)                                                |
| Pricing               | Free                                                                |

**Шаблон описания:**

```
Нур — комплексное приложение для изучения Ислама.

В одном приложении:
• Основы Ислама в 25 уроках с тестами
• Коран — все 114 сур с переводом и аудио
• Истории 25 пророков и Сира пророка Мухаммада ﷺ
• 99 имён Аллаха с произношением
• Времена 5 намазов по вашим координатам
• Кибла-компас, тасбих, календарь хиджры
• Карточки 300+ слов Корана с интервальным повторением
• Дуа на каждый день и арабский алфавит
• Закладки, заметки, прогресс — всё локально, без регистрации

Приложение работает оффлайн (после первой загрузки сур).
Никакого трекинга. Никакой рекламы.

Бара́ка Алла́ху фи́кум.
```

### 5.4. Скриншоты

Требуются для размеров (минимум):

- iPhone 6.7" (Pro Max) — 1290 × 2796
- iPhone 6.5" (XS Max)  — 1242 × 2688
- iPhone 5.5" (8 Plus)   — 1242 × 2208
- iPad 12.9"             — 2048 × 2732 (если поддерживается iPad)

Снимите экраны: главная, аят дня + хадис дня, сура с аудио, времена намазов, тасбих, профиль.

### 5.5. Submit for Review

Нажмите **Submit for Review**. Apple обычно проверяет 1–3 дня. Возможные риски:

- Просят демо-аккаунт — у нас нет логина, укажите «not required»
- Просят `NSLocationWhenInUseUsageDescription` — уже описано в `app.json` для PrayerTimes
- Просят описание использования камеры/микрофона — у нас не используется

---

## 6. Публикация в Google Play

### 6.1. Создание приложения

1. [play.google.com/console](https://play.google.com/console) → **Create app**
2. App name: Нур, Default language: Russian, Type: App, Free
3. Подтвердите соответствие политикам

### 6.2. Загрузка AAB

```bash
eas submit --platform android --latest
```

Альтернатива — вручную залить `.aab` в **Production → Create new release**.

### 6.3. Заполнение Store Listing

Аналогично App Store. Скриншоты ≥ 1080px. Иконка 512×512 PNG без прозрачности.
Feature graphic 1024×500 для карточки в Play.

### 6.4. Data safety + Content rating

Пройдите опросник Data Safety: укажите что **не собираете персональные данные**
(всё хранится локально). Геолокация — only on device, не передаётся.

### 6.5. Submit for review

Первая публикация проверяется 1–7 дней. Затем — несколько часов.

---

## 7. Web-версия (бонус, бесплатно)

```bash
npx expo export --platform web
```

Получите `dist/`. Залейте на любой статический хостинг:

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Или Cloudflare Pages, Vercel, GitHub Pages — всё работает.

> На web не работают: push-уведомления, expo-sensors (компас Киблы). Остальное — да.

---

## 8. Обновления (OTA через EAS Update)

Большую часть багов можно фиксить без релиза в магазин:

```bash
eas update --branch production --message "Исправлены опечатки в хадисах"
```

Пользователи получат обновление JS-кода при следующем запуске приложения.
Это работает только для **JS/контентных** изменений. Если поменялись зависимости,
плагины Expo или native-код — нужна полная пересборка.

---

## 9. Backup и восстановление

- Исходный код держите в Git (приватный репо на GitHub/GitLab)
- Keystore для Android хранится в EAS, дополнительно скачайте копию:
  `eas credentials --platform android` → Download keystore
- Distribution Certificate для iOS — тоже выгружаемые из EAS
- При смене разработчика передайте: репозиторий, доступ к Expo team, оба keystore, credentials Apple

---

## 10. Соответствие ToS магазинов

- **Религиозный контент** разрешён в обоих магазинах
- Указание `Age Rating 4+` корректно — у нас нет насилия, рекламы и т.п.
- Apple требует, чтобы AI-функция была явно описана. В Description укажите: «AI-помощник
  отвечает на учебные вопросы об Исламе (если подключен ключ Anthropic Claude)»
- Если используете proxy-сервер для AI — добавьте Privacy Policy с упоминанием
  передачи текста запроса на сервер Anthropic

---

## Контрольный список релиза

```
[ ] version и buildNumber/versionCode подняты в app.json
[ ] CHANGELOG обновлён
[ ] git tag v1.0.0 && git push --tags
[ ] eas build --platform all --profile production
[ ] Скачать билды, протестировать на реальном устройстве
[ ] eas submit --platform all --latest
[ ] Заполнить метаданные в App Store Connect + Play Console
[ ] Submit for Review
[ ] Дождаться апрува, нажать Release
```

---

Бара́ка Алла́ху фи́кум. И облегчит Всевышний это дело тем, кто несёт пользу.
