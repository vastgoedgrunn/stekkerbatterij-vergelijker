"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "./cart-store";
import { Container } from "@/components/patterns/section";
import { buttonVariants } from "@/components/ui/button";
import { ProductImage } from "@/features/products/product-image";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CartView() {
  const { items, totals, setQuantity, remove } = useCart();

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <div className="border-border mx-auto max-w-lg rounded-2xl border border-dashed p-12 text-center">
          <ShoppingCart className="text-muted-foreground mx-auto size-10" aria-hidden />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Je winkelmand is leeg</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Bekijk de batterijen en voeg een product toe om te bestellen.
          </p>
          <Link href="/batterijen" className={cn(buttonVariants(), "mt-6")}>
            Naar de catalogus
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">Winkelmand</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ul className="space-y-4">
          {items.map((item) => {
            return (
              <li
                key={item.offerId}
                className="border-border bg-card flex gap-4 rounded-2xl border p-4"
              >
                <ProductImage
                  name={item.name}
                  imagePath={item.imagePath}
                  imageStatus={null}
                  className="size-20 shrink-0 rounded-xl"
                  sizes="80px"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {item.brandName && (
                        <p className="text-muted-foreground text-xs">{item.brandName}</p>
                      )}
                      <Link
                        href={`/batterijen/${item.slug}`}
                        className="font-semibold hover:underline"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <span className="font-bold whitespace-nowrap">
                      {formatPrice(item.unitPriceCents * item.quantity)}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="border-border inline-flex items-center rounded-full border">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.offerId, item.quantity - 1)}
                        className="hover:bg-accent rounded-l-full p-2"
                        aria-label="Aantal verlagen"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.offerId, item.quantity + 1)}
                        className="hover:bg-accent rounded-r-full p-2"
                        aria-label="Aantal verhogen"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.offerId)}
                      className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1 text-sm"
                    >
                      <Trash2 className="size-4" /> Verwijder
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="border-border bg-card h-fit rounded-2xl border p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Overzicht</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotaal (excl. btw)</dt>
              <dd>{formatPrice(totals.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Btw ({Math.round(totals.vatRate * 100)}%)</dt>
              <dd>{formatPrice(totals.vatCents)}</dd>
            </div>
            <div className="border-border mt-2 flex justify-between border-t pt-2 text-base font-bold">
              <dt>Totaal</dt>
              <dd>{formatPrice(totals.totalCents)}</dd>
            </div>
          </dl>
          <Link href="/afrekenen" className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full")}>
            Afrekenen
          </Link>
          <Link
            href="/batterijen"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-2 w-full")}
          >
            Verder winkelen
          </Link>
        </aside>
      </div>
    </Container>
  );
}
