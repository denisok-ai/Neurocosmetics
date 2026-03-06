/**
 * @file test-data.ts
 * @description Тестовые данные для режима отладки — 40+ позиций в каждом блоке
 * @created 2025-03-06
 */

import type { Order, OrderStatus } from "@/lib/types";
import type { B2BLead } from "@/lib/api/b2b-leads";
import type { AuditEntry } from "@/lib/api/audit";

const PRODUCTS = [
  { id: "haee-starter", name: "HAEE Starter: Системный старт", price: 12_900 },
  { id: "haee-intensive", name: "HAEE Intensive: Нейро-Регенерация", price: 19_900 },
  { id: "haee-refill", name: "HAEE Refill: Поддерживающий уход", price: 8_500 },
];

const USER_IDS = Array.from({ length: 15 }, (_, i) =>
  `00000000-0000-0000-0000-${String(i + 1).padStart(12, "0")}`
);

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString();
}

/** 45 тестовых заказов */
export function generateTestOrders(): Order[] {
  const orders: Order[] = [];
  for (let i = 1; i <= 45; i++) {
    const product = randomItem(PRODUCTS);
    const qty = Math.floor(Math.random() * 3) + 1;
    orders.push({
      id: `ord_test_${String(i).padStart(3, "0")}`,
      user_id: randomItem(USER_IDS),
      status: randomItem(STATUSES),
      total: product.price * qty,
      items: [
        {
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          price: product.price,
        },
      ],
      created_at: randomDate(90),
    });
  }
  return orders.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

const COMPANIES = [
  "Клиника «Нейро+»",
  "Медцентр «Здоровье»",
  "Салон красоты «Элит»",
  "Косметология «Афродита»",
  "Медицинский центр «Долголетие»",
  "Клиника эстетики «Венера»",
  "Салон «Премиум»",
  "Медцентр «Реабилитация»",
  "Клиника «Нейро-Космет»",
  "Салон «Идеал»",
  "МЦ «Пептид»",
  "Клиника «Анти-эйдж»",
  "Салон «Люкс»",
  "Медцентр «Вита»",
  "Клиника «Нейропротекция»",
];

const NAMES = [
  "Иванова Анна",
  "Петров Сергей",
  "Сидорова Мария",
  "Козлов Дмитрий",
  "Новикова Елена",
  "Морозов Андрей",
  "Волкова Ольга",
  "Соколов Игорь",
  "Лебедева Татьяна",
  "Кузнецов Павел",
  "Попова Наталья",
  "Васильев Алексей",
  "Михайлова Светлана",
  "Федоров Николай",
  "Андреева Юлия",
];

/** 45 тестовых B2B-лидов */
export function generateTestLeads(): B2BLead[] {
  const leads: B2BLead[] = [];
  for (let i = 1; i <= 45; i++) {
    leads.push({
      id: `lead_test_${String(i).padStart(3, "0")}`,
      company: randomItem(COMPANIES),
      contact_name: randomItem(NAMES),
      email: `contact${i}@clinic${i}.ru`,
      phone: `+7 (9${String(Math.floor(Math.random() * 100)).padStart(2, "0")}) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 90) + 10)}-${String(Math.floor(Math.random() * 90) + 10)}`,
      message: i % 3 === 0 ? "Интересует оптовая поставка HAEE Professional для клиники." : "",
      source: i % 2 === 0 ? "b2b_chat" : "b2b_form",
      created_at: randomDate(60),
    });
  }
  return leads.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

const ACTIONS = [
  "order_created",
  "order_status_updated",
  "b2b_lead_created",
  "user_login",
  "llm_settings_updated",
  "audit_log_viewed",
];

const ENTITY_TYPES = ["order", "b2b_lead", "user", "llm_prompt", "profile"];

/** 45 тестовых записей аудита */
export function generateTestAudit(): AuditEntry[] {
  const entries: AuditEntry[] = [];
  for (let i = 1; i <= 45; i++) {
    entries.push({
      id: `audit_test_${String(i).padStart(3, "0")}`,
      user_id: i % 4 === 0 ? null : randomItem(USER_IDS),
      action: randomItem(ACTIONS),
      entity_type: randomItem(ENTITY_TYPES),
      entity_id: `ent_${String(i).padStart(4, "0")}`,
      metadata: { test: true, index: i },
      created_at: randomDate(30),
    });
  }
  return entries.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
