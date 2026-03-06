# Changelog — HAEE Neurocosmetics Portal

Журнал всех значимых изменений в проекте. Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/).

---

## [2025-03-06] — A/B-тесты (5.3)

### Добавлено
- **lib/ab/experiments.ts**: конфигурация экспериментов (EXPERIMENT_HERO_CTA и др.).
- **lib/ab/variant.ts**: getOrCreateVisitorId, assignVariant, getVariant — cookie-based, детерминированный hash.
- **lib/ab/use-experiment.ts**: хук useExperiment(experimentId) — возвращает variant и payload.
- **lib/ab/index.ts**: публичный API модуля.
- Демо-эксперимент hero_cta на лендинге: CTA «Купить курс» (A) vs «Начать курс» (B).

### Изменено
- Hero-кнопка на главной использует useExperiment для A/B-теста текста CTA.

### Исправлено
- —

---

## [2025-03-06] — Мониторинг, алерты (5.2)

### Добавлено
- **GET /api/health**: health check для uptime-мониторинга (status, timestamp, version, опционально supabase).
- **lib/config/monitoring.ts**: конфиг SENTRY_DSN, MONITORING_ALERT_ON_CRITICAL, MONITORING_ALERT_CHAT_ID.
- **lib/api/monitoring.ts**: reportCriticalError() — отправка алертов в Telegram при критических ошибках.
- Интеграция reportCriticalError в webhook платежей и updateOrderStatusInSupabase.
- sendTelegramMessage: опция chatId для алертов в отдельный канал.

### Изменено
- .env.local.example: добавлены переменные мониторинга.

### Исправлено
- —

---

## [2025-03-06] — Оптимизация: Core Web Vitals, кэширование (5.1)

### Добавлено
- **Viewport metadata** в root layout: width=device-width, initialScale=1, maximumScale=5 — снижает CLS.
- **Font display: swap** для Inter и Playfair Display — уменьшает FOUT, текст виден до загрузки шрифтов.
- **ChatWidgetLazy**: динамический импорт ChatWidget (AI SDK, Framer Motion) — уменьшает initial bundle.
- **Cache-Control** для GET /api/products: s-maxage=60, stale-while-revalidate=300.
- **next.config images**: форматы AVIF и WebP для оптимизации изображений.

### Изменено
- Public layout использует ChatWidgetLazy вместо ChatWidget.

### Исправлено
- —

---

## [2025-03-06] — Типографическая шкала (D.5)

### Добавлено
- **Project.md 4.3.1**: Типографическая шкала MedTech — таблица уровней (Display, H1–H3, Lead, Body, Caption, Badge, Stat) с Tailwind-классами и назначением.
- **globals.css**: Классы `.typography-display`, `.typography-h1`, `.typography-h2`, `.typography-h3`, `.typography-lead`, `.typography-body`, `.typography-body-sm`, `.typography-caption`, `.typography-badge`, `.typography-stat`.

### Изменено
- Лендинг, /science, /shop, /shop/[id], /debug: замена произвольных text-* на классы типографической шкалы.
- Удалены устаревшие `.landing-heading` и `.landing-subheading` (заменены на typography-h2 и typography-lead).

### Исправлено
- —

---

## [2025-03-06] — Уведомления: Mail, Telegram (4.6)

### Добавлено
- **lib/config/notifications.ts**: getTelegramConfig() (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID), getMailConfig() (NOTIFICATION_EMAIL_FROM, RESEND_API_KEY); isTelegramConfigured(), isMailConfigured().
- **lib/api/notifications.ts**: sendTelegramMessage(text) — отправка в Telegram через Bot API sendMessage (HTML); sendEmail({ to, subject, text, html? }) — через Resend при наличии RESEND_API_KEY, иначе mock (логирование в dev).
- При успешной оплате (webhook payment.succeeded) вызывается sendTelegramMessage с текстом о заказе (если заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID).
- В .env.local.example добавлены переменные для Telegram и Email (Resend).

### Изменено
- —

### Исправлено
- —

---

## [2025-03-06] — Интеграции: банк, платёжный шлюз, статусы (4.5)

