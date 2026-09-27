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
- Шрифты: Manrope (кириллица), Amiri (арабский). Загружаются в `App.js` через expo-font. В `App.js` есть глобальный патч `Text.render`: масштабирует fontSize по настройке пользователя и автоматически подставляет Amiri любому тексту с арабскими символами — арабским стилям НЕ нужно прописывать fontFamily вручную
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

Возможные следующие шаги: синхронизация через Supabase (пользователь даст URL + anon key),
скачивание аудио сур для офлайна, единый DetailHeader, иконки в данных категорий.

ВАЖНО: после этих изменений нужен `npm install` (новые пакеты: @expo-google-fonts/*, expo-haptics, expo-secure-store).

## Проверка

Перед сдачей шага: прогнать изменённые файлы через babel-проверку синтаксиса, убедиться что экран работает в обеих темах. Тестов в проекте нет.
