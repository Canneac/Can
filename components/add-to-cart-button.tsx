"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart-store";

type Props = {
  productSlug: string;
  variantId: string;
  sourceWorld: string | null;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
};

export function AddToCartButton({ productSlug, variantId, sourceWorld, quantity = 1, disabled, className = "", label = "Sepete ekle" }: Props) {
  const [added, setAdded] = useState(false);
  return (
    <span className="add-to-cart">
      <button
        type="button"
        className={`add-to-cart__button ${className}`}
        disabled={disabled}
        onClick={() => {
          addToCart({ productSlug, variantId, quantity, sourceWorld });
          setAdded(true);
          window.setTimeout(() => setAdded(false), 2200);
        }}
      >
        {disabled ? "Tükendi" : added ? "Sepete eklendi ✓" : label}
      </button>
      <span className="visually-hidden" role="status" aria-live="polite">{added ? "Ürün sepete eklendi." : ""}</span>
      {added && <Link className="add-to-cart__link" href="/cart">Sepete git →</Link>}
    </span>
  );
}
