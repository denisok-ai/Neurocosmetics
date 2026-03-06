"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, type ProfileFormData } from "@/lib/validation/schemas";
import type { UserRole } from "@/lib/types";

const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Гость",
  user: "Пользователь",
  b2b: "B2B Партнёр",
  manager: "Менеджер",
  admin: "Администратор",
};

export default function ProfilePage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? "");
        const meta = user.user_metadata ?? {};
        setFullName(meta.full_name ?? "");
        setPhone(meta.phone ?? "");
        setRole(meta.role ?? "user");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaved(false);

    const result = profileSchema.safeParse({ full_name: fullName, phone });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    await supabase.auth.updateUser({
      data: { full_name: fullName, phone },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Профиль</h1>
      <p className="mt-2 text-muted-foreground">
        Управляйте личными данными и настройками аккаунта.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Info card */}
        <Card className="dashboard-card lg:col-span-1">
          <CardContent className="flex flex-col items-center py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10">
              <User className="h-10 w-10 text-gold" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-bold text-navy">
              {fullName || "Пользователь"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            <Badge variant="secondary" className="mt-3 bg-gold/10 text-gold">
              {ROLE_LABELS[role]}
            </Badge>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="dashboard-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-navy">Личные данные</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="mt-1 border-navy/10 bg-navy/5 opacity-60"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Изменить email можно через настройки аутентификации.
                </p>
              </div>

              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Имя и фамилия
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="mt-1 border-navy/10 bg-navy/5"
                />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-red-400">{errors.full_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Телефон
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="mt-1 border-navy/10 bg-navy/5"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gold text-navy hover:bg-gold-light"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Сохранить
                </Button>
                {saved && <span className="text-sm text-emerald-400">Сохранено!</span>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
