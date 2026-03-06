# Project.md — HAEE Neurocosmetics Portal

Главный документ проекта. Содержит обзор архитектуры, ссылки на детальную документацию и актуальную информацию о проекте.

**Последнее обновление**: 2025-03-05

---

## Обзор проекта

**HAEE Neurocosmetics** — D2C-портал для продажи косметического продукта HAEE (эндогенный пептид) с системой AI-агентов для консультирования и поддержки клиентов.

---

## Связанные документы

| Документ | Описание |
|----------|----------|
| [project-architecture.md](../project-architecture.md) | Архитектура, роли, маршруты, AI-агенты |
| [ai-system-prompts.md](../ai-system-prompts.md) | Промпты для AI-агентов |
| [changelog.md](./changelog.md) | Журнал изменений |
| [tasktracker.md](./tasktracker.md) | Трекер задач |
| [VERSION_HISTORY.md](./VERSION_HISTORY.md) | История версий Портала |

---

## Технологический стек

- **Framework**: Next.js 14 (App Router)
- **Язык**: TypeScript (strict mode)
- **Стили**: Tailwind CSS, Shadcn UI, Framer Motion, Lucide Icons
- **БД и Auth**: Supabase (PostgreSQL)
- **State**: Zustand
- **AI**: Vercel AI SDK, LangChain.js
- **Платежи**: YooKassa API (или Stripe)

---

## Design System

- **Primary**: Deep Navy Blue (#0B132B), Champagne Gold (#D4AF37)
- **Secondary**: Pure White (#FFFFFF), Medical Ice/Glass (#E2E8F0)
- **Стиль**: Premium MedTech, glassmorphism, микро-анимации

---

## Принципы разработки

- SOLID, KISS, DRY
- Единый стиль кода (линтеры, pre-commit hooks)
- Code review для всех изменений
- Документирование перед внесением изменений

---

## Версия Портала

Текущая версия: **0.1.0** (см. [VERSION](../VERSION) и [VERSION_HISTORY.md](./VERSION_HISTORY.md))
