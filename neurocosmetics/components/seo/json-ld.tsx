/**
 * @file json-ld.tsx
 * @description Schema.org JSON-LD для продуктов и организации
 * @dependencies -
 * @created 2025-03-05
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HAEE Neurocosmetics",
  url: "https://haee-neuro.ru",
  description:
    "Инновационная нейрокосметика на основе эндогенного пептида HAEE. Патент RU 2826728.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Russian",
  },
};

/** Продуктовая линейка для Schema.org (розничные наборы) */
export const PRODUCTS_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Продуктовая линейка HAEE Neurocosmetics",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "HAEE Starter: Системный старт",
        description:
          "Комплект для первого знакомства с трансдермальным восстановлением. 10 ампул, мезороллер, протокол. Курс 2,5 месяца.",
        brand: { "@type": "Brand", name: "HAEE Neurocosmetics" },
        offers: {
          "@type": "Offer",
          price: "12900",
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
          url: "https://haee-neuro.ru/shop",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Product",
        name: "HAEE Intensive: Нейро-Регенерация",
        description:
          "Усиленный комплекс при фотостарении и дефиците пептида. 20 ампул, мезороллер, крем SPF 30+.",
        brand: { "@type": "Brand", name: "HAEE Neurocosmetics" },
        offers: {
          "@type": "Offer",
          price: "19900",
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
          url: "https://haee-neuro.ru/shop",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Product",
        name: "HAEE Refill: Поддерживающий уход",
        description:
          "10 ампул для поддержания нормы HAEE и предотвращения пигментации. 1 процедура в 2–4 недели.",
        brand: { "@type": "Brand", name: "HAEE Neurocosmetics" },
        offers: {
          "@type": "Offer",
          price: "8500",
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
          url: "https://haee-neuro.ru/shop",
        },
      },
    },
  ],
};
