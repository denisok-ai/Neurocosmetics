"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
}

export function ChatWidget() {
  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    messages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Здравствуйте! Я AI-консультант HAEE Neurocosmetics. Расскажу о продукте, помогу оформить заказ или отвечу на вопросы о курсе применения.",
          },
        ],
      },
    ] satisfies UIMessage[],
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" as const }}
            className="fixed right-4 bottom-20 z-50 flex w-80 flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-dark/95 shadow-2xl backdrop-blur-xl sm:w-96"
            style={{ maxHeight: "min(500px, 70vh)" }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-sm font-semibold text-ice">
                  AI Консультант HAEE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-ice"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto p-4"
            >
              {messages.map((m) => {
                const text = getMessageText(m.parts as Array<{ type: string; text?: string }>);
                if (!text) return null;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-2",
                      m.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {m.role === "assistant" && (
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20">
                        <Bot className="h-3.5 w-3.5 text-gold" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                        m.role === "user"
                          ? "rounded-tr-sm bg-gold/20 text-ice"
                          : "glass-gold rounded-tl-sm text-ice"
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
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20">
                    <Bot className="h-3.5 w-3.5 text-gold" />
                  </div>
                  <div className="glass-gold rounded-xl rounded-tl-sm px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-center text-xs text-red-400">
                  Ошибка подключения к AI. Проверьте OPENAI_API_KEY.
                </p>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-white/5 p-3">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Задайте вопрос..."
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
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-lg shadow-gold/20 transition-colors hover:bg-gold-light"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-navy" />
        ) : (
          <MessageCircle className="h-6 w-6 text-navy" />
        )}
      </motion.button>
    </>
  );
}
