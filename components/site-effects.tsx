"use client";

import { useEffect } from "react";
import { setFavorites } from "@/lib/cart-store";

/**
 * Küçük dokunuşlar: (1) bölümler görününce hafifçe yukarı süzülerek belirir,
 * (2) aşağı kaydırırken üst bar gizlenir, yukarı kaydırınca geri gelir.
 * Azaltılmış hareket tercihinde ikisi de devre dışıdır.
 */
export function SiteEffects() {
  // Çıkış yapıldığında (?cikis=1) bu cihazdaki favoriler temizlenir: ortak kullanılan cihazda bir sonraki kişiye geçmez.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("cikis") === "1") {
      setFavorites([]);
      url.searchParams.delete("cikis");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    const watch = () => document.querySelectorAll(".zsec:not(.is-in), .zf:not(.is-in)").forEach((element) => observer.observe(element));
    watch();
    const mutation = new MutationObserver(watch);
    mutation.observe(document.body, { childList: true, subtree: true });

    let last = window.scrollY;
    const onScroll = () => {
      const header = document.querySelector<HTMLElement>(".zh:not(.zh--overlay)");
      const y = window.scrollY;
      if (header) header.classList.toggle("zh--hidden", y > last && y > 160 && !document.querySelector(".zmenu, .zsearch"));
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      mutation.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
  return null;
}
