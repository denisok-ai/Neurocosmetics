/**
 * @file layout.tsx
 * @description Root layout — шрифты, metadata, глобальные обёртки
 * @dependencies next/font/google
 * @created 2025-03-05
 */

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { JsonLd, ORGANIZATION_LD, PRODUCTS_LD } from "@/components/seo/json-ld";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HAEE Neurocosmetics — Инновационная нейрокосметика",
    template: "%s | HAEE Neurocosmetics",
  },
  description:
    "Революционный эндогенный пептид HAEE для трансдермального омоложения и нейропротекции. Патент RU 2826728.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "HAEE Neurocosmetics",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <JsonLd data={ORGANIZATION_LD} />
        <JsonLd data={PRODUCTS_LD} />
        {children}
      </body>
    </html>
  );
}
