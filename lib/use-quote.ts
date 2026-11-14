"use client";

import { useEffect, useState } from "react";
import { removeLines, useCart } from "@/lib/cart-store";
import type { Quote } from "@/domain/cart";

/** Sepet satırlarını sunucuya gönderir; fiyat, stok ve toplamı sunucunun cevabıyla gösterir. */
export function useQuote() {
  const lines = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const signature = JSON.stringify(lines);

  useEffect(() => {
    if (lines.length === 0) return;
    const controller = new AbortController();
    fetch("/api/cart/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lines }), signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<Quote>) : Promise.reject(new Error("quote"))))
      .then((next) => {
        setError(false);
        setQuote(next);
        if (next.removedKeys.length) {
          setNotice("Stokta olmayan veya satıştan kalkan ürünler sepetinizden çıkarıldı.");
          removeLines(next.removedKeys);
        }
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(true);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return { lines, quote: lines.length ? quote : null, error: lines.length > 0 && error, notice, loading: lines.length > 0 && !quote && !error };
}
