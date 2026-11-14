"use client";

import { useEffect, useRef } from "react";
import { setFavorites, useFavorites } from "@/lib/cart-store";

/**
 * Üye girişliyken favorileri sunucuyla eşitler: ilk açılışta cihazdaki ve hesaptaki favoriler birleştirilir,
 * sonra her değişiklik hesaba yazılır. (Misafirlerde bu bileşen render edilmez; favoriler yalnızca cihazdadır.)
 */
export function FavoritesSync() {
  const favorites = useFavorites();
  const ready = useRef(false);
  const latest = useRef(favorites);
  useEffect(() => { latest.current = favorites; });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/account/favorites");
        if (!response.ok) return;
        const { slugs } = (await response.json()) as { slugs: string[] };
        const merged = [...new Set([...slugs, ...latest.current])];
        if (cancelled) return;
        ready.current = true;
        setFavorites(merged);
        if (merged.length !== slugs.length) await fetch("/api/account/favorites", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slugs: merged }) });
      } catch { /* çevrimdışıysa yalnızca cihazda kalır */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    const timer = window.setTimeout(() => {
      fetch("/api/account/favorites", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slugs: favorites }) }).catch(() => {});
    }, 400);
    return () => window.clearTimeout(timer);
  }, [favorites]);

  return null;
}
