/**
 * @file page.tsx
 * @description Страница товара /shop/[id] — детальная карточка продукта
 * @created 2025-03-06
 */

"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Image3D } from "@/components/medtech/image-3d";
import { ArrowLeft, ShoppingCart, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/api/cart";
import { HAEE_PRODUCTS } from "@/lib/data/products";
import type { Product } from "@/lib/types";

function formatPrice(price: number): string {
  if (price === 0) return "По запросу";
  return `${price.toLocaleString("ru-RU")} ₽`;
}

const GALLERY_LABELS = ["Фронт", "Слева", "Справа", "Сверху", "Деталь"];

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const { addItem, items } = useCartStore();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : HAEE_PRODUCTS))
      .then((list: Product[]) => {
        const found = list.find((p) => p.id === id || p.id === decodeURIComponent(id));
        setProduct(found ?? null);
        setLoading(false);
      })
      .catch(() => {
        const found = HAEE_PRODUCTS.find((p) => p.id === id);
        setProduct(found ?? null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-4 py-24">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="typography-h1">Товар не найден</h1>
        <Button asChild className="mt-8 bg-gold text-navy hover:bg-gold-light">
          <Link href="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            В магазин
          </Link>
        </Button>
      </section>
    );
  }

  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];
  const inCart = Boolean(items.find((i) => i.product.id === product.id));
  const isB2B = product.price_on_request === true;

  return (
    <section className="mx-auto max-w-6xl bg-[#FAFAFA] px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/shop"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад в магазин
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-[4/5] min-h-[400px] overflow-hidden rounded-2xl bg-white shadow-lg">
          {gallery.length > 0 ? (
            <>
              <Image3D
                src={gallery[galleryIndex]!}
                alt={`${product.name} — ракурс ${galleryIndex + 1}`}
                fill
                className="object-contain object-center p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
                tiltIntensity={10}
                scaleOnHover={true}
                wrapperClassName="absolute inset-0"
              />
              {gallery.length > 1 && (
                <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGalleryIndex(i)}
                      className={`h-2 flex-1 max-w-12 rounded-full transition-colors ${
                        i === galleryIndex ? "bg-gold" : "bg-navy/20 hover:bg-navy/40"
                      }`}
                      aria-label={GALLERY_LABELS[i] ?? `Ракурс ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Нет изображения
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="typography-h1 lg:text-4xl">
            {product.name}
          </h1>
          <p className="typography-lead mt-4">
            {product.description}
          </p>
          {product.composition && (
            <div className="mt-4">
              <p className="typography-body-sm font-medium text-navy/80">Состав:</p>
              <p className="typography-body-sm mt-1">{product.composition}</p>
            </div>
          )}
          {product.course && (
            <div className="mt-3">
              <p className="typography-body-sm font-medium text-navy/80">Курс применения:</p>
              <p className="typography-body-sm mt-1">{product.course}</p>
            </div>
          )}

          <div className="mt-8 flex items-center gap-6">
            <p className="typography-stat">
              {formatPrice(product.price)}
            </p>
            {isB2B ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-gold/40 text-navy hover:bg-gold/10 hover:text-gold"
              >
                <Link href="/b2b">
                  <Building2 className="mr-2 h-5 w-5" />
                  Запросить для клиники
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => addItem(product)}
                className="bg-gold text-navy hover:bg-gold-light"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {inCart ? "В корзине" : "В корзину"}
              </Button>
            )}
          </div>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Все товары
          </Link>
        </div>
      </div>
    </section>
  );
}