### Добавлено
- **lib/config/payments.ts**: конфиг YooKassa — isYooKassaConfigured(), getYooKassaConfig(), getYooKassaWebhookSecret(); используется для переключения mock/real и проверки webhook.
- **lib/supabase/admin.ts**: getAdminClientOrNull() и createAdminClient() — Supabase с service_role для обхода RLS (webhook, обновление статуса заказа).
- **lib/api/order-status.ts**: paymentEventToOrderStatus(event) — маппинг payment.succeeded → paid, payment.canceled → cancelled; updateOrderStatusInSupabase(orderId, status) — обновление заказа в таблице orders.
- Webhook POST /api/payments/webhook: проверка X-Webhook-Secret (если задан YOOKASSA_WEBHOOK_SECRET), маппинг события на статус, вызов updateOrderStatusInSupabase; при отсутствии SUPABASE_SERVICE_ROLE_KEY обновление не выполняется (webhook возвращает 200).
- В .env.local.example добавлены YOOKASSA_WEBHOOK_SECRET и комментарий про SUPABASE_SERVICE_ROLE_KEY для webhook.

### Изменено
- lib/api/payments.ts: в комментарии указана ссылка на lib/config/payments.ts.

### Исправлено
- —

---

## [2025-03-06] — Интеграции: маркетплейсы (4.4)

### Добавлено
- **lib/data/marketplaces.ts**: тип Marketplace (id, name, href, isPlaceholder), функция getMarketplaces() — читает URL из env (NEXT_PUBLIC_MARKETPLACE_OZON_URL, _WB_URL, _LAMODA_URL, _GOLDAPPLE_URL); при отсутствии — заглушка «#» и isPlaceholder.
- Футер и секция «Где купить» на лендинге используют getMarketplaces(); внешние ссылки открываются в _blank с rel noopener noreferrer.
- В .env.local.example добавлены переменные для ссылок на маркетплейсы.

### Изменено
- Удалён захардкоженный массив маркетплейсов из footer и page.tsx.

### Исправлено
- —

---

## [2025-03-06] — RAG: pgvector и индексация

### Добавлено
- **pgvector в Supabase**: В `lib/supabase/schema.sql` — расширение `vector`, таблица `rag_chunks` (id, content, source, embedding vector(1536), metadata, created_at), RLS (SELECT для всех, INSERT/DELETE для admin), функция `match_rag_chunks(query_embedding, match_count, match_threshold)` для косинусного поиска.
- **lib/rag/vector-store.ts**: `searchRagChunks(supabase, queryEmbedding, limit, threshold)` — вызов RPC и возврат массива content; экспорт `toVectorString` для seed.
- **Чат /api/chat**: Сначала выполняется поиск в pgvector (если есть запрос и эмбеддинг); при пустом результате используется in-memory/keyword контекст.
- **POST /api/rag/seed**: Только для admin. Удаляет чанки с source='static', получает эмбеддинги для всех статичных чанков (getChunksForSeed), вставляет их в `rag_chunks`. Требует OPENAI_API_KEY и развёрнутой миграции с vector.

### Изменено
- В `lib/rag/context.ts` экспортирована функция `getChunksForSeed()` для использования в seed API.

### Исправлено
- Тип параметра supabase в `searchRagChunks`: используется `PromiseLike` для совместимости с Supabase PostgrestFilterBuilder.

---

## [2025-03-06] — RAG: эмбеддинги OpenAI и семантический поиск

### Добавлено
- **lib/rag/embed.ts**: функции `getEmbedding(text)` (OpenAI text-embedding-3-small) и `cosineSimilarity(a, b)`. При отсутствии OPENAI_API_KEY возвращается null.
- **Семантический поиск в RAG**: при наличии OPENAI_API_KEY контекст подбирается по косинусному сходству запроса и чанков; эмбеддинги чанков кэшируются в памяти после первого запроса. Порог релевантности 0.2; при недоступности API — fallback на keyword-поиск.
- Зависимость **openai** (официальный SDK) для вызова embeddings API.

### Изменено
- В `/api/chat` исправлено извлечение текста последнего сообщения пользователя: используется `message.parts` (текст из части типа text), т.к. UIMessage не имеет поля content.

### Исправлено
- Сборка: устранена ошибка типов при обращении к lastUserContent.content.

---

## [2025-03-06] — RAG: расширение базы знаний и API

