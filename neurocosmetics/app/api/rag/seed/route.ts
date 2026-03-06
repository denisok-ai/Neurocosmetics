/**
 * @file route.ts
 * @description POST /api/rag/seed — индексация чанков в pgvector (только admin). Требует OPENAI_API_KEY.
 * @created 2025-03-06
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChunksForSeed } from "@/lib/rag/context";
import { getEmbedding } from "@/lib/rag/embed";
import { toVectorString } from "@/lib/rag/vector-store";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const chunks = getChunksForSeed();
    const rows: { content: string; source: string; embedding: string }[] = [];

    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk.content);
      if (!embedding) continue;
      rows.push({
        content: chunk.content,
        source: chunk.source,
        embedding: toVectorString(embedding),
      });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Не удалось получить эмбеддинги (проверьте OPENAI_API_KEY)" },
        { status: 400 }
      );
    }

    await supabase.from("rag_chunks").delete().eq("source", "static");

    const { error } = await supabase.from("rag_chunks").insert(rows);

    if (error) {
      console.error("[api/rag/seed]", error);
      return NextResponse.json(
        {
          error:
            "Ошибка записи в БД. Убедитесь, что расширение vector и таблица rag_chunks созданы.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, indexed: rows.length });
  } catch (e) {
    console.error("[api/rag/seed]", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
