"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FlaskConical, ShoppingCart, User, LogIn, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/science", label: "Наука" },
  { href: "/shop", label: "Магазин" },
  { href: "/b2b", label: "B2B" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-gold" />
            <span className="font-serif text-xl font-bold tracking-wide text-navy">HAEE</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-navy/80 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:rounded-md"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                aria-label="Корзина"
                className="rounded-full p-2 text-navy/80 transition-colors hover:bg-navy/5 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ShoppingCart className="h-5 w-5" />
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    aria-label="Личный кабинет"
                    className="rounded-full p-2 text-navy/80 transition-colors hover:bg-navy/5 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    aria-label="Выйти"
                    className="rounded-full p-2 text-navy/80 transition-colors hover:bg-navy/5 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <LogIn className="h-4 w-4" />
                  Войти
                </Link>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
            className="rounded-lg p-2 text-navy/80 transition-colors hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-t border-navy/5 md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-navy/80 transition-colors hover:bg-navy/5 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-navy/5 pt-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy/80 hover:bg-navy/5 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                    >
                      <User className="h-4 w-4" /> Кабинет
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy/80 hover:bg-navy/5 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                    >
                      <LogOut className="h-4 w-4" /> Выход
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gold hover:bg-gold/5"
                  >
                    <LogIn className="h-4 w-4" /> Войти
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