### Добавлено
- **Контент RAG**: В `lib/rag/context.ts` добавлены фрагменты по продуктам (Starter, Intensive, Refill, Professional с ценами), протоколу мезороллера (горизонталь/вертикаль/диагональ), амилоиду/55%/нейропротекции, блоку «купить/магазин». Всего 13 чанков для keyword-поиска.
- **lib/rag/index.ts**: Публичный экспорт `getRelevantContext` и типов для использования в API и будущих сервисах.
- В чат Sales передаётся до 4 релевантных фрагментов контекста.

### Изменено
- Увеличен лимит фрагментов контекста в `/api/chat` с 3 до 4.

### Исправлено
- —

---

## [2025-03-06] — Карточки товаров и задел RAG

### Добавлено
- **Карточки товаров (/shop)**: Крупнее фото — сетка 2 колонки на десктопе (вместо 4), блок изображения aspect-[4/5] и min-h-[280px], меньше отступы (p-3), увеличены sizes для Image (до 400px). Карточка: белый фон, тень и hover:shadow-xl без glass.
- **RAG (3.1, в процессе)**: Модуль `lib/rag/` — типы (RAGDocument, RAGSearchResult), `getRelevantContext(query)` с keyword-поиском по статичным фрагментам FAQ/науки. В `POST /api/chat` добавлена подстановка релевантного контекста в системный промпт. Дальше: эмбеддинги и векторная БД (pgvector/Pinecone).

### Изменено
- Магазин: сетка `lg:grid-cols-2` и `lg:max-w-5xl` для более крупных карточек.

### Исправлено
- —

---

## [2025-03-06] — Галереи изображений для линейки продуктов (5 ракурсов)

### Добавлено
- **20 изображений** в стиле текущих референсов (MedTech, белый фон, золотые акценты): по 5 ракурсов на каждый из 4 продуктов — фронт, слева, справа, сверху, деталь. Файлы: `haee-starter-1-front.png` … `haee-starter-5-detail.png`, аналогично для intensive, refill, professional в `public/images/`.
- В тип **Product** добавлено опциональное поле **images** (массив URL галереи).
- В каталоге **lib/data/products.ts** у каждого продукта заданы **image_url** (первый ракурс) и **images** (все 5).
- На странице **/shop** в карточке товара: галерея с переключением по точкам (индикаторы под фото), подписи ракурсов для a11y.

### Изменено
- Карточка товара в магазине показывает выбранный ракурс и точки для переключения между 5 фото.

### Исправлено
- —

---

## [2025-03-06] — Продуктовая линейка HAEE и ценообразование

### Добавлено
- **Продуктовая линейка (системная нейрокосметология)**: Каталог `lib/data/products.ts` — 4 набора: **HAEE Starter** (12 900 ₽), **HAEE Intensive** (19 900 ₽), **HAEE Refill** (8 500 ₽), **HAEE Professional** (по запросу, B2B). У каждого продукта: описание, состав, курс, флаг `price_on_request` для B2B.
- **Тип Product**: опциональные поля `course`, `composition`, `price_on_request` (lib/types).
- **Магазин /shop**: сетка из 4 карточек с изображением, описанием, составом, курсом и ценой; для Professional — кнопка «Запросить для клиники» (ссылка на /b2b) вместо «В корзину». Отображение количества в кнопке «В корзине (N)».
- **Лендинг**: в Hero добавлена строка «Покупка набора HAEE — это инвестиция не только в уход за кожей рук и плеч, но и в эндогенный щит для мозга».
- **SEO**: Schema.org ItemList с тремя розничными продуктами (PRODUCTS_LD) в корневом layout; удалён одиночный PRODUCT_LD.
- **Project.md**: раздел 2.6 «Продуктовая линейка HAEE» — таблица комплектов, РРЦ, ценообразование Premium MedTech, маркетинговый месседж. Раздел 2.5 переименован в 2.7.
- **Tasktracker.md**: этап 2.7 «Продуктовая линейка HAEE» с задачами P.1–P.3 (все завершены).

### Изменено
- Страница магазина переведена с одного товара на каталог из `HAEE_PRODUCTS`.

### Исправлено
- —

---

## [2025-03-06] — Аудит дизайна MedTech и UX/a11y

