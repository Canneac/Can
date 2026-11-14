"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

const WIPE_COLORS: Record<string, string> = {
  "modern-form": "linear-gradient(120deg, #123743, #4f8798)",
  "soft-living": "linear-gradient(120deg, #e9dcc3, #b8c1a6)",
  heritage: "linear-gradient(120deg, #3a1a22, #5a2a30)",
  "art-house": "linear-gradient(120deg, #231a45, #5b2a82)",
};

/**
 * Tasarım dünyasına kısa (≈0,4 sn) bir renk geçişiyle girer. Bu bir CSS geçişidir, video değildir.
 * Azaltılmış hareket tercihinde veya Ctrl/⌘/orta tıkta geçiş atlanır ve normal gezinme yapılır.
 */
export function WorldLink({ world, href, className, children }: { world: string; href: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    const wipe = document.createElement("div");
    wipe.className = "world-wipe";
    wipe.style.background = WIPE_COLORS[world] ?? "#211b19";
    wipe.setAttribute("aria-hidden", "true");
    document.body.appendChild(wipe);
    window.setTimeout(() => router.push(href), 380);
    window.setTimeout(() => wipe.remove(), 1400);
  };
  return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
}
