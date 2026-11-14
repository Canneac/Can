"use client";

import Link from "next/link";
import { useCart, useFavorites } from "@/lib/cart-store";

export function HeaderActions() {
  const cart = useCart();
  const favorites = useFavorites();
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <div className="header-actions">
      <Link href="/wishlist" aria-label={`Favoriler, ${favorites.length} ürün`} className="header-actions__link">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.700 3.700 4.500 7 4.500c2 0 3.600 1.100 5 3 1.400-1.900 3-3 5-3 3.300 0 5.400 3.200 4.200 6.700-1.700 4.700-9.200 9.300-9.200 9.300z" /></svg>
        {favorites.length > 0 && <b>{favorites.length}</b>}
      </Link>
      <Link href="/cart" aria-label={`Sepet, ${cartCount} ürün`} className="header-actions__link">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.200 12H6.200zM9 8V6.500a3 3 0 0 1 6 0V8" /></svg>
        {cartCount > 0 && <b>{cartCount}</b>}
      </Link>
    </div>
  );
}
