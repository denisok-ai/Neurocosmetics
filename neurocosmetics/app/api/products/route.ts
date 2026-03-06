/**
 * @file route.ts
 * @description GET /api/products — список продуктов из Supabase (публичный)
 * При ошибке или пустом результате — fallback на статичные данные.
 * @created 2025-03-06
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { HAEE_PRODUCTS } from "@/lib/data/products";
import type { Product } from "@/lib/types";

function rowToProduct(r: {
  id: string;
  slug?: string | null;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}): Product {
  const meta = r.metadata ?? {};
  return {
    id: r.slug ?? r.id,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    image_url: r.image_url,
    stock: r.stock,
    is_active: r.is_active,
    created_at: r.created_at,
    course: meta.course as string | undefined,
    composition: meta.composition as string | undefined,
    price_on_request: meta.price_on_request as boolean | undefined,
    images: meta.images as string[] | undefined,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from("products")
      .select("id, slug, name, description, price, image_url, stock, is_active, metadata, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[api/products] Supabase error, using fallback:", error.message);
      return NextResponse.json(HAEE_PRODUCTS, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }

    const products = (rows ?? []).map(rowToProduct);
    if (products.length === 0) {
      return NextResponse.json(HAEE_PRODUCTS, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }
    return NextResponse.json(products, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    console.warn("[api/products] Error, using fallback:", e);
    return NextResponse.json(HAEE_PRODUCTS, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }
}
