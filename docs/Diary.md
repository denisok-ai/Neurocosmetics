# Diary.md — Дневник наблюдений проекта

Подробный дневник технических решений, проблем и наблюдений. Обеспечивает непрерывность работы при смене разработчиков.

**Формат записи**: дата, разделы «Наблюдения», «Решения», «Проблемы».

---

## 2025-03-06 — Режим отладки и сидирование

### Наблюдения
- На сервере и при `next start` режим отладки не включался: 403 «Debug mode disabled» на /api/debug/login и /api/debug/seed. NEXT_PUBLIC_DEBUG_MODE подставляется при сборке, после деплоя добавление переменной в .env не помогало.
- Сидирование падало с 500 при отсутствии SUPABASE_SERVICE_ROLE_KEY.

### Решения
- В lib/debug.ts добавлена проверка process.env.DEBUG_MODE === "true" (серверная переменная, читается в рантайме). В ecosystem.config.cjs заданы NODE_ENV=development и DEBUG_MODE=true для PM2.
- Запуск через `next dev` (ecosystem.config.cjs) вместо `next start`, чтобы режим отладки работал без пересборки.
- GET /api/debug/status для диагностики (debug, NODE_ENV, DEBUG_MODE, NEXT_PUBLIC_DEBUG_MODE).
- В /api/debug/seed используется getAdminClientOrNull(): при отсутствии ключа возвращаются сгенерированные заказы и seeded { orders: 45, leads: 0, audit: 0 }; при наличии ключа — запись в b2b_leads и audit_logs; при ошибке вставки — 200 и warning вместо 500.

### Проблемы
- Нет.

---

## 2025-03-06 — A/B-тесты (5.3)

### Наблюдения
- Задача 5.3: инфраструктура A/B-тестирования для масштабирования и оптимизации конверсии.

### Решения
- Модуль lib/ab/: experiments.ts (конфиг), variant.ts (cookie, hash-назначение), use-experiment.ts (React-хук).
- Cookie ab_visitor — UUID посетителя (30 дней). ab_<experimentId> — вариант A или B.
- Детерминированность: hash(visitor_id + experiment_id) % 2 → A/B. Один посетитель всегда видит один вариант.
- Демо hero_cta: «Купить курс» (A) vs «Начать курс» (B) на кнопке Hero. При isLoading показываем контроль (A).

### Проблемы
- Нет.

---

## 2025-03-06 — Мониторинг, алерты (5.2)

### Наблюдения
- Задача 5.2: мониторинг доступности и алерты при критических ошибках.

### Решения
- Health check GET /api/health: status, timestamp, version (VERCEL_GIT_COMMIT_SHA), опциональная проверка Supabase. Cache-Control: no-store.
- lib/config/monitoring.ts: SENTRY_DSN (задел), MONITORING_ALERT_ON_CRITICAL (по умолчанию true), MONITORING_ALERT_CHAT_ID.
- reportCriticalError(): логирует ошибку и отправляет в Telegram (если alertOnCritical и TELEGRAM_* заданы). HTML-форматирование, escape.
- Интеграция в payments/webhook (catch) и order-status (Supabase error/exception).
- sendTelegramMessage расширен опцией chatId для отдельного канала алертов.

### Проблемы
- Нет.

---

## 2025-03-06 — Оптимизация Core Web Vitals (5.1)

### Наблюдения
- Задача 5.1: оптимизация производительности, Core Web Vitals (LCP, FID, CLS), кэширование.

### Решения
- Viewport metadata в layout — предотвращает layout shift при мобильном масштабировании.
- font-display: swap для шрифтов — текст виден до загрузки шрифтов (FOUT вместо FOIT).
- ChatWidget вынесен в dynamic() с ssr: false — AI SDK и Framer Motion загружаются после гидрации, уменьшая initial JS bundle.
- API /api/products: Cache-Control s-maxage=60, stale-while-revalidate=300 — кэш на CDN/edge.
- next.config images: AVIF и WebP — современные форматы для Next/Image.

### Проблемы
- Нет.

---

## 2025-03-06 — Типографическая шкала (D.5)

### Наблюдения
- design-audit.md отмечал отсутствие единой шкалы размеров (произвольные text-sm/text-lg) и несистематизированный tracking для заголовков.

