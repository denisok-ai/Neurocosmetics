/**
 * @file products.ts
 * @description Каталог продуктовой линейки HAEE Neurocosmetics (системная нейрокосметология)
 * @dependencies lib/types
 * @created 2025-03-06
 */

import type { Product } from "@/lib/types";

const now = new Date().toISOString();

export const HAEE_PRODUCTS: Product[] = [
  {
    id: "haee-starter",
    name: "HAEE Starter: Системный старт",
    description:
      "Идеальный комплект для первого знакомства с технологией трансдермального восстановления. Базовый курс для первичной нейтрализации свободных радикалов и коррекции тона кожи плеч и рук.",
    price: 12_900,
    image_url: "/images/haee-starter-1-front.png",
    stock: 100,
    is_active: true,
    created_at: now,
    course: "10 процедур (1 раз в 7–10 дней). Около 2,5 месяцев.",
    composition: "10 ампул по 2 мл, мезороллер, спиртовые салфетки, протокол процедуры.",
    images: [
      "/images/haee-starter-1-front.png",
      "/images/haee-starter-2-left.png",
      "/images/haee-starter-3-right.png",
      "/images/haee-starter-4-top.png",
      "/images/haee-starter-5-detail.png",
    ],
  },
  {
    id: "haee-intensive",
    name: "HAEE Intensive: Нейро-Регенерация",
    description:
      "Усиленный комплекс при выраженном фотостарении или глубоком дефиците пептида (постковидный синдром, хронический стресс). Полный курс восстановления защиты мозга.",
    price: 19_900,
    image_url: "/images/haee-intensive-1-front.png",
    stock: 50,
    is_active: true,
    created_at: now,
    course: "Первые 4 недели — 1 раз в 5–7 дней, далее — 1 раз в 7–10 дней.",
    composition: "20 ампул (2×10), мезороллер (замена через 15 процедур), крем-постуход SPF 30+.",
    images: [
      "/images/haee-intensive-1-front.png",
      "/images/haee-intensive-2-left.png",
      "/images/haee-intensive-3-right.png",
      "/images/haee-intensive-4-top.png",
      "/images/haee-intensive-5-detail.png",
    ],
  },
  {
    id: "haee-refill",
    name: "HAEE Refill: Поддерживающий уход",
    description:
      "Экономичный вариант для тех, кто уже имеет мезороллер и завершил основной курс. Поддержание нормы HAEE в крови и предотвращение повторной пигментации (lentigo senilis).",
    price: 8_500,
    image_url: "/images/haee-refill-1-front.png",
    stock: 100,
    is_active: true,
    created_at: now,
    course: "1 процедура в 2–4 недели.",
    composition: "10 ампул по 2 мл.",
    images: [
      "/images/haee-refill-1-front.png",
      "/images/haee-refill-2-left.png",
      "/images/haee-refill-3-right.png",
      "/images/haee-refill-4-top.png",
      "/images/haee-refill-5-detail.png",
    ],
  },
  {
    id: "haee-professional",
    name: "HAEE Professional: B2B-Box",
    description:
      "Формат для клиник эстетической медицины и нейрореабилитационных центров. Интеграция HAEE в протоколы когнитивных дисфункций и анти-эйдж ухода. Маржинальность для партнёра выше 70%.",
    price: 0,
    image_url: "/images/haee-professional-1-front.png",
    stock: 0,
    is_active: true,
    created_at: now,
    course: "По протоколу клиники.",
    composition:
      "Диспенсер 50–100 ампул, сменные насадки для аппаратов микронидлинга, доступ к AI-аттестации персонала.",
    price_on_request: true,
    images: [
      "/images/haee-professional-1-front.png",
      "/images/haee-professional-2-left.png",
      "/images/haee-professional-3-right.png",
      "/images/haee-professional-4-top.png",
      "/images/haee-professional-5-detail.png",
    ],
  },
];

/** Продукты, доступные для добавления в корзину (D2C) */
export const RETAIL_PRODUCTS = HAEE_PRODUCTS.filter((p) => !p.price_on_request);

/** Продукт B2B (только «По запросу») */
export const B2B_PRODUCT = HAEE_PRODUCTS.find((p) => p.price_on_request);

export function getProduct(id: string): Product | undefined {
  return HAEE_PRODUCTS.find((p) => p.id === id);
}
