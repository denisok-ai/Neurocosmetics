import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { getMarketplaces } from "@/lib/data/marketplaces";

export function Footer() {
  const marketplaces = getMarketplaces();
  return (
    <footer className="border-t border-navy/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-gold" />
              <span className="font-serif text-lg font-bold text-navy">HAEE</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Инновационная нейрокосметика на основе эндогенного пептида.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-navy">Навигация</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/science"
                  className="transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:rounded"
                >
                  Наука
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:rounded"
                >
                  Магазин
                </Link>
              </li>
              <li>
                <Link
                  href="/b2b"
                  className="transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:rounded"
                >
                  B2B
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:rounded"
                >
                  Личный кабинет
                </Link>
              </li>
              {process.env.NEXT_PUBLIC_DEBUG_MODE === "true" && (
                <li>
                  <Link
                    href="/debug"
                    className="transition-colors hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:rounded"
                  >
                    Режим отладки
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-navy">Где купить</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {marketplaces.map((m) => (
                <li key={m.id}>
                  <a
                    href={m.href}
                    className="transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:rounded"
                    title={m.isPlaceholder ? "Скоро" : undefined}
                    target={m.href.startsWith("http") ? "_blank" : undefined}
                    rel={m.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {m.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-navy">Документы</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Патент РФ&nbsp;№&nbsp;2826728</li>
              <li>ТР&nbsp;ТС&nbsp;009/2011</li>
              <li>
                <a
                  href="mailto:info@haee-neuro.ru"
                  className="transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:rounded"
                >
                  info@haee-neuro.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-navy/10 pt-6 space-y-2 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HAEE Neurocosmetics. Все права защищены.</p>
          <p className="font-medium">
            Сыворотка HAEE является косметическим средством и не является лекарственным препаратом.
          </p>
        </div>
      </div>
    </footer>
  );
}
