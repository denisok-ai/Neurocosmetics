"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  /** Текущая страница (1-based) */
  page: number;
  /** Всего страниц */
  totalPages: number;
  /** Обработчик смены страницы */
  onPageChange: (page: number) => void;
  /** Показать только если страниц больше 1 */
  hideIfSinglePage?: boolean;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  hideIfSinglePage = true,
  className,
}: PaginationProps) {
  if (totalPages <= 1 && hideIfSinglePage) return null;

  const showPrev = page > 1;
  const showNext = page < totalPages;

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | "...")[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l !== undefined && i - l !== 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  return (
    <nav
      className={cn("flex items-center justify-between gap-2", className)}
      aria-label="Пагинация"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!showPrev}
        className="border-navy/10"
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`dot-${i}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors",
                p === page
                  ? "bg-gold/20 text-gold"
                  : "text-muted-foreground hover:bg-gold/5 hover:text-gold"
              )}
            >
              {p}
            </button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!showNext}
        className="border-navy/10"
      >
        Вперёд
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
