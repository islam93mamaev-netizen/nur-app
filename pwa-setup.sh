#!/bin/bash
# Запускать после: npx expo export --platform web

echo "🔧 Настройка PWA..."

# Копируем service worker в dist
cp sw.js dist/sw.js

# Вставляем регистрацию SW перед </body> в index.html
SW_SCRIPT='<script>if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").then(function(r){console.log("SW registered")}).catch(function(e){console.log("SW error",e)})})}</script>'

sed -i "s|</body>|${SW_SCRIPT}</body>|" dist/index.html

echo "✅ PWA готово! Файлы в dist/"