### Решения
- Добавлена секция 4.3.1 в Project.md с таблицей типографической шкалы (Display, H1–H3, Lead, Body, Caption, Badge, Stat).
- В globals.css введены классы typography-* для консистентного применения.
- Лендинг, /science, /shop, /shop/[id], /debug переведены на новые классы. Удалены landing-heading и landing-subheading.

### Проблемы
- Нет.

---

## 2025-03-06 — Уведомления: Mail, Telegram (4.6)

### Наблюдения
- Задача 4.6: каналы уведомлений для менеджера/админа — Telegram при событиях (например оплата), Email для писем клиенту (подтверждение заказа).

### Решения
- Конфиг уведомлений в lib/config/notifications.ts: Telegram (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID), Mail (NOTIFICATION_EMAIL_FROM, RESEND_API_KEY). При отсутствии переменных отправка не выполняется (в dev логируется пропуск).
- lib/api/notifications.ts: sendTelegramMessage(text) — POST в api.telegram.org/bot&lt;token&gt;/sendMessage; sendEmail(params) — при наличии RESEND_API_KEY запрос к api.resend.com/emails, иначе mock.
- В webhook оплаты при статусе paid вызывается sendTelegramMessage (уведомление «Оплачен заказ …»). Для писем клиенту (подтверждение заказа) достаточно вызывать sendEmail при создании/оплате заказа в нужных местах.

### Проблемы
- Нет.

---

## 2025-03-06 — Интеграции: банк, платёжный шлюз, статусы (4.5)

### Наблюдения
- Задача 4.5: конфигурируемый платёжный шлюз (YooKassa), связка webhook → статусы заказа. Раньше webhook только логировал; заказы хранились в Zustand (мок), в Supabase есть таблица orders с RLS.

### Решения
- Введён конфиг платежей lib/config/payments.ts (env: YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, YOOKASSA_WEBHOOK_SECRET) для будущего перехода на реальный API и проверки webhook.
- Добавлен admin-клиент Supabase (lib/supabase/admin.ts) с getAdminClientOrNull() для безопасного вызова без ключа; webhook обновляет статус заказа в таблице orders при событии payment.succeeded/canceled.
- Маппинг событий и обновление статуса вынесены в lib/api/order-status.ts. При отсутствии SUPABASE_SERVICE_ROLE_KEY обновление не выполняется, webhook по-прежнему отвечает 200.
- Для работы webhook с реальными заказами нужно создавать заказы в Supabase при оформлении (сейчас создаются только в Zustand).

### Проблемы
- Нет.

---

## 2025-03-06 — Интеграции: маркетплейсы (4.4)

### Наблюдения
- Задача 4.4 предполагала конфигурируемые ссылки «Где купить» (Ozon, WB, Lamoda, Золотое Яблоко). Раньше ссылки были захардкожены в футере и на лендинге как "#" с подсказкой «Скоро».

### Решения
- Добавлен модуль lib/data/marketplaces.ts: тип Marketplace (id, name, href, isPlaceholder), getMarketplaces() читает URL из env (NEXT_PUBLIC_MARKETPLACE_OZON_URL, _WB_URL, _LAMODA_URL, _GOLDAPPLE_URL). При отсутствии переменной — href="#", isPlaceholder=true.
- Footer и секция «Где купить» на главной странице переведены на getMarketplaces(); для внешних ссылок добавлены target="_blank" и rel="noopener noreferrer".
- В .env.local.example добавлены закомментированные переменные для маркетплейсов. Дальнейшая интеграция (API выгрузки товаров на маркетплейсы) может опираться на этот конфиг.

### Проблемы
- Нет.

---

## 2025-03-06 — Аудит дизайна MedTech и UX/a11y