### Добавлено
- **docs/design-audit.md**: Аудит дизайна — палитра, типографика, компоненты, UX, a11y; рекомендации MedTech; план внедрения D.1–D.5.
- **Skip link**: Ссылка «Перейти к контенту» в public layout (скрыта до фокуса), `main` с `id="main"` и `tabIndex={-1}` для фокуса после перехода.
- **globals.css**: Утилиты focus-visible для `a` и `button` (ring-2 ring-gold ring-offset-2); шкала отступов секций `--section-py`, `--section-py-lg`; класс `.skip-link`.

### Изменено
- **Navbar**: aria-label на иконках (Корзина, Личный кабинет, Выйти), aria-expanded и aria-label на кнопке бургер-меню; контраст ссылок с text-navy/70 на text-navy/80; focus-visible на всех интерактивных элементах.
- **Footer**: email как ссылка mailto:info@haee-neuro.ru; у маркетплейсов title="Скоро" при href="#"; focus-visible на ссылках.
- **Project.md**: В Design System добавлены пункты по a11y и шкале отступов, ссылка на design-audit.md.
- **Tasktracker.md**: Новый этап 2.6 «Дизайн и UX (MedTech)» с задачами D.1–D.5; D.1–D.4 отмечены как завершённые.

### Исправлено
- —

---

## [2025-03-06] — Этап 4.2 (CRM) и 4.7 (Audit Log)

### Добавлено
- **Audit Log (4.7)**: Модуль `lib/api/audit.ts` — in-memory журнал (logAudit, getAuditLogs). Запись при создании B2B-заявки (action: b2b_lead_created). `GET /api/audit` — список записей (только admin). Страница `/dashboard/admin/audit` — просмотр журнала. В сайдбар добавлен пункт «Журнал аудита».
- **CRM (4.2)**: Страница `/dashboard/admin/crm` (RoleGuard admin/manager) — блок «Клиенты (по заказам)»: агрегация заказов по user_id (количество заказов, сумма, дата последнего). Блок «B2B-лиды» с количеством и ссылкой на B2B заявки. Ссылка на управление заказами. В сайдбар добавлен пункт «CRM».

### Изменено
- POST /api/b2b/leads: после создания заявки вызывается logAudit.

### Исправлено
- —

---

## [2025-03-06] — Этап 3.4 (B2B) и Этап 4.1 (Аналитика)

### Добавлено
- **B2B Consultant (3.4)**: Страница `/b2b` для клиник и салонов — блоки «Выгодные условия», «Сертификация», «Патент»; чат с агентом `/api/chat/b2b` (промпт из ai_prompts); форма «Оставить заявку» (компания, контакт, email, телефон, сообщение) → `POST /api/b2b/leads`. Хранилище лидов `lib/api/b2b-leads.ts` (in-memory), `GET /api/b2b/leads` — для admin/manager. Страница менеджера `/dashboard/manager/leads` — список B2B-лидов. В навбар и футер добавлена ссылка «B2B».
- **Аналитика (4.1)**: Страница `/dashboard/admin/analytics` (RoleGuard admin/manager) — карточки «Выручка», «Всего заказов», «Средний чек», «Оплачено заказов»; блок «Заказы по статусам». Данные из `useOrdersStore`. В сайдбар добавлены пункты «B2B заявки» и «Аналитика».

### Изменено
- Dashboard sidebar: добавлены ссылки на B2B заявки и Аналитику.

### Исправлено
- —

---

## [2025-03-06] — Этап 3: настройка промптов (3.5) и Care Companion (3.3)

### Добавлено
- **API промптов (3.5)**: `GET /api/ai/prompts` — список промптов для админки; `GET /api/ai/prompts?agent=sales` — текущий промпт для чата; `PATCH /api/ai/prompts` — сохранение (только admin). Модуль `lib/api/ai-prompts.ts`: getActivePromptForAgent(), listPrompts(), дефолт для sales.
- **Чат использует промпт из БД**: `/api/chat` загружает system prompt, model и temperature из ai_prompts (agent_type=sales); при ошибке/отсутствии БД — встроенный дефолт.
- **Админка AI Настройки**: форма загружает список промптов и текущий sales-промпт из API; сохранение через PATCH; отображается выбранный агент и редактируемый текст промпта.
- **Care Companion Agent (3.3)**: `POST /api/chat/care` — чат с промптом agent_type=care из ai_prompts; компонент `CareChatBlock` на странице личного кабинета (`/dashboard`) — сворачиваемый чат «Помощник по уходу».

