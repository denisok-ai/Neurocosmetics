/**
 * @file page.tsx
 * @description Страница «Магазин» — продуктовая линейка HAEE (Starter, Intensive, Refill, Professional)
 * @dependencies lib/data/products, lib/api/cart, shadcn/ui
 * @created 2025-03-05, обновлено 2025-03-06
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Image3D } from "@/components/medtech/image-3d";
import { ShoppingCart, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/api/cart";
import { HAEE_PRODUCTS } from "@/lib/data/products";
import type { Product } from "@/lib/types";

function formatPrice(price: number): string {
  if (price === 0) return "По запросу";
  return `${price.toLocaleString("ru-RU")} ₽`;
}

const GALLERY_LABELS = ["Фронт", "Слева", "Справа", "Сверху", "Деталь"];

const GALLERY_INTERVAL_MS = 3500;

function ProductCard({ product }: { product: Product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { addItem, items } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const inCart = Boolean(cartItem);
  const isB2B = product.price_on_request === true;
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

  useEffect(() => {
    if (gallery.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % gallery.length);
    }, GALLERY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [gallery.length]);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-navy/5 bg-white shadow-sm transition-all hover:shadow-xl">
      <Link href={`/shop/${product.id}`} className="block flex-1">
        <div className="relative aspect-[4/5] min-h-[280px] bg-[#FAFAFA]">
        {gallery.length > 0 ? (
          <>
            <Image3D
              src={gallery[activeIndex]!}
              alt={`${product.name} — ракурс ${activeIndex + 1}`}
              fill
              className="object-contain object-center p-3 transition-opacity duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              tiltIntensity={8}
              scaleOnHover={false}
              wrapperClassName="absolute inset-0"
            />
            {gallery.length > 1 && (
              <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveIndex(i);
                    }}
                    className={`h-1.5 flex-1 max-w-10 rounded-full transition-colors ${
                      i === activeIndex ? "bg-gold" : "bg-navy/20 hover:bg-navy/40"
                    }`}
                    aria-label={`Ракурс ${i + 1}: ${GALLERY_LABELS[i] ?? ""}`}
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
        <div className="flex flex-1 flex-col p-5">
          <h2 className="typography-h3 group-hover:text-gold transition-colors">
            {product.name}
          </h2>
        <p className="typography-body-sm mt-2 line-clamp-3">{product.description}</p>
        {product.composition && (
          <p className="typography-caption mt-2">
            <span className="font-medium text-navy/80">Состав:</span> {product.composition}
          </p>
        )}
        {product.course && (
          <p className="typography-caption mt-1">
            <span className="font-medium text-navy/80">Курс:</span> {product.course}
          </p>
        )}
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 p-5 pt-0">
          <p className="typography-stat">{formatPrice(product.price)}</p>
          {isB2B ? (
            <Button
              asChild
              variant="outline"
              size="default"
              className="border-gold/40 text-navy hover:bg-gold/10 hover:text-gold"
            >
              <Link href="/b2b">
                <Building2 className="mr-2 h-4 w-4" />
                Запросить для клиники
              </Link>
            </Button>
          ) : (
            <Button
              size="default"
              onClick={() => addItem(product)}
              className="bg-gold text-navy hover:bg-gold-light"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {inCart
                ? `В корзине${cartItem!.quantity > 1 ? ` (${cartItem!.quantity})` : ""}`
                : "В корзину"}
            </Button>
          )}
      </div>
    </article>
  );
}

export default function ShopPage() {
  const { items } = useCartStore();
  const [products, setProducts] = useState<Product[]>(HAEE_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Product[] | null) => {
        if (data && data.length > 0) setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-4 py-24">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl bg-[#FAFAFA] px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="typography-h1">Магазин</h1>
          <p className="typography-lead mt-2">
            Продуктовая линейка HAEE: системная нейрокосметология для дома и клиник.
          </p>
        </div>
        {cartCount > 0 && (
          <Button
            asChild
            variant="outline"
            className="border-gold/30 text-navy hover:bg-gold/10 hover:text-gold"
          >
            <Link href="/shop/cart">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Корзина ({cartCount})
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-2 lg:max-w-5xl lg:mx-auto">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
