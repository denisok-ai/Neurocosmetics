# Tasktracker.md — HAEE Neurocosmetics Portal

Отслеживание прогресса разработки на основе [Project.md](./Project.md).  
Приоритеты: **Критический** | **Высокий** | **Средний** | **Низкий**

**Статусы**: Не начата | В процессе | Завершена

---

## Этап 1: Фундамент (MVP) — ЗАВЕРШЁН

### Критический приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| 1.1 | Инициализация Next.js 16, TypeScript, Tailwind v4, ESLint, Shadcn UI | Завершена | Next.js 16.1.6, React 19 |
| 1.2 | Настройка Supabase: клиенты (browser/server), middleware, .env | Завершена | @supabase/ssr, middleware.ts |
| 1.3 | Аутентификация (login, register, callback, Server Actions) | Завершена | /login, /register, /auth/callback |
| 1.4 | RBAC (rbac.ts, RoleGuard, middleware redirect) | Завершена | 5 ролей, иерархия, маршрутные правила |

### Высокий приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| 1.5 | Публичная страница: главная (/) | Завершена | Hero + features, Framer Motion |
| 1.6 | Публичная страница: science (/science) | Завершена | Заглушка с 3 блоками |
| 1.7 | Публичная страница: shop (/shop) | Завершена | Товар + кнопка «В корзину» |
| 1.8 | Компоненты Design System (цвета, типографика, glassmorphism) | Завершена | globals.css, Navbar, Footer |
| 1.9 | Корзина (Zustand store + UI /shop/cart) | Завершена | +/-, удаление, итого |

### Средний приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| 1.10 | SEO: sitemap.ts, robots.ts, JSON-LD | Завершена | Organization + Product schema |
| 1.11 | Prettier + Husky pre-commit + lint-staged | Завершена | .prettierrc, .husky/pre-commit |

---

## Этап 2: Коммерция — ЗАВЕРШЁН

### Критический приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| 2.1 | Абстракция платежей (mock → YooKassa/Stripe) | Завершена | lib/api/payments.ts, PaymentIntent, formatPrice |
| 2.2 | Оформление заказа, создание платежа | Завершена | /shop/checkout, Zod-валидация, mock-оплата |
| 2.3 | Сервис заказов (Zustand store + mock) | Завершена | lib/api/orders.ts, createOrder, updateStatus |

### Высокий приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| 2.4 | Личный кабинет: список заказов | Завершена | /dashboard/orders, Badge-статусы |
| 2.5 | Личный кабинет: трекинг доставки | Завершена | /dashboard/orders/[id], Timeline UI |
| 2.6 | Личный кабинет: профиль пользователя | Завершена | /dashboard/profile, Zod-валидация, Supabase updateUser |

---

## Этап 2.5: MedTech Редизайн — ЗАВЕРШЁН

### Критический приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| R.1 | Design System v2: светлая тема (public) + тёмная (dashboard) | Завершена | :root = Medical White, .dark = Navy |
| R.2 | Компонент TestTubeChart (пробирки HAEE 430/244/74) | Завершена | Framer Motion whileInView, glassmorphism |
| R.3 | Компонент MicroneedlingAnimation (протокол роллера) | Завершена | useAnimation, 3 направления, зацикленный |
| R.4 | Компонент AnimatedCounter (числовые счётчики) | Завершена | useInView + requestAnimationFrame |
| R.5 | Лендинг: 8 секций MedTech (Hero→FAQ→Buy) | Завершена | Science, Action, Protocol, Safety, FAQ, Buy |
| R.6 | Navbar: scroll glassmorphism + светлая тема | Завершена | Прозрачный → glass при scroll |
| R.7 | Footer: маркетплейсы + disclaimer | Завершена | Ozon, WB, Lamoda, Золотое Яблоко |

