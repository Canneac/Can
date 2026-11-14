"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { slug: string; name: string; count: number };

const icons = {
  menu: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" /></svg>,
  close: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>,
  search: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></svg>,
};

const hints = ["Koltuk", "Buzdolabı", "Çöp kovası", "Tencere", "Nevresim", "Havlu"];

/** Sol taraftaki menü ve arama düğmeleri; tam ekran menü ve arama panelleri. */
export function HeaderControls({ departments }: { departments: Item[] }) {
  const [panel, setPanel] = useState<null | "menu" | "search">(null);

  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setPanel(null);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [panel]);

  return (
    <>
      <button type="button" className="zh__btn zh__menu" aria-label="Menüyü aç" aria-expanded={panel === "menu"} onClick={() => setPanel("menu")}>{icons.menu}</button>
      <nav className="zh__nav" aria-label="Ana gezinme">
        {departments.slice(0, 6).map((department) => <Link key={department.slug} href={`/shop?dept=${department.slug}`}>{department.name}</Link>)}
      </nav>
      <button type="button" className="zh__btn" aria-label="Ara" aria-expanded={panel === "search"} onClick={() => setPanel("search")}>{icons.search}</button>

      {panel === "menu" && (
        <div className="zmenu" role="dialog" aria-modal="true" aria-label="Menü">
          <div className="zmenu__bar">
            <span>MENÜ</span>
            <button type="button" className="zh__btn" aria-label="Menüyü kapat" onClick={() => setPanel(null)}>{icons.close}</button>
          </div>
          <div className="zmenu__body">
            <nav className="zmenu__list" aria-label="Departmanlar">
              <Link href="/shop" onClick={() => setPanel(null)}>Tümü</Link>
              {departments.map((department) => (
                <Link key={department.slug} href={`/shop?dept=${department.slug}`} onClick={() => setPanel(null)}>{department.name}<small>{department.count}</small></Link>
              ))}
            </nav>
            <div className="zmenu__aside">
              <b>Keşfet</b>
              <Link href="/shop?sort=new" onClick={() => setPanel(null)}>Yeni gelenler</Link>
              <Link href="/worlds" onClick={() => setPanel(null)}>Koleksiyonlar</Link>
              <b>Hesabım</b>
              <Link href="/wishlist" onClick={() => setPanel(null)}>Favorilerim</Link>
              <Link href="/cart" onClick={() => setPanel(null)}>Sepetim</Link>
            </div>
          </div>
        </div>
      )}

      {panel === "search" && (
        <div className="zsearch" role="dialog" aria-modal="true" aria-label="Arama">
          <div className="zmenu__bar">
            <span>ARA</span>
            <button type="button" className="zh__btn" aria-label="Aramayı kapat" onClick={() => setPanel(null)}>{icons.close}</button>
          </div>
          <form className="zsearch__form" action="/shop" role="search">
            <label className="visually-hidden" htmlFor="z-search-input">Katalogda ara</label>
            <input id="z-search-input" name="q" type="search" placeholder="Ne arıyorsunuz?" autoComplete="off" autoFocus />
            <button type="submit" className="zh__btn" aria-label="Ara">{icons.search}</button>
          </form>
          <div className="zsearch__hints">{hints.map((hint) => <Link key={hint} href={`/shop?q=${encodeURIComponent(hint)}`} onClick={() => setPanel(null)}>{hint}</Link>)}</div>
        </div>
      )}
    </>
  );
}
