"use client";

import { useState, useEffect } from "react";
import { FileText, User, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import type { AuditEntry } from "@/lib/api/audit";

const ENTRIES_PER_PAGE = 15;

const ACTION_LABELS: Record<string, string> = {
  b2b_lead_created: "Создана B2B-заявка",
  order_created: "Создан заказ",
  order_status_updated: "Обновлён статус заказа",
};

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function AuditContent() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/audit?limit=100")
      .then((res) => {
        if (!res.ok) throw new Error("Доступ запрещён");
        return res.json();
      })
      .then(setEntries)
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Загрузка журнала…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Журнал аудита</h1>
      <p className="mt-2 text-muted-foreground">История значимых действий в системе</p>

      <Card className="dashboard-card mt-8">
        <CardHeader>
          <CardTitle className="text-lg text-navy">Записей: {entries.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-muted-foreground">Записей пока нет.</p>
          ) : (
            <>
              <div className="space-y-3">
                {entries
                  .slice((page - 1) * ENTRIES_PER_PAGE, page * ENTRIES_PER_PAGE)
                  .map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-start gap-3 rounded-lg border border-navy/10 bg-navy/[0.02] p-3 text-sm"
                >
                  <div className="flex items-center gap-2 text-gold">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{getActionLabel(entry.action)}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(entry.created_at).toLocaleString("ru-RU")}
                    </span>
                    {entry.entity_type && (
                      <span>
                        {entry.entity_type}
                        {entry.entity_id && ` #${entry.entity_id.slice(-8)}`}
                      </span>
                    )}
                    {entry.user_id && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {entry.user_id.slice(0, 8)}…
                      </span>
                    )}
                  </div>
                  {Object.keys(entry.metadata ?? {}).length > 0 && (
                    <pre className="mt-2 w-full overflow-x-auto rounded bg-navy/5 px-2 py-1 text-xs text-muted-foreground">
                      {JSON.stringify(entry.metadata)}
                    </pre>
                  )}
                </div>
                  ))}
              </div>
              <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  {entries.length === 0
                    ? "Записей нет"
                    : `Показано ${(page - 1) * ENTRIES_PER_PAGE + 1}–${Math.min(page * ENTRIES_PER_PAGE, entries.length)} из ${entries.length} записей`}
                </p>
                <Pagination
                  page={page}
                  totalPages={Math.max(1, Math.ceil(entries.length / ENTRIES_PER_PAGE))}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