### Средний приоритет (backlog)

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| R.8 | Адаптация auth-страниц (login, register) под светлую тему | Завершена | Белый карточки, bg-[#FAFAFA], navy текст |
| R.9 | Обновление /science под MedTech стиль | Завершена | TestTubeChart, AnimatedCounter, science-content.tsx |
| R.10 | Адаптация /shop и /shop/cart под светлую тему | Завершена | Navy/gold, светлые карточки, bg-[#FAFAFA] |
| R.11 | Замена CSS-плейсхолдеров на реальные 3D рендеры ампул | Не начата | Нужны ассеты |

---

## Этап 2.6: Дизайн и UX (MedTech)

На основе [аудита дизайна](./design-audit.md): консистентность, a11y, MedTech-стиль.

### Высокий приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| D.1 | Focus-visible и шкала отступов секций (globals.css) | Завершена | ring-gold, ring-offset, --section-py |
| D.2 | Skip link «Перейти к контенту» + id="main" | Завершена | Public layout, a11y |
| D.3 | Navbar: aria-label, aria-expanded, контраст navy/80 | Завершена | Иконки, бургер-меню |
| D.4 | Footer: mailto для email, title для маркетплейсов | Завершена | focus-visible на ссылках |

### Средний приоритет (backlog)

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| D.5 | Типографическая шкала в Project.md и использование в ключевых блоках | Завершена | Project.md 4.3.1, globals.css, лендинг/shop/science |

---

## Этап 2.7: Продуктовая линейка HAEE

Концепция «системная нейрокосметология»: 4 набора, РРЦ, B2B «По запросу», месседж «эндогенный щит для мозга».

### Высокий приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| P.1 | Каталог продуктов: Starter, Intensive, Refill, Professional (lib/data/products.ts) | Завершена | Цены 12 900 / 19 900 / 8 500 / по запросу |
| P.2 | Магазин: карточки линейки, B2B «Запросить для клиники» | Завершена | /shop — сетка из 4 карточек |
| P.3 | Месседж «инвестиция в эндогенный щит для мозга» на лендинге и SEO (ItemList) | Завершена | Hero, PRODUCTS_LD в layout |

---

## Этап 3: AI-агенты

### Критический приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| 3.1 | RAG: векторная БД, эмбеддинги, индексация контента | Завершена | pgvector в schema.sql (rag_chunks, match_rag_chunks), searchRagChunks в lib/rag/vector-store.ts; чат сначала ищет в БД, иначе in-memory/keyword. POST /api/rag/seed (admin) — индексация чанков |
| 3.2 | Sales Consultant Agent (публичные страницы) | Завершена | Vercel AI SDK v6, GPT-4o-mini, B2C prompt, streaming |
| 3.3 | Care Companion Agent (личный кабинет) | Завершена | /api/chat/care, CareChatBlock на /dashboard |

### Высокий приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| 3.4 | B2B Consultant Agent | Завершена | /b2b, /api/chat/b2b, форма заявки, /api/b2b/leads, дашборд лидов |
| 3.5 | Настройка промптов (редактирование в админке) | Завершена | GET/PATCH /api/ai/prompts, чат использует промпт из БД |
| 3.6 | Дашборд менеджера (таблица заказов, фильтры) | Завершена | /dashboard/manager, stats, search, filters |
| 3.7 | ЮKassa mock (confirmation_url, 3D Secure, webhook) | Завершена | /shop/checkout/confirm, /api/payments/webhook |

---

## Этап 4: Администрирование

### Критический приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| 4.1 | Админ-панель: аналитика (продажи, LTV, конверсия AI) | Завершена | /dashboard/admin/analytics, выручка, заказы, средний чек, по статусам |
| 4.2 | Админ-панель: CRM (клиенты, история, чаты) | Завершена | /dashboard/admin/crm, клиенты по заказам, B2B-лиды |
| 4.3 | AI Settings: модель, API, температура, промпты | Завершена | Shadcn форма + RoleGuard(admin) |

### Высокий приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| 4.4 | Интеграции: маркетплейсы (Ozon, WB, Lamoda) | Завершена | Конфиг lib/data/marketplaces.ts, ссылки из env (NEXT_PUBLIC_MARKETPLACE_*_URL); футер и лендинг «Где купить» используют getMarketplaces(); .env.local.example обновлён |
| 4.5 | Интеграции: банк, платёжный шлюз, статусы | Завершена | Конфиг lib/config/payments.ts (YooKassa env, webhook secret); lib/supabase/admin.ts (service_role для webhook); маппинг событий → статус в lib/api/order-status.ts; webhook обновляет заказ в Supabase при payment.succeeded/canceled |
| 4.6 | Уведомления: Mail, Telegram webhook | Завершена | lib/config/notifications.ts (Telegram/Mail env); lib/api/notifications.ts — sendTelegramMessage (Bot API), sendEmail (Resend или mock); при payment.succeeded — уведомление в Telegram; .env: TELEGRAM_*, RESEND_API_KEY, NOTIFICATION_EMAIL_FROM |
| 4.7 | Audit Log | Завершена | lib/api/audit.ts, GET /api/audit, /dashboard/admin/audit |

---

## Этап 5: Масштабирование

### Средний приоритет

| ID | Задача | Статус | Примечания |
|----|--------|--------|------------|
| 5.1 | Оптимизация: Core Web Vitals, кэширование | Завершена | viewport, font-display:swap, ChatWidgetLazy, Cache-Control /api/products, images AVIF/WebP |
| 5.2 | Мониторинг, алерты | Завершена | /api/health, reportCriticalError, Telegram-алерты при webhook/order ошибках |
| 5.3 | A/B-тесты | Завершена | lib/ab/, useExperiment, hero_cta демо на лендинге |

---

## Легенда

- **Критический**: блокирует другие задачи или этап
- **Высокий**: важная функциональность, желательно в текущем этапе
- **Средний**: улучшения, можно отложить
- **Низкий**: nice-to-have