### Изменено
- **LLMSettingsForm**: загрузка данных с `/api/ai/prompts`, выбор агента из списка с сервера, сохранение через PATCH, индикатор загрузки и сообщение об ошибке.

### Исправлено
- —

---

## [2025-03-06] — План разработки: R.8–R.10 (светлая тема для auth, science, shop)

### Добавлено
- **Страница /science**: MedTech-оформление — Hero, блок «Дефицит HAEE» с TestTubeChart и AnimatedCounter (55%, 28.2 млн, 430 пг/мл), линия scan, три карточки (Механизм, Патент, Клинические данные). Клиентский контент вынесен в `science-content.tsx` для сохранения metadata в Server Component.

### Изменено
- **Login / Register**: светлая тема — фон секции `bg-[#FAFAFA]`, карточки `bg-white` с `border-border` и `shadow-lg`, заголовки `text-navy`, сообщения об ошибках `text-red-700`/`bg-red-50`.
- **Магазин (/shop)**: фон `bg-[#FAFAFA]`, заголовок и название товара `text-navy`, кнопка корзины с outline под светлую тему.
- **Корзина (/shop/cart)**: фон `bg-[#FAFAFA]`, карточки товаров `bg-white` с `border-border`, текст `text-navy`, кнопки +/- и «Очистить» с hover `hover:bg-navy/5`, разделитель `bg-border`, удаление `hover:bg-red-50 hover:text-red-600`.

### Исправлено
- —

---

## [2025-03-06] — Чистые фоны, палитра по референсам, картинки продукта

### Добавлено
- **Чистые фоны**: убраны «грязные» градиенты и размытия; секции используют только `#FAFAFA` и `bg-white` по референсам (Medical White, стерильный вид)
- **Hero-карточка продукта**: белый квадрат на navy-фоне с золотой обводкой (референс слайда), классы `.hero-product-card` и `.hero-product-card-bg` в globals.css
- **Изображения продукта**: сгенерированы и подключены `haee-hero-product.png` (ампула с золотой крышкой на стеклянной подставке) и `haee-product-box-mesoroller.png` (упаковка + мезороллер в стиле «трансдермальная доставка»), размещены в `public/images/`
- **Блок «Действие продукта»**: добавлен визуал с изображением упаковки и мезороллера в карточке с золотой обводкой

### Изменено
- **globals.css**: фон светлой темы `--background: #FAFAFA`, добавлены `--color-canvas`, `--color-canvas-subtle`; `.glass` / `.glass-gold` переведены на более чистый ice-glass (минимальная тень, тонкая граница)
- **Hero**: текст приведён к референсу («Научная сенсация и коммерческий прорыв», «Инвестиционное предложение…»), подзаголовок с золотым подчёркиванием
- **Секции лендинга**: все градиенты (`from-blue-50/30`, размытые круги) удалены; чередование `bg-white` и `bg-[#FAFAFA]`
- **TestTubeChart**: пробирки используют класс `.glass-tube` для единого чистого стиля
- **Root layout**: с `html` снят класс `dark` — светлая тема по умолчанию; тёмная тема только в Dashboard через обёртку `.dark`

### Исправлено
- Устранён «грязный» фон за счёт отказа от цветных blur-кругов и градиентов в Hero и секциях

---

## [2025-03-05] — MedTech редизайн: светлая тема, пробирки, микронидлинг

