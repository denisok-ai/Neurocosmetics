"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-loaded ChatWidget — уменьшает initial bundle (AI SDK, Framer Motion).
 * Загружается после гидрации; placeholder совпадает по размеру (h-14 w-14) для CLS.
 */
export const ChatWidgetLazy = dynamic(
  () => import("./chat-widget").then((m) => ({ default: m.ChatWidget })),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed right-4 bottom-4 z-50 h-14 w-14 rounded-full bg-gold shadow-lg shadow-gold/20"
        aria-hidden
      />
    ),
  }
);
