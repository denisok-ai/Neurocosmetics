/**
 * @file sitemap.ts
 * @description Динамический sitemap.xml для SEO
 * @dependencies -
 * @created 2025-03-05
 */

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haee-neuro.ru";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    {
      url: `${BASE_URL}/science`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
