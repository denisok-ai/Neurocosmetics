"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function B2BLeadForm() {
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorText("");
    setStatus("loading");
    try {
      const res = await fetch("/api/b2b/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          contact_name: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Ошибка отправки");
      }
      setStatus("success");
      setCompany("");
      setContactName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorText(err instanceof Error ? err.message : "Ошибка отправки");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Организация</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Клиника / салон"
            className="border-border bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_name">Контактное лицо</Label>
          <Input
            id="contact_name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Имя"
            className="border-border bg-white"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="border-border bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (999) 000-00-00"
            className="border-border bg-white"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Сообщение</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Интересуют оптовые поставки, минимальный заказ..."
          rows={3}
          className="resize-y border-border bg-white"
        />
      </div>
      {status === "success" && (
        <p className="text-sm font-medium text-green-600">
          Заявка отправлена. Менеджер свяжется с вами в ближайшее время.
        </p>
      )}
      {status === "error" && <p className="text-sm text-red-600">{errorText}</p>}
      <Button
        type="submit"
        disabled={status === "loading"}
        className="bg-gold text-navy hover:bg-gold-light"
      >
        {status === "loading" ? "Отправка…" : "Оставить заявку"}
      </Button>
    </form>
  );
}
