/**
 * @file llm-settings-form.tsx
 * @description Client-форма настройки LLM-провайдера
 * @dependencies shadcn/ui, lucide-react
 * @created 2025-03-05
 */

"use client";

import { useState, useEffect } from "react";
import { Bot, Save, RotateCcw, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { LLMProvider, AgentType } from "@/lib/types";
import type { AiPromptRow } from "@/lib/api/ai-prompts";

const MODELS: Record<LLMProvider, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
  ],
  deepseek: [
    { value: "deepseek-chat", label: "DeepSeek Chat" },
    { value: "deepseek-reasoner", label: "DeepSeek Reasoner (R1)" },
  ],
};

const DEFAULTS = {
  provider: "openai" as LLMProvider,
  model: "gpt-4o-mini",
  apiKey: "",
  temperature: 0.7,
  prompt: "",
};

export function LLMSettingsForm() {
  const [provider, setProvider] = useState<LLMProvider>(DEFAULTS.provider);
  const [model, setModel] = useState(DEFAULTS.model);
  const [apiKey, setApiKey] = useState(DEFAULTS.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [temperature, setTemperature] = useState(DEFAULTS.temperature);
  const [promptList, setPromptList] = useState<AiPromptRow[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("sales");
  const [prompt, setPrompt] = useState(DEFAULTS.prompt);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [ragSeeding, setRagSeeding] = useState(false);
  const [ragSeedResult, setRagSeedResult] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [listRes, salesRes] = await Promise.all([
          fetch("/api/ai/prompts"),
          fetch("/api/ai/prompts?agent=sales"),
        ]);
        const list: AiPromptRow[] = listRes.ok ? await listRes.json() : [];
        const salesConfig = salesRes.ok
          ? await salesRes.json()
          : { system_prompt: "", model: DEFAULTS.model, temperature: DEFAULTS.temperature };
        setPromptList(list);
        setSelectedAgent("sales");
        setPrompt(salesConfig.system_prompt ?? "");
        setModel(salesConfig.model ?? DEFAULTS.model);
        setTemperature(Number(salesConfig.temperature) ?? DEFAULTS.temperature);
      } catch {
        setPrompt("");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (promptList.length === 0 || !selectedAgent) return;
    const row = promptList.find((p) => p.agent_type === selectedAgent);
    if (row) {
      setPrompt(row.system_prompt);
      setModel(row.model);
      setTemperature(Number(row.temperature));
    }
  }, [selectedAgent, promptList]);

  function onProviderChange(v: string) {
    const p = v as LLMProvider;
    setProvider(p);
    setModel(MODELS[p][0].value);
  }

  function onPromptSelect(agentType: string) {
    setSelectedAgent(agentType);
  }

  async function onSave() {
    setSaveError(null);
    try {
      const res = await fetch("/api/ai/prompts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_type: selectedAgent,
          system_prompt: prompt,
          model,
          temperature,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Ошибка сохранения");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Ошибка сохранения");
    }
  }

  async function onSeedRag() {
    setRagSeedResult(null);
    setRagSeeding(true);
    try {
      const res = await fetch("/api/rag/seed", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRagSeedResult(data.error ?? "Ошибка");
        return;
      }
      setRagSeedResult(`Проиндексировано чанков: ${data.indexed ?? 0}`);
    } catch {
      setRagSeedResult("Ошибка запроса");
    } finally {
      setRagSeeding(false);
    }
  }

  function onReset() {
    setProvider(DEFAULTS.provider);
    setModel(DEFAULTS.model);
    setApiKey(DEFAULTS.apiKey);
    setTemperature(DEFAULTS.temperature);
    if (promptList.length > 0) {
      const first = promptList[0];
      setSelectedAgent(first.agent_type);
      setPrompt(first.system_prompt);
      setModel(first.model);
      setTemperature(Number(first.temperature));
    } else setPrompt("");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <Bot className="h-7 w-7 text-gold" />
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">AI Настройки</h1>
          <p className="text-sm text-muted-foreground">
            Конфигурация LLM-провайдера и системных промптов (используются в чате на сайте)
          </p>
        </div>
      </div>

      <Card className="dashboard-card mt-8">
        <CardHeader>
          <CardTitle className="text-lg text-navy">Провайдер и модель</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider">Провайдер</Label>
              <Select value={provider} onValueChange={onProviderChange}>
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Модель (для чата)</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS[provider].map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-gold"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Ключ хранится в зашифрованном виде</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperature</Label>
              <Badge variant="secondary" className="font-mono text-xs">
                {temperature.toFixed(1)}
              </Badge>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(v) => setTemperature(v[0])}
              min={0}
              max={2}
              step={0.1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Точный (0.0)</span>
              <span>Креативный (2.0)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-card mt-6">
        <CardHeader>
          <CardTitle className="text-lg text-navy">Системный промпт (агент для чата)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promptPreset">Агент</Label>
            <Select value={selectedAgent} onValueChange={onPromptSelect}>
              <SelectTrigger id="promptPreset">
                <SelectValue placeholder="Выберите агента" />
              </SelectTrigger>
              <SelectContent>
                {promptList.length > 0 ? (
                  promptList.map((p) => (
                    <SelectItem key={p.id} value={p.agent_type}>
                      {p.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="sales">Sales Consultant (B2C) — по умолчанию</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">Текст промпта</Label>
            <Textarea
              id="systemPrompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              className="resize-y font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-card mt-6">
        <CardHeader>
          <CardTitle className="text-lg text-navy">База знаний RAG (pgvector)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Индекс для семантического поиска в чате. Заполните индекс статичными чанками (FAQ,
            продукты). Требует OPENAI_API_KEY и миграцию с vector.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={onSeedRag}
            disabled={ragSeeding}
            className="border-navy/10 text-muted-foreground hover:bg-gold/5 hover:text-gold"
          >
            {ragSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {ragSeeding ? "Заполняем…" : "Заполнить индекс"}
          </Button>
          {ragSeedResult && (
            <p
              className={`mt-3 text-sm ${ragSeedResult.startsWith("Проиндексировано") ? "text-green-400" : "text-red-400"}`}
            >
              {ragSeedResult}
            </p>
          )}
        </CardContent>
      </Card>

      {saveError && <p className="mt-4 text-sm text-red-400">{saveError}</p>}

      <Separator className="my-6 bg-navy/10" />

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onReset}
          className="border-navy/10 text-muted-foreground hover:bg-gold/5 hover:text-gold"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Сбросить
        </Button>
        <Button onClick={onSave} className="bg-gold text-navy hover:bg-gold-light">
          <Save className="mr-2 h-4 w-4" />
          {saved ? "Сохранено!" : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}
