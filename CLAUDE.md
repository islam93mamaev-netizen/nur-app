# Нур — приложение для изучения Ислама

React Native 0.81 + Expo SDK 54 (iOS / Android / Web). Язык интерфейса — русский.
~50 экранов, весь контент в `src/data/*.js`, прогресс локально в AsyncStorage (без сервера).

## Команды

```bash
npm install   # postinstall применяет patches/ через patch-package
npm start     # затем i / a / w
```

Node 22.x LTS (на Node 26 ломается @expo/cli без патча).

## Архитектура

- `src/constants/theme.js` — дизайн-система: `lightColors`/`darkColors`, `spacing`, `radii`, `typography`, `shadows`, `fonts`, `brandPalette` (фиксированные цвета категорий для data-файлов)
- `src/store/` — React Context-сторы: `progressStore` (XP, уроки, SRS-слова, стрик, закладки, сунны дня), `themeStore` (тема light/dark/system + fontScale), `settingsStore` (сервис хадисов, AI-ключ)
- `src/navigation/` — `RootNavigator` (stack) + `TabNavigator` (5 табов)
- `src/services/` — quranService (AlQuran Cloud API + кэш 7 дней), audioService, prayerService (библиотека adhan), notificationService, aiService, ttsService
- `src/components/Icon.js` — единый набор векторных SVG-иконок (стиль Feather, на react-native-svg). Эмодзи в UI не использовать — только Icon

## Конвенции кода

- Стили: `const styles = useMemo(() => makeStyles(colors), [colors])` + `makeStyles(colors)` внизу файла. Цвета только из `useTheme()` — каждый экран обязан работать в светлой и тёмной теме
- Шрифты: Manrope (кириллица), Amiri (арабский). Загружаются в `App.js` через expo-font. Глобальный патч `<Text>` (`src/utils/textPatch.web.js` / `.native.js`, логика в `textStyleAdjust.js`, подключается первым импортом в `App.js`): масштабирует fontSize/lineHeight по настройке пользователя и подставляет Noto Naskh тексту с арабскими символами — арабским стилям НЕ нужно прописывать fontFamily вручную. Web — обёртка `Text.render` (forwardRef в RNW), натив — подмена `default` модуля `react-native/Libraries/Text/Text` (в RN 0.81 у Text нет `.render`, старый патч молча не работал)
- У Amiri высокие харакаты: lineHeight для арабского ≥ 1.7 × fontSize
- Новые экраны регистрировать в `RootNavigator.js`
- Никаких новых тяжёлых зависимостей без необходимости; react-native-svg уже есть

## Текущий план улучшений

Работаем по шагам, после каждого шага пользователь проверяет визуально, потом следующий.

Сделано:
1. ✅ Векторные иконки вместо эмодзи (Icon.js, таб-бар, mini-кнопки главной)
2. ✅ Шрифты Manrope + Amiri (@expo-google-fonts/amiri, manrope)
3. ✅ Виджет «следующий намаз» (NextPrayerCard) + дата хиджры (utils/hijri.js)
4. ✅ Реорганизация главной: data-driven секции, порядок по profile.goal, без пустых ячеек; уровень убран с главной, статистика перенесена в Профиль (2×2)
5. ✅ Визуальная идентичность: PatternBackground (SVG-градиент + орнамент гирих) на виджете намаза, золотой ромб в SectionHeader
6. ✅ Хаптика (utils/haptics.js на expo-haptics): тесты, сунны, счётчик азкаров; анимированный ProgressBar; LayoutAnimation на раскрытии сунн
7. ✅ Глобальный поиск (screens/search/SearchScreen.js, маршрут Search, кнопка на главной): уроки, хадисы, дуа, слова, FAQ, асма, азкары
8. ✅ Коран: LAST_READ_KEY + ContinueReadingCard на главной, подсветка играющего аята + автоскролл
12. ✅ Тех. чистка: README обновлён, .npm-cache удалён и в .gitignore, App.full.js удалён, AI-ключ в expo-secure-store (с миграцией из AsyncStorage)

Дополнительно сделано:
- Азкары: секция «После намаза» (7 азкаров), полные транскрипции, фиксы Web Speech API
- data/suraTexts.js — единый источник текстов сур 112-114 (DRY из quran.js)
- quranAudio в азкарах: чтение Корана (локальный mp3 из assets/prayer/audio или CDN) вместо TTS; audioService принимает и URL, и require()-ассеты
- Фикс: смена размера шрифта больше не сбрасывает навигацию (убран key-remount)

11. ✅ Режим Рамадана (screens/ramadan): сухур/ифтар, трекеры поста и таравиха, баннер на главной в месяц 9
✅ «Путь арабского» (data/arabicPath.js + screens/path/): направляемая дорожка из 5 этапов
   (буквы → огласовки → топ-50 слов → грамматика A1 → короткие суры), линейная разблокировка,
   мини-тесты с порогом 70%, прогресс в progressStore.completedPathUnits, карточка на главной
✅ Фоновое аудио (shouldPlayInBackground + UIBackgroundModes), play/pause toggle в Коране,
   спиннер загрузки CDN, мини-тесты `npm test` (scripts/test.js, без jest)

