"use client";

import { useState, useEffect } from "react";
import { Building2, Mail, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import type { B2BLead } from "@/lib/api/b2b-leads";

const LEADS_PER_PAGE = 10;

export function LeadsContent() {
  const [leads, setLeads] = useState<B2BLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/b2b/leads")
      .then((res) => {
        if (!res.ok) throw new Error("Доступ запрещён");
        return res.json();
      })
      .then(setLeads)
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Загрузка заявок…</p>
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
      <h1 className="font-serif text-3xl font-bold text-navy">B2B заявки</h1>
      <p className="mt-2 text-muted-foreground">Заявки от клиник и салонов с раздела B2B</p>

      <Card className="dashboard-card mt-8">
        <CardHeader>
          <CardTitle className="text-lg text-navy">Всего заявок: {leads.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-muted-foreground">Пока нет заявок.</p>
          ) : (
            <>
              <div className="space-y-4">
                {leads
                  .slice((page - 1) * LEADS_PER_PAGE, page * LEADS_PER_PAGE)
                  .map((lead) => (
                <div key={lead.id} className="rounded-xl border border-navy/10 bg-navy/[0.02] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-xs text-gold">
                      {lead.source === "b2b_chat" ? "Чат" : "Форма"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleString("ru-RU")}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-gold" />
                      <span className="text-navy">{lead.company || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Контакт:</span>
                      <span className="text-navy">{lead.contact_name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gold" />
                      <a href={`mailto:${lead.email}`} className="text-gold hover:underline">
                        {lead.email}
                      </a>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gold" />
                        <span className="text-navy">{lead.phone}</span>
                      </div>
                    )}
                  </div>
                  {lead.message && (
                    <div className="mt-3 flex gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 shrink-0 text-gold" />
                      <p className="text-muted-foreground">{lead.message}</p>
                    </div>
                  )}
                </div>
                  ))}
              </div>
              <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  {leads.length === 0
                    ? "Заявок нет"
                    : `Показано ${(page - 1) * LEADS_PER_PAGE + 1}–${Math.min(page * LEADS_PER_PAGE, leads.length)} из ${leads.length} заявок`}
                </p>
                <Pagination
                  page={page}
                  totalPages={Math.max(1, Math.ceil(leads.length / LEADS_PER_PAGE))}
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
