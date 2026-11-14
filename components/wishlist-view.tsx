"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/domain/catalog-types";
import { useFavorites } from "@/lib/cart-store";

export function WishlistView({ products }: { products: Product[] }) {
  const favorites = useFavorites();
  const selected = products.filter((product) => favorites.includes(product.slug));
  if (!selected.length) {
    return (
      <div className="cart-empty">
        <h2>Henüz favoriniz yok</h2>
        <p>Ürün kartlarındaki kalp simgesine dokunarak beğendiklerinizi burada toplayın. Favorileriniz bu cihazda saklanır.</p>
        <Link className="button button--dark" href="/shop">Ürünleri keşfet</Link>
      </div>
    );
  }
  return (
    <div className="pgrid">
      {selected.map((product) => <ProductCard key={product.slug} product={product} />)}
    </div>
  );
}
