"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart-store";

/** Ürün kartındaki küçük "+" düğmesi: tek varyantlı ürünü doğrudan sepete ekler. */
export function QuickAdd({ productSlug, variantId, sourceWorld, name }: { productSlug: string; variantId: string; sourceWorld: string | null; name: string }) {
  const [done, setDone] = useState(false);
  return (
    <>
      <button
        type="button" className={`pcard__add${done ? " is-done" : ""}`} aria-label={`${name} sepete ekle`}
        onClick={() => {
          addToCart({ productSlug, variantId, quantity: 1, sourceWorld });
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        }}
      >{done ? "✓" : "+"}</button>
      <span className="visually-hidden" role="status" aria-live="polite">{done ? "Ürün sepete eklendi." : ""}</span>
    </>
  );
}
