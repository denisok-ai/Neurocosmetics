/**
 * @file robots.ts
 * @description robots.txt для SEO
 * @dependencies -
 * @created 2025-03-05
 */

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haee-neuro.ru";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/auth/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
