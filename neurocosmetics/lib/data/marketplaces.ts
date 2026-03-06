/**
 * @file marketplaces.ts
 * @description Конфиг маркетплейсов «Где купить» — ссылки из env или значения по умолчанию
 * @created 2025-03-06
 */

export interface Marketplace {
  id: string;
  name: string;
  href: string;
  /** Для отображения «Скоро», если ссылка заглушка */
  isPlaceholder?: boolean;
}

/**
 * Возвращает список маркетплейсов. URL подставляются из env:
 * NEXT_PUBLIC_MARKETPLACE_OZON_URL, NEXT_PUBLIC_MARKETPLACE_WB_URL, NEXT_PUBLIC_MARKETPLACE_LAMODA_URL, NEXT_PUBLIC_MARKETPLACE_GOLDAPPLE_URL
 */
export function getMarketplaces(): Marketplace[] {
  if (typeof window === "undefined") {
    return getMarketplacesServer();
  }
  return getMarketplacesServer();
}

function getMarketplacesServer(): Marketplace[] {
  const env = (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;
  return [
    {
      id: "ozon",
      name: "Ozon",
      href: env.NEXT_PUBLIC_MARKETPLACE_OZON_URL || "#",
      isPlaceholder: !env.NEXT_PUBLIC_MARKETPLACE_OZON_URL,
    },
    {
      id: "wildberries",
      name: "Wildberries",
      href: env.NEXT_PUBLIC_MARKETPLACE_WB_URL || "#",
      isPlaceholder: !env.NEXT_PUBLIC_MARKETPLACE_WB_URL,
    },
    {
      id: "lamoda",
      name: "Lamoda",
      href: env.NEXT_PUBLIC_MARKETPLACE_LAMODA_URL || "#",
      isPlaceholder: !env.NEXT_PUBLIC_MARKETPLACE_LAMODA_URL,
    },
    {
      id: "goldapple",
      name: "Золотое Яблоко",
      href: env.NEXT_PUBLIC_MARKETPLACE_GOLDAPPLE_URL || "#",
      isPlaceholder: !env.NEXT_PUBLIC_MARKETPLACE_GOLDAPPLE_URL,
    },
  ];
}
