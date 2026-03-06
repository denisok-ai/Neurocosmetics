# HAEE Portal Architecture & Specifications

## 1. Roles & RBAC (Role-Based Access Control)
- **Guest:** Can view landing pages, product info, science/patents, and use the AI Consultant bot. Can add to cart.
- **Retail User (B2C):** Personal cabinet, order history, tracking, AI-Assistant for post-care (RAG based on instructions), subscription management.
- **Wholesale User (B2B):** Clinics/Salons. Bulk ordering, invoice generation, wholesale pricing, document flow, B2B support.
- **Manager:** CRM access, order processing, chat with clients (handoff from AI), managing marketplace exports (Ozon, WB, Lamoda).
- **Administrator:** Full access. Dashboard analytics, user management, LLM settings, prompt management, system logs.

## 2. Public Site (Marketing & SEO)
- `/`: Home. Hero section (3D ampoule), mechanism of action (transdermal mesoroller), clinical results (55% vs 30% amyloid block), D2C purchase CTA.
- `/science`: Deep dive into endogenous HAEE, patents (RU 2826728), preclinical data.
- `/shop`: Product catalog, pricing, AI Sales Agent widget.
- SEO: Schema.org JSON-LD for products, dynamic sitemaps, OpenGraph tags optimized for CTR.

## 3. Portal (Personal Cabinets) - `/dashboard`
- **User Dashboard:** Active orders, delivery status tracker, "My Course" calendar (reminders to use mesoroller every 7-10 days), loyalty points.
- **Admin/Manager Dashboard:**
  - `Analytics`: Sales, LTV, AI-agent conversion rates.
  - `CRM`: Client list, interaction history, AI chat transcripts.
  - `AI Settings`: Select model (GPT-4o, Claude 3.5), API keys, temperature, edit system prompts for each agent.
  - `Integrations`: Marketplaces stock sync, Bank/Payment gateway status, Mail/TG webhook settings.
  - `Audit Log`: Detailed journal of all actions (who, what, when).

## 4. AI Agents System (RAG + Agents)
- **Sales Consultant Agent:** Located on public pages. Goal: Explain the product, overcome objections, add to cart.
- **Onboarding & Retention Agent:** Located in User Cabinet. Goal: Guide through the 2-3 month course, advise on SPF 30+ usage, remind about next procedures.
- **Admin Copilot:** Located in Admin panel. Goal: Help managers analyze data ("Show me sales drop off this week").