10. ✅ Экспорт/импорт прогресса (screens/backup, кнопка в Профиле; секреты исключены)
9. ❌ Экран статистики — отменён пользователем

Языковой пакет (всё сделано): разбор слова по буквам в Коране (тап по слову → модал
с WordBreakdown + перевод из словаря), тесты на контекстные формы букв, тренажёр
слогов (ph_3), большое повторение (pw_review), слова батчей уходят в SRS, дневная
цель на дорожке. Арабский шрифт по умолчанию — Noto Naskh Arabic (Amiri остаётся
как fonts.arabicCalligraphy). AI: openrouter/free + фолбэк-модели.
Тесты: `npm test` (scripts/test.js, 14 проверок). Эмодзи-глифы плеера заменены на Icon.

Ревью (нояб. 2026): исправлено — конфликт глобального аудио-режима (PrayerLessonScreen
перетирал shouldPlayInBackground=false; теперь ensureAudioMode экспортируется из
audioService и используется всеми), дубли splitArabic (→ utils/arabicParser.js)
и notifyNoVoice (→ ttsService.notifyNoArabicVoice).

Рефакторинг (нояб. 2026) — сделано:
- DetailHeader (components/DetailHeader.js, пропсы title/subtitle/pattern/align/background/backLabel)
  используется на 45 экранах вместо копий «← Назад». Новые экраны — только через него.
- hooks/useAdhkarPlayer.js — плеер (TTS + Коран-аудио + фрагменты, токены); используют
  AdhkarSectionScreen и DuaCategoryScreen
- components/PathQuiz.js — мини-тест с результатом (PathUnitScreen)
- Главная: HomeScreen только компонует блоки из components/home/*, секции — data/homeSections.js
- components/CategoryIcon.js — эмодзи из data → векторная иконка (таблица EMOJI_TO_ICON;
  нет соответствия → показывает эмодзи). Слишком тёмные цвета данных на тёмной теме
  автоматически подменяются на светлый изумрудный. Подключено: Дуа, FAQ, Азкары, Основы,
  Этика, Слова. Ещё на эмодзи: Грамматика, Тесты, Сира, Сахабы, Мазхабы, Пост, Достижения.
- Онбординг — один экран (Welcome): «Начать» сразу completeOnboarding с дефолтами
- Намазы: ручной выбор города (data/cities.js, CityPickerModal), PRAYER_STORAGE.LOCATION_MODE,
  formatTime(date, tz) показывает время в поясе выбранного города
- Блок «Цель за день — сунна» убран с главной → отдельный экран «Сунны дня»
  (screens/sunnah/SunnahScreen.js, маршрут Sunnah, кнопка «Сунны» в секции «Поклонение»):
  чек-лист data/sunnahDaily.js, отметки getSunnahDoneToday/toggleSunnahDone, переходы по refRoute
  (вкладки — через navigate('Main', { screen }))
- Профиль: убраны цель, уровень/мин в день и карточка XP-уровня; осталась статистика 2×2
  (стрик, уроки, слов изучено, на повторение) и достижения

Достоверность контента (нояб. 2026):
- utils/hadithGrade.js: явное поле `grade` → сахихи Бухари/Муслима → степень из строки источника → иначе
  «не указана». Степени НЕ выдумывать: для 40 хадисов проставлены оценки, приведённые самим ан-Навави
  (поле gradeBasis). components/HadithGrade — плашка под источником (Хадисы, 40 хадисов)
- screens/sources/SourcesScreen (маршрут Sources, кнопка в Профиле): источники контента, статистика
  степеней, дисклеймер «не фетва», «Сообщить об ошибке» (mailto)
- utils/dialogs.js: notify/confirmAction — Alert.alert на вебе не работает, использовать только их

Найдено регрессией и исправлено:
- GrammarLessonScreen читает route.params.id, а путь передавал lessonId (пустой урок)
- `{строка && <X/>}` с пустой строкой → текст внутри View (краш на iOS). Правило:
  для строковых полей всегда `{!!поле && ...}`

Возможные следующие шаги: CategoryIcon на оставшиеся экраны, синхронизация Supabase,
офлайн-аудио сур (expo-file-system), max-width контента на широком вебе.

ВАЖНО: после этих изменений нужен `npm install` (новые пакеты: @expo-google-fonts/*, expo-haptics, expo-secure-store).

## Проверка

Перед сдачей шага:
- `npm test` (scripts/test.js, 26 проверок: хиджра, тексты сур, путь арабского, намазы, города +
  целостность данных: дубли id, хадисы без источника, FAQ без мазхаба, маршруты главной/сунн).
  `VERBOSE=1 npm test` — список хадисов без степени достоверности (на проверку)
- babel-проверка синтаксиса всех файлов src/
- живая проверка в браузере: `npx expo start` → http://localhost:8081, экран в обеих темах.
  В вебе нижние вкладки и предыдущие экраны остаются в DOM скрытыми — в автоскриптах
  фильтровать элементы по видимости.