### Наблюдения
- Палитра (Navy, Gold, Medical White) и стек (glass, hero-product-card) уже соответствуют референсам MedTech.
- Не хватало единого видимого фокуса для клавиатурной навигации (WCAG), skip link и семантики для скринридеров (aria-label, aria-expanded).
- Контраст навигации (text-navy/70) на границе читаемости; футер содержал нефункциональные ссылки (маркетплейсы #, email как текст).

### Решения
- Создан docs/design-audit.md с чек-листом и рекомендациями; план внедрения D.1–D.5.
- В globals.css добавлены глобальные focus-visible (ring-gold), переменные --section-py/--section-py-lg, класс .skip-link.
- В public layout добавлен skip link и id="main" на main.
- Navbar и Footer доработаны: aria-атрибуты, mailto для email, title для заглушек маркетплейсов, контраст navy/80, focus-visible на интерактивных элементах.
- В Tasktracker введён этап 2.6 «Дизайн и UX (MedTech)»; задачи D.1–D.4 отмечены выполненными, D.5 (типографическая шкала) — в backlog.

### Проблемы
- Отдельного скилла «Дизайнер» в .cursor/skills-cursor не найдено — рекомендации сформированы на основе MedTech/UX практик и WCAG 2.1 AA.

---

## 2025-03-06 — Продуктовая линейка HAEE (системная нейрокосметология)

### Наблюдения
- В проект внесена концепция из внешних источников: 4 набора (Starter, Intensive, Refill, Professional), РРЦ 12 900 / 19 900 / 8 500 / по запросу, состав и курсы для каждого. B2B-Box без онлайн-корзины — кнопка «Запросить для клиники» ведёт на /b2b.
- Важно для маркетинга: акцент на том, что покупка HAEE — инвестиция не только в уход за кожей, но и в «эндогенный щит для мозга».

### Решения
- Введён каталог `lib/data/products.ts` с массивом HAEE_PRODUCTS; тип Product расширен полями course, composition, price_on_request.
- Страница /shop переведена на сетку из 4 карточек; для Professional отображается «По запросу» и ссылка на /b2b.
- На лендинге в Hero добавлена строка про «эндогенный щит для мозга»; в дефолтный промпт Sales Consultant (ai-prompts.ts) добавлен маркетинговый месседж.
- SEO: в корневой layout выведен Schema.org ItemList (PRODUCTS_LD) с тремя розничными продуктами.
- В Project.md добавлен раздел 2.6 «Продуктовая линейка HAEE»; в Tasktracker — этап 2.7 с задачами P.1–P.3.

### Проблемы
- Нет.

---

## 2025-03-05

### Наблюдения
- Проект на стадии инициализации. Имеются: описание архитектуры (project-architecture.md), промпты AI (ai-system-prompts.md), правила кода (.cursorrules.txt).
- Стек: Next.js 14, TypeScript, Supabase, Vercel AI SDK, LangChain.js.
- Целевой рынок: D2C (Россия/СНГ), B2B (клиники, салоны).
- Регуляторика: TR CU 009/2011, патент RU 2826728. Продукт позиционируется как косметика, не лекарство.

### Решения
- Создана структура документации: Project.md, Tasktracker.md, Diary.md, qa.md.
- Tasktracker структурирован по этапам разработки с приоритетами (Критический/Высокий/Средний/Низкий).
- Версионирование: Semantic Versioning, файл VERSION, VERSION_HISTORY.md.
- Cursor rule development-workflow.mdc: документирование перед изменениями, заголовки файлов, обновление project.md.

### Проблемы
- Не выбран платёжный провайдер: YooKassa vs Stripe (зависит от географии и требований).
- Не определена векторная БД для RAG.
- Не уточнены детали интеграции с маркетплейсами (Ozon, WB, Lamoda).
- Вопросы по хостингу и резидентности данных в qa.md.

### Дополнительно (расширение документации)
- Создан полный Project.md с целями, архитектурой (Mermaid), этапами, технологиями, безопасностью.
- Tasktracker.md структурирован по 5 этапам с приоритетами.
- Добавлен qa.md с 14 вопросами для уточнения архитектуры.
- Создан .cursorrules в корне (Cursor читает его автоматически).
- Cursor rule обновлён: «перед операцией обращаться к .cursorrules».

---

## 2025-03-05 (сессия 2) — Базовый каркас приложения

### Наблюдения
- В `neurocosmetics/` уже был scaffold от `create-next-app` с Next.js 16.1.6 (не 14 как в `.cursorrules`), React 19, Tailwind CSS v4.
- Tailwind v4 не использует `tailwind.config.ts` — конфигурация через CSS `@theme inline` блок.
- Shadcn UI v3.8.5 поддерживает Tailwind v4, стиль `new-york`.
- Сборка проекта (`next build`) прошла успешно: 6 статических маршрутов.

### Решения
- Оставили Next.js 16 + Tailwind v4 (современнее, обсуждено с владельцем проекта).
- Design System: dark-first, палитра navy/gold/ice/glass через CSS-переменные.
- Route groups: `(public)` для сайта, `(dashboard)` для портала — отдельные layout.
- Glassmorphism: утилитарные классы `.glass` и `.glass-gold` в globals.css.
- Framer Motion `ease` fix: `as const` для совместимости с strict TypeScript.
- SQL-схема включает RLS-политики и trigger для auto-create profile.

### Проблемы
- Страница `/dashboard` отображает layout с sidebar, но auth guard — заглушка (нужна интеграция Supabase Auth).
- Chat Widget — UI-заглушка без LLM-интеграции.
- LLM Settings — форма без сохранения в БД (нужен API route + Supabase).
- Версия Next.js в `.cursorrules` расходится с реальной (16 vs 14) — нужно обновить документ.

---

## 2025-03-05 (сессия 3) — Завершение Этапа 1 MVP

### Наблюдения
- `@supabase/ssr` — рекомендуемый пакет для SSR с Supabase. Требует два клиента: browser (для Client Components) и server (для Server Components, Actions, Routes).
- Next.js 16 помечает `middleware.ts` как deprecated в пользу `proxy`. Middleware пока работает, но стоит мигрировать в будущем.
- При сборке без реальных Supabase env-переменных Server Actions импортируют `createClient`, что вызывает ошибку prerender. Решено через `force-dynamic` на auth-страницах.
- Husky не может инициализироваться без `.git` — создана структура `.husky/` вручную.

### Решения
- Supabase: два клиента (browser/server) + middleware для обновления сессий.
- Auth: Server Actions (`login`, `signup`, `signOut`) — нет API routes, всё через формы.
- RBAC: иерархия ролей (guest < user < b2b < manager < admin), `RoleGuard` Server Component для защиты страниц.
- Dashboard layout стал Server Component с реальной проверкой `auth.getUser()`.
- LLM Settings form вынесена в client-компонент `components/admin/llm-settings-form.tsx`, page.tsx — server с `RoleGuard(admin)`.
- Корзина: `/shop/cart` с полным управлением (±, удаление, очистка, итого). Магазин подключён к Zustand.
- SEO: `sitemap.ts`, `robots.ts` (Next.js API), `JsonLd` компонент для Schema.org.
- Navbar: реактивный auth-статус через `onAuthStateChange`.

### Проблемы
- Middleware deprecated в Next.js 16 — нужна миграция на `proxy` в будущем.
- `.env.local` содержит заглушки — при деплое нужно подставить реальные Supabase credentials.
- Husky не активирован без `git init` — сработает после инициализации git-репозитория.
- RoleGuard делает запрос в `profiles` таблицу — если Supabase не подключён, role = "user" (fallback).

---

## 2025-03-05 (сессия 6) — MedTech редизайн лендинга

### Наблюдения
- Текущий дизайн (тёмный фон для всех страниц) не соответствует MedTech стандарту. MedTech требует: белый/светлый фон (стерильность), тёмный текст, gold-акценты на премиальность.
- Визуальная метафора «пробирок» — ключевая для бренда: показывает дефицит HAEE через уровень жидкости.
- Протокол микронидлинга — критически важен для безопасности: пользователь должен видеть правильные траектории.
- FAQ секция — фундамент для RAG-бота: ответы из научных источников.

### Решения
- **Двойная тема**: `:root` — светлая (Medical White), `.dark` — тёмная (Dashboard). Dashboard layout обёрнут в `<div className="dark">`.
- **3 новых компонента**: `TestTubeChart` (пробирки с `whileInView`), `MicroneedlingAnimation` (useAnimation, 3 направления), `AnimatedCounter` (useInView + rAF + easing).
- **Лендинг из 8 секций**: Hero → Science (пробирки + scan) → Тройное действие → Протокол (шаги + анимация) → Безопасность → FAQ → Где купить → Footer disclaimer.
- **Navbar**: прозрачный → glassmorphism при скролле. Цвета navy/gold вместо ice/white.
- **Footer**: добавлен обязательный disclaimer + блок маркетплейсов.

### Проблемы
- Auth-страницы (login, register) всё ещё со старой тёмной стилизацией — нужна адаптация под светлую тему.
- Страница `/science` — старый контент на тёмном фоне, нужно обновить.
- Страница `/shop` — нужна адаптация цветов.
- Изображения ампул и мезороллера — плейсхолдеры (CSS shapes). Нужны реальные 3D рендеры.

---

## 2025-03-05 (сессия 5) — AI Chat, Дашборд менеджера, ЮKassa

### Наблюдения
- Vercel AI SDK обновился до v6 (ai@6.0.116, @ai-sdk/openai@3.0.41, @ai-sdk/react@3.0.118). API значительно изменился:
  - `toDataStreamResponse()` → `toUIMessageStreamResponse()`
  - `useChat` больше не принимает `api`, `input`, `handleInputChange`, `handleSubmit` — вместо этого `DefaultChatTransport`, `sendMessage({ text })`, `status`
  - Сообщения теперь `UIMessage` с `parts: UIMessagePart[]` вместо `content: string`
- `@ai-sdk/react` — отдельный пакет, не входит в `ai`
- При передаче начальных сообщений в `useChat` TypeScript инферит тип слишком узко (только `"assistant"`) — нужен explicit generic `useChat<UIMessage>`

### Решения
- Chat Widget: полная интеграция Vercel AI SDK v6. `sendMessage({ text })` + ручной state для input. Системный промт B2C Sales Consultant из `ai-system-prompts.md`.
- API route `/api/chat`: `convertToModelMessages()` конвертирует UIMessage[] → ModelMessage[] для `streamText()`.
- ЮKassa mock: `createPayment()` возвращает `confirmation_url` → redirect на `/shop/checkout/confirm`. Страница confirm анимирует 3 этапа (processing → 3D Secure → capture).
- Webhook `/api/payments/webhook`: mock endpoint. В реальности — проверка IP YooKassa, HMAC подпись, обновление заказа в Supabase.
- Дашборд менеджера: таблица с сортировкой, фильтрацией по статусу, поиском. Stats-карточки (выручка, в доставке, ожидают).

### Проблемы
- Chat Widget работает только при наличии реального `OPENAI_API_KEY` в `.env.local`. Без ключа — ошибка 401.
- ЮKassa mock — client-side only. Для реальной интеграции нужен серверный API route с SDK `@yookassa/sdk`.
- Дашборд менеджера не защищён RoleGuard — нужно добавить при подключении реальной авторизации.
- Orders store — client-side Zustand, данные теряются при перезагрузке.

---

## 2025-03-05 (сессия 4) — Этап 2: Коммерция

### Наблюдения
- Zod 4 (4.3.6) установлен в проекте. Импорт `zod/v4` не нужен — это путь для Zod 3 с бэкпортом v4 API.
- `z.email()` из Zod 4 вызывает circular reference при SSR prerender в Next.js 16 (Turbopack). Workaround — `z.string().email()`.
- Zustand stores (cart + orders) хорошо компонуются: checkout использует оба одновременно.
- `force-dynamic` нельзя экспортировать из `"use client"` файла — directive должен быть первой строкой. Решение: серверный `layout.tsx` рядом со страницей.

### Решения
- Создана абстракция платежей: `PaymentIntent` интерфейс, `createPayment()` mock. При подключении YooKassa/Stripe заменяется только этот файл.
- Zustand store заказов: `createOrder` формирует Order из CartItem[], `updateStatus` меняет статус. Mock-данные для demo.
- Zod-схемы: `checkoutSchema` (fullName, email, phone, address, comment), `profileSchema` (full_name, phone). Валидация на клиенте.
- Timeline UI на странице заказа: 4 шага (создан → оплачен → доставка → доставлен), состояние computed от OrderStatus.
- Профиль: загрузка из `supabase.auth.getUser()`, сохранение через `updateUser({ data: ... })`, Zod-валидация.
- Sidebar обновлён: «Мои заказы», «Профиль» добавлены, заглушка «Настройки» убрана.

### Проблемы
- Платёжная интеграция — mock. Для продакшена нужен YooKassa SDK (вопрос из qa.md остаётся открытым).
- Orders store — клиентский (Zustand). При перезагрузке данные теряются. Нужна Supabase-интеграция для persist.
- Профиль сохраняет в `user_metadata` — для полноценной работы нужна таблица `profiles` в Supabase.

---

<!-- Шаблон новой записи:

## YYYY-MM-DD

### Наблюдения
- [Что наблюдается]

### Решения
- [Что решено]

### Проблемы
- [Что остаётся нерешённым]

-->
