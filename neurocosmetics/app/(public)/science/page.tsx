/**
 * @file page.tsx
 * @description Страница «Наука» — MedTech стиль, пробирки, статистика, блоки
 * @dependencies components/medtech/test-tube-chart, animated-counter, ScienceContent
 * @created 2025-03-05
 */

import type { Metadata } from "next";
import { ScienceContent } from "./science-content";

export const metadata: Metadata = {
  title: "Наука",
  description:
    "Научные исследования и патенты эндогенного пептида HAEE (Ac-His-Ala-Glu-Glu-NH2). Дефицит HAEE и нейродегенерация.",
};

export default function SciencePage() {
  return <ScienceContent />;
}
