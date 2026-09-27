/**
 * Идемпотентные патчи для node_modules.
 * Запускается автоматически после каждого `npm install` (см. package.json → postinstall).
 * Также применяется в облаке EAS Build.
 *
 * Причина: patch-package в EAS-облаке требует идеального совпадения контекста,
 * а наши ручные патчи слегка расходятся с оригиналом. Текстовые replace устойчивы.
 *
 * Что делаем:
 *   1. react-native-gesture-handler@2.28.0 → src/handlers/gestures/GestureDetector.tsx
 *      Metro читает `src/*` (см. package.json → "react-native": "src/index.ts"),
 *      а в исходнике сломанные импорты — приложение падает с
 *      "TypeError: Cannot convert undefined value to object" ещё до нашего кода.
 *      Правим импорты на существующие символы + подтягиваем filterConfig/findNodeHandle
 *      /scheduleFlushOperations из ../utils.
 *
 *   2. expo/@expo/cli waitForMetroToObserveTypeScriptFile.js — `eventsQueue || []`
 *      (нужно только локально; в облаке EAS этот код не запускается — пропускаем,
 *      если файл отсутствует).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let touched = 0;
let skipped = 0;

// Рекурсивно ищет файл с именем `basename` внутри `dir` (максимум 6 уровней вглубь).
// Нужно как fallback на случай, если резолвнутая версия пакета в облаке
// раскладывает файлы иначе, чем локально (другая структура таргета, симлинки и т.п.).
function findFile(dir, basename, depth = 6) {
  if (depth < 0 || !fs.existsSync(dir)) return null;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules') continue; // не лезем во вложенные node_modules
    const full = path.join(dir, entry.name);
    if (entry.isFile() && entry.name === basename) return full;
    if (entry.isDirectory()) {
      const found = findFile(full, basename, depth - 1);
      if (found) return found;
    }
  }
  return null;
}

// Печатает дерево каталога (для диагностики, если файл не нашёлся вообще нигде).
function dumpTree(dir, depth = 2, prefix = '') {
  if (depth < 0 || !fs.existsSync(dir)) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.name !== 'node_modules');
  } catch {
    return;
  }
  for (const entry of entries) {
    console.log(`${prefix}${entry.isDirectory() ? '📁' : '📄'} ${entry.name}`);
    if (entry.isDirectory()) {
      dumpTree(path.join(dir, entry.name), depth - 1, prefix + '  ');
    }
  }
}

function patch(relativePath, transforms, { optional = false, packageDirForDiagnostics = null } = {}) {
  let full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) {
    // Fallback: ищем файл с тем же именем в другом месте того же пакета —
    // резолвнутая в облаке версия/раскладка могла отличаться от локальной.
    const basename = path.basename(relativePath);
    const searchRoot = packageDirForDiagnostics
      ? path.join(ROOT, packageDirForDiagnostics)
      : path.dirname(full);
    const found = findFile(path.join(ROOT, packageDirForDiagnostics || path.dirname(relativePath)), basename);
    if (found) {
      console.log(`  ↷ ${relativePath} не найден по ожидаемому пути, но нашёлся: ${path.relative(ROOT, found)}`);
      full = found;
    } else if (optional) {
      console.log(`  ↷ skip (missing): ${relativePath}`);
      return;
    } else {
      console.error(`  ✖ file not found: ${relativePath}`);
      if (packageDirForDiagnostics) {
        console.error(`  ▼ содержимое ${packageDirForDiagnostics} (диагностика):`);
        dumpTree(path.join(ROOT, packageDirForDiagnostics), 3, '    ');
      }
      console.error('  ⚠ Пропускаю этот патч, чтобы не блокировать всю сборку. ПРОВЕРЬ ЛОГ ВЫШЕ.');
      return;
    }
  }
  let src = fs.readFileSync(full, 'utf8');
  let changed = false;
  for (const { name, find, replace } of transforms) {
    if (src.includes(replace)) {
      // Уже пропатчено — пропускаем.
      continue;
    }
    if (!src.includes(find)) {
      console.error(`  ✖ [${relativePath}] не нашёл: ${name}`);
      process.exit(1);
    }
    src = src.replace(find, replace);
    changed = true;
    console.log(`  ✓ ${relativePath} — ${name}`);
  }
  if (changed) {
    fs.writeFileSync(full, src);
    touched++;
  } else {
    skipped++;
    console.log(`  = ${relativePath} — уже пропатчено`);
  }
}

console.log('▶ patch-node-modules.js — начало');

// ---------- react-native-gesture-handler ----------
patch(
  'node_modules/react-native-gesture-handler/src/handlers/gestures/GestureDetector.tsx',
  [
    {
      name: 'GestureDetector.tsx — импорт baseGestureHandlerWithMonitorProps → alias',
      find:
        "import {\n" +
        "  baseGestureHandlerWithMonitorProps,\n" +
        "  filterConfig,\n" +
        "  findNodeHandle,\n" +
        "  GestureTouchEvent,\n" +
        "  GestureUpdateEvent,\n" +
        "  GestureStateChangeEvent,\n" +
        "  HandlerStateChangeEvent,\n" +
        "  scheduleFlushOperations,\n" +
        "  UserSelect,\n" +
        "  TouchAction,\n" +
        "} from '../gestureHandlerCommon';",
      replace:
        "import {\n" +
        "  baseGestureHandlerWithDetectorProps as baseGestureHandlerWithMonitorProps,\n" +
        "  GestureTouchEvent,\n" +
        "  GestureUpdateEvent,\n" +
        "  GestureStateChangeEvent,\n" +
        "  HandlerStateChangeEvent,\n" +
        "  UserSelect,\n" +
        "  TouchAction,\n" +
        "} from '../gestureHandlerCommon';\n" +
        "import {\n" +
        "  filterConfig,\n" +
        "  findNodeHandle,\n" +
        "  scheduleFlushOperations,\n" +
        "} from '../utils';",
    },
  ],
  { packageDirForDiagnostics: 'node_modules/react-native-gesture-handler' },
);

// ---------- expo-cli (нужно только для локального `expo start`) ----------
patch(
  'node_modules/expo/node_modules/@expo/cli/build/src/start/server/metro/waitForMetroToObserveTypeScriptFile.js',
  [
    {
      name: 'waitForMetroToObserveTypeScriptFile.js — for-of guard #1',
      find:
        "    const listener = ({ eventsQueue })=>{\n" +
        "        for (const event of eventsQueue){\n" +
        "            var _event_metadata;\n" +
        "            if (event.type === 'add'",
      replace:
        "    const listener = ({ eventsQueue })=>{\n" +
        "        for (const event of (eventsQueue || [])){\n" +
        "            var _event_metadata;\n" +
        "            if (event.type === 'add'",
    },
    {
      name: 'waitForMetroToObserveTypeScriptFile.js — for-of guard #2',
      find:
        "    const listener = ({ eventsQueue })=>{\n" +
        "        for (const event of eventsQueue){\n" +
        "            var // event.type === 'add' &&",
      replace:
        "    const listener = ({ eventsQueue })=>{\n" +
        "        for (const event of (eventsQueue || [])){\n" +
        "            var // event.type === 'add' &&",
    },
    {
      name: 'waitForMetroToObserveTypeScriptFile.js — callback guard',
      find:
        "    const listener = ({ eventsQueue })=>{\n" +
        "        callback(eventsQueue);\n" +
        "    };",
      replace:
        "    const listener = ({ eventsQueue })=>{\n" +
        "        callback(eventsQueue || []);\n" +
        "    };",
    },
  ],
  { optional: true }, // на EAS этого файла нет — пропускаем без ошибки
);

console.log(`▶ patch-node-modules.js — готово (изменено: ${touched}, пропущено: ${skipped})`);
