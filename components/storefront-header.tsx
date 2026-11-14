import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { HeaderActions } from "@/components/header-actions";
import { readSnapshot } from "@/data/catalog-db";

const navLinks = [
  { href: "/shop", label: "Ürünler" },
  { href: "/worlds", label: "Tasarım dünyaları" },
  { href: "/rooms", label: "Odalara göre" },
  { href: "/shop?sort=new#urunler", label: "Yeni gelenler" },
];

export function StorefrontHeader() {
  const { categories } = readSnapshot();
  return (
    <>
      <div className="announcement" aria-label="Site bilgisi">
        <span>THE PRIVATE GALLERY</span><span className="announcement__divider" aria-hidden="true" />
        <span>EVİN TÜM İHTİYAÇLARI İÇİN BİR SEÇKİ</span>
      </div>
      <header className="site-header">
        <Link className="site-header__logo" href="/" aria-label="NUVESSA ana sayfa">
          <BrandLogo variant="header" decorative priority className="wordmark" />
        </Link>
        <form className="header-search" action="/shop" role="search">
          <label className="visually-hidden" htmlFor="header-search-input">Katalogda ara</label>
          <input id="header-search-input" name="q" type="search" placeholder="Kanepe, buzdolabı, çöp kovası ara…" autoComplete="off" />
          <button type="submit" aria-label="Ara"><span aria-hidden="true">⌕</span></button>
        </form>
        <div className="header-right">
          <nav className="desktop-nav" aria-label="Ana gezinme">
            {navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
          <HeaderActions />
          <details className="mobile-nav">
            <summary aria-label="Gezinme menüsünü aç veya kapat"><span /><span /></summary>
            <nav aria-label="Mobil gezinme">
              {navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
            </nav>
          </details>
        </div>
      </header>
      <nav className="category-bar" aria-label="Ürün kategorileri">
        <Link href="/shop#urunler" className="category-bar__all">Tüm ürünler</Link>
        {categories.map((category) => (
          <Link key={category.slug} href={`/shop?category=${category.slug}#urunler`}>{category.name}</Link>
        ))}
      </nav>
    </>
  );
}
