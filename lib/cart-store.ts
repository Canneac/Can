"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { lineKey, MAX_LINE_QUANTITY, type CartLineInput } from "@/domain/cart";

const EMPTY_CART: CartLineInput[] = [];
const EMPTY_FAVORITES: string[] = [];

const cartStore = createLocalStore<CartLineInput[]>("nuvessa.cart.v1", EMPTY_CART);
const favoriteStore = createLocalStore<string[]>("nuvessa.favorites.v1", EMPTY_FAVORITES);

export function useCart() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
}

export function useFavorites() {
  return useSyncExternalStore(favoriteStore.subscribe, favoriteStore.getSnapshot, favoriteStore.getServerSnapshot);
}

/** Aynı varyant + aynı kaynak dünya birleşir; farklı dünya ayrı satır olur. */
export function addToCart(line: CartLineInput) {
  const lines = cartStore.getSnapshot();
  const key = lineKey(line.variantId, line.sourceWorld);
  const existing = lines.find((entry) => lineKey(entry.variantId, entry.sourceWorld) === key);
  if (existing) {
    cartStore.set(lines.map((entry) => (entry === existing ? { ...entry, quantity: Math.min(MAX_LINE_QUANTITY, entry.quantity + line.quantity) } : entry)));
  } else {
    cartStore.set([...lines, { ...line, quantity: Math.min(MAX_LINE_QUANTITY, line.quantity) }]);
  }
}

export function setLineQuantity(key: string, quantity: number) {
  const lines = cartStore.getSnapshot();
  if (quantity < 1) return removeLine(key);
  cartStore.set(lines.map((entry) => (lineKey(entry.variantId, entry.sourceWorld) === key ? { ...entry, quantity: Math.min(MAX_LINE_QUANTITY, quantity) } : entry)));
}

export function removeLine(key: string) {
  cartStore.set(cartStore.getSnapshot().filter((entry) => lineKey(entry.variantId, entry.sourceWorld) !== key));
}

export function removeLines(keys: string[]) {
  if (!keys.length) return;
  cartStore.set(cartStore.getSnapshot().filter((entry) => !keys.includes(lineKey(entry.variantId, entry.sourceWorld))));
}

export function clearCart() {
  cartStore.set(EMPTY_CART);
}

export function toggleFavorite(slug: string) {
  const list = favoriteStore.getSnapshot();
  favoriteStore.set(list.includes(slug) ? list.filter((entry) => entry !== slug) : [...list, slug]);
}

/** Hesaptaki favorilerle birleştirilmiş listeyi cihaza yazar (üye girişinde). */
export function setFavorites(slugs: string[]) {
  favoriteStore.set(slugs);
}
