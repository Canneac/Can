"use client";

import { toggleFavorite, useFavorites } from "@/lib/cart-store";

export function FavoriteButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const favorites = useFavorites();
  const active = favorites.includes(slug);
  return (
    <button
      type="button"
      className={`favorite-button${active ? " is-active" : ""} ${className}`}
      aria-pressed={active}
      aria-label={active ? `${name} favorilerden çıkar` : `${name} favorilere ekle`}
      onClick={() => toggleFavorite(slug)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.700 3.700 4.500 7 4.500c2 0 3.600 1.100 5 3 1.400-1.900 3-3 5-3 3.300 0 5.400 3.200 4.200 6.700-1.700 4.700-9.200 9.300-9.200 9.300z" /></svg>
    </button>
  );
}
