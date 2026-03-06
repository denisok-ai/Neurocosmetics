/**
 * @file layout.tsx
 * @description Layout для публичных страниц — Navbar + Footer + Chat Widget
 * @dependencies components/layout/navbar, components/layout/footer, components/chat/chat-widget
 * @created 2025-03-05
 */

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatWidgetLazy } from "@/components/chat/chat-widget-lazy";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Перейти к контенту
      </a>
      <Navbar />
      <main id="main" className="min-h-screen pt-16" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <ChatWidgetLazy />
    </>
  );
}
