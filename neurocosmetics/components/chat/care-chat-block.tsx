/**
 * @file care-chat-block.tsx
 * @description Чат Care Companion в личном кабинете (задача 3.3)
 * @dependencies @ai-sdk/react, ai, components/ui/button
 * @created 2025-03-06
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
}

export function CareChatBlock() {
  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat/care" }),
    messages: [
      {
        id: "care-welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Здравствуйте! Я помощник по уходу HAEE. Подскажу, как правильно применять сыворотку и мезороллер, напомню про SPF и помогу с повторным заказом, когда курс будет заканчиваться.",
          },
        ],
      },
    ] satisfies UIMessage[],
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  }

  return (
    <div className="glass-dark rounded-2xl overflow-hidden border border-white/10">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-gold" />
          <span className="font-semibold text-ice">Помощник по уходу</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {isExpanded ? "Свернуть" : "Открыть чат"}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-white/5 flex flex-col" style={{ height: "320px" }}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-4">
            {messages.map((m) => {
              const text = getMessageText(m.parts as Array<{ type: string; text?: string }>);
              if (!text) return null;
              return (
                <div
                  key={m.id}
                  className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  {m.role === "assistant" && (
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20">
                      <Bot className="h-3.5 w-3.5 text-gold" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      m.role === "user"
                        ? "rounded-tr-sm bg-gold/20 text-ice"
                        : "bg-white/5 rounded-tl-sm text-ice"
                    )}
                  >
                    {text}
                  </div>
                  {m.role === "user" && (
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <User className="h-3.5 w-3.5 text-ice" />
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                </div>
                <div className="rounded-xl rounded-tl-sm bg-white/5 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                </div>
              </div>
            )}
            {error && (
              <p className="text-center text-xs text-red-400">
                Ошибка подключения. Проверьте сеть.
              </p>
            )}
          </div>
          <form onSubmit={handleSend} className="flex gap-2 shrink-0 border-t border-white/5 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Вопрос по применению или заказу..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ice placeholder:text-muted-foreground focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/30 disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="shrink-0 bg-gold text-navy hover:bg-gold-light disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