### Добавлено
- **Design System v2**: двойная тема — светлый фон (Medical White #F8FAFC) для публичных страниц, тёмная для Dashboard (`.dark` wrapper)
- **Компонент TestTubeChart**: визуализация уровня HAEE в лабораторных пробирках (430/244/74 пг/мл), glassmorphism, анимация заполнения Framer Motion `whileInView`
- **Компонент MicroneedlingAnimation**: интерактивная демонстрация протокола микронидлинга — горизонтальные/вертикальные/диагональные проходы, анимированный роллер
- **Компонент AnimatedCounter**: счётчики числовых показателей (55%, 28.2 млн, 430 пг/мл) с анимацией при скролле
- **8 секций лендинга**: Hero (светлый, градиент), Science (пробирки + scan-line + stats), Тройное действие (3 колонки), Протокол (5 шагов + анимация роллера), Безопасность (4 карточки), FAQ (5 вопросов для RAG), Где купить (маркетплейсы), Footer с disclaimer
- **CSS утилиты**: `.glass-tube`, `.glass-gold` (светлый фон), `.animate-scan` (масс-спектрометрия эффект)

### Изменено
- **globals.css**: `:root` теперь светлая тема, `.dark` — тёмная. Переписаны `.glass` утилиты под белый фон
- **Navbar**: светлая цветовая схема, scroll-triggered glassmorphism, navy text вместо ice
- **Footer**: добавлены маркетплейсы, патент, ТР ТС, обязательный disclaimer о косметическом средстве
- **Dashboard layout**: обёрнут в `.dark` для сохранения тёмной темы
- **Landing page**: полностью переписан с нуля (8 секций MedTech дизайна)

### Исправлено
- —

---

## [2025-03-05] — AI Chat Widget, Дашборд менеджера, ЮKassa mock

### Добавлено
- **Vercel AI SDK v6**: пакеты `ai`, `@ai-sdk/openai`, `@ai-sdk/react`. API route `/api/chat` со streaming (streamText + toUIMessageStreamResponse)
- **Chat Widget**: полная интеграция с OpenAI GPT-4o-mini, системный промт B2C Sales Consultant из ai-system-prompts.md, иконки Bot/User, индикатор загрузки, обработка ошибок
- **Дашборд менеджера**: `/dashboard/manager` — таблица заказов (ID, клиент, товары, статус, сумма, дата), фильтры по статусу, поиск по ID/клиенту/товару, сортировка (по дате/сумме), stats-карточки (выручка, всего, в доставке, ожидают)
- **ЮKassa mock**: `lib/api/payments.ts` перестроен под YooKassa API (PaymentStatus, confirmation_url → redirect flow, capturePayment). Страница подтверждения `/shop/checkout/confirm` с анимацией 3D Secure → capture → success
- **Webhook endpoint**: `/api/payments/webhook` (mock, обрабатывает payment.succeeded / payment.canceled)
- **Mock-данные**: 6 заказов с разными статусами для реалистичного дашборда

### Изменено
- Checkout page: после оплаты перенаправляет на `/shop/checkout/confirm` (как реальная ЮKassa)
- DashboardSidebar: добавлена ссылка «Управление заказами» (ClipboardList icon)
- `.env.local.example`: добавлены OPENAI_API_KEY, YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY

### Исправлено
- AI SDK v6 API: `toDataStreamResponse` → `toUIMessageStreamResponse`, `useChat` → `DefaultChatTransport` + explicit `UIMessage` generic
- `@ai-sdk/react` добавлен как отдельный пакет (не входит в `ai`)

---

## [2025-03-05] — Этап 2: Коммерция (Checkout, Заказы, Профиль)

### Добавлено
- **Zod-схемы валидации**: `lib/validation/schemas.ts` — checkoutSchema, profileSchema
- **Абстракция платежей**: `lib/api/payments.ts` — mock-реализация PaymentIntent (заменяемая на YooKassa/Stripe), `formatPrice` утилита
- **Zustand store заказов**: `lib/api/orders.ts` — createOrder, updateStatus, getOrder, mock-данные
- **Страница оформления**: `/shop/checkout` — форма с контактами, адресом, Zod-валидацией, mock-оплатой, экран успеха
- **Мои заказы**: `/dashboard/orders` — список заказов с Badge-статусами, суммой, ссылкой на детали
- **Детальный заказ**: `/dashboard/orders/[id]` — Timeline-трекинг (создан → оплачен → в доставке → доставлен), состав заказа
- **Профиль пользователя**: `/dashboard/profile` — карточка с ролью, форма редактирования имени и телефона с Zod-валидацией

### Изменено
- Корзина `/shop/cart`: кнопка «Оформить заказ» теперь ведёт на `/shop/checkout`
- DashboardSidebar: добавлены ссылки «Мои заказы», «Профиль», убрана заглушка «Настройки»

### Исправлено
- Zod 4 import: `zod/v4` → `zod` (в Zod 4 не нужен суб-путь)
- Checkout prerender: решено через `force-dynamic` layout для обхода SSR-проблемы Zod 4

---

## [2025-03-05] — Этап 1 MVP завершён (Auth, RBAC, Cart, SEO, Lint)

### Добавлено
- **Supabase SSR**: browser-клиент, server-клиент, middleware для обновления сессий
- **Аутентификация**: страницы `/login`, `/register`, OAuth callback `/auth/callback`, Server Actions (login, signup, signOut)
- **RBAC**: утилита `lib/rbac.ts` (иерархия ролей, правила маршрутов), `RoleGuard` Server Component
- **Dashboard auth**: серверный layout с проверкой пользователя, LLM Settings обёрнута в `RoleGuard(admin)`
- **Корзина UI**: страница `/shop/cart` (количество, удаление, итого), кнопка «В корзину» в магазине подключена к Zustand store
- **SEO**: `sitemap.ts`, `robots.ts`, JSON-LD компонент (Organization + Product schema)
- **Lint/Format**: Prettier (`.prettierrc`), Husky pre-commit hook, lint-staged
- **Navbar**: реактивное auth-состояние (кнопка Войти / Кабинет+Выход)
- **DashboardSidebar**: выделен в client-компонент с signOut

### Изменено
- `.cursorrules`: Next.js 14 → 16, добавлены Tailwind v4, Zod
- `package.json`: скрипты `format`, `format:check`, `prepare`; lint-staged конфиг
- Root layout: добавлен JSON-LD Organization

### Исправлено
- Auth-страницы сделаны `force-dynamic` для корректной сборки без Supabase env

---

## [2025-03-05] — Базовый каркас приложения (Шаги 1–4)

### Добавлено
- **Next.js 16 scaffold**: route groups `(public)` и `(dashboard)`, App Router
- **Зависимости**: lucide-react, framer-motion, zustand, zod, @supabase/supabase-js, shadcn/ui
- **Design System**: Tailwind v4 @theme с HAEE-палитрой (navy, gold, ice, glass), шрифты Inter + Playfair Display
- **Компоненты**: Navbar (glassmorphism), Footer, ChatWidget (плавающий AI-виджет)
- **Публичные страницы**: Hero landing (/), Science (/science), Shop (/shop)
- **Dashboard**: Личный кабинет (/dashboard), LLM Settings (/dashboard/admin/llm-settings)
- **SQL-схема**: profiles, products, orders, ai_prompts, audit_logs с RLS и seed-данными
- **TypeScript-типы**: UserRole, Profile, Product, Order, AiPrompt, AuditLog, CartItem, LLMSettings
- **Мок-сервисы**: Zustand cart store, mock auth (getCurrentUser, signIn, signOut)
- **Shadcn UI**: button, card, input, label, select, slider, textarea, badge, separator

### Изменено
- Root layout: шрифты Inter/Playfair, lang="ru", metadata для SEO
- globals.css: полностью переписан под HAEE Design System (dark-first)

### Исправлено
- Тип `ease` в Framer Motion variants (as const для совместимости с TypeScript strict)

---

## [2025-03-05] — Расширение документации (Project.md, Tasktracker, Diary, qa)

### Добавлено
- **Project.md**: детальное описание целей, архитектуры (Mermaid), этапов разработки, технологий, безопасности, производительности
- **Tasktracker.md**: задачи по этапам с приоритетами (Критический/Высокий/Средний/Низкий)
- **Diary.md**: дневник наблюдений (Наблюдения, Решения, Проблемы)
- **qa.md**: вопросы по архитектуре (платежи, RAG, интеграции, хостинг, регуляторика)

### Изменено
- Структура docs приведена к требованиям системного архитектора

### Исправлено
- —

---

## [2025-03-05] — Инициализация документации и процесса разработки

### Добавлено
- Структура документации: `docs/changelog.md`, `docs/tasktracker.md`, `docs/project.md`
- Система версионирования Портала: `VERSION`, `docs/VERSION_HISTORY.md`
- Cursor rule для процесса разработки (`.cursor/rules/development-workflow.mdc`)
- Шаблоны форматов для changelog и tasktracker

### Изменено
- —

### Исправлено
- —
