# История версий — HAEE Neurocosmetics Portal

Версионирование следует [Semantic Versioning](https://semver.org/lang/ru/): `MAJOR.MINOR.PATCH`

- **MAJOR**: несовместимые изменения API/архитектуры
- **MINOR**: новая функциональность (обратно совместимая)
- **PATCH**: исправления ошибок

---

## [0.6.0] — 2025-03-05

### Добавлено
- MedTech Design System v2: светлая тема для public, тёмная для dashboard
- Компоненты: TestTubeChart (пробирки HAEE), MicroneedlingAnimation (протокол роллера), AnimatedCounter (числовые счётчики)
- Лендинг: 8 полных секций (Hero, Science, Action, Protocol, Safety, FAQ, Buy, Footer)
- CSS: .glass-tube, .animate-scan (масс-спектрометрия эффект)

### Изменено
- globals.css: полностью переработан (светлый :root + тёмный .dark)
- Navbar: scroll glassmorphism, светлая схема
- Footer: маркетплейсы, disclaimer, патент, ТР ТС

---

## [0.5.0] — 2025-03-05

### Добавлено
- Vercel AI SDK v6: Chat Widget с потоковыми ответами GPT-4o-mini, B2C Sales Consultant промт
- API route /api/chat (streamText + toUIMessageStreamResponse)
- Дашборд менеджера /dashboard/manager (таблица заказов, фильтры по статусу, поиск, сортировка, stats)
- ЮKassa mock: redirect flow с confirmation_url, страница 3D Secure (/shop/checkout/confirm)
- Webhook endpoint /api/payments/webhook
- 6 mock-заказов с разными статусами

### Изменено
- Checkout: redirect на ЮKassa confirm вместо мгновенного успеха
- DashboardSidebar: добавлена ссылка «Управление заказами»
- .env.local.example: OPENAI_API_KEY, YOOKASSA_*

---

## [0.4.0] — 2025-03-05

### Добавлено
- Абстракция платежей: PaymentIntent, createPayment (mock → YooKassa/Stripe)
- Zod-схемы валидации: checkoutSchema, profileSchema
- Zustand store заказов: createOrder, updateStatus, mock-данные
- Страница оформления заказа /shop/checkout с Zod-валидацией
- Страница «Мои заказы» /dashboard/orders со списком и Badge-статусами
- Детальный заказ /dashboard/orders/[id] с Timeline-трекингом доставки
- Профиль пользователя /dashboard/profile с редактированием через Supabase Auth

### Изменено
- Корзина: кнопка «Оформить» → переход на /shop/checkout
- DashboardSidebar: добавлены «Мои заказы», «Профиль»

---

## [0.3.0] — 2025-03-05

### Добавлено
- Supabase SSR: browser-клиент, server-клиент, middleware (обновление сессий)
- Аутентификация: /login, /register, /auth/callback, Server Actions
- RBAC: иерархия ролей, RoleGuard, маршрутные правила
- Dashboard: серверная проверка auth, DashboardSidebar с signOut
- Корзина: полноценная UI-страница /shop/cart
- SEO: sitemap.xml, robots.txt, JSON-LD Schema.org
- Prettier, Husky, lint-staged

### Изменено
- .cursorrules: Next.js 16, Tailwind v4, Zod
- Navbar: реактивное auth-состояние
- LLM Settings: RoleGuard(admin), client-форма выделена в компонент

---

## [0.2.0] — 2025-03-05

### Добавлено
- Базовый каркас Next.js 16 App Router с route groups (public)/(dashboard)
- HAEE Design System: Tailwind v4 @theme (navy, gold, ice, glass)
- Glassmorphism Navbar + Footer
- Hero Landing page с Framer Motion анимациями
- Страницы Science, Shop (заглушки)
- Dashboard: личный кабинет + LLM Settings (Shadcn UI форма)
- SQL-схема с 5 таблицами, RLS, seed-данными
- TypeScript-типы, мок-сервисы (cart, auth)
- Плавающий AI Chat Widget

---

## [0.1.0] — 2025-03-05

### Добавлено
- Инициализация проекта
- Структура документации (changelog, tasktracker, project.md)
- Система версионирования
- Cursor rules для процесса разработки
