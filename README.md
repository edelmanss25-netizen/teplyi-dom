# КП «Тёплый дом» × ПроГород Сыктывкар

Сайт-сборное коммерческое предложение (Vite + React). Готов к деплою на Vercel.

## Запуск
```bash
npm install
npm run dev      # локально
npm run build    # сборка в /dist
```

## Деплой на Vercel
1. Залейте папку в GitHub-репозиторий.
2. На vercel.com → **Add New → Project** → выберите репозиторий.
3. Framework Preset определится как **Vite** (настройки уже в `vercel.json`). Нажмите **Deploy**.

Или через CLI: `npx vercel --prod`.

## Где что менять
- **Тексты, цены, ссылки** — `src/data/content.js`
- **Цвета** — переменные в начале `src/styles.css` (`--td-*` — «Тёплый дом», `--pg-*` — «ПроГород»)
- **Видео подкаста** — массив `PODCAST.videos` в `content.js` (инструкция в комментарии)
- **Картинки КП «Народный учитель»** — `public/img/`
