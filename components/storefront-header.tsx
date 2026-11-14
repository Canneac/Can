import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { catalogCategories } from "@/data/catalog";

export function StorefrontHeader() {
  const categories = catalogCategories.filter((category) => category.status === "active");
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
          <input id="header-search-input" name="q" type="search" placeholder="Kanepe, buzdolabı, havlu, vazo ara…" autoComplete="off" />
          <button type="submit" aria-label="Ara"><span aria-hidden="true">⌕</span></button>
        </form>
        <nav className="desktop-nav" aria-label="Ana gezinme">
          <Link href="/worlds">Tasarım dünyaları</Link>
          <Link href="/shop">Ürünleri keşfet</Link>
          <Link href="/rooms">Odaya göre</Link>
        </nav>
        <details className="mobile-nav">
          <summary aria-label="Gezinme menüsünü aç veya kapat"><span /><span /></summary>
          <nav aria-label="Mobil gezinme">
            <Link href="/worlds">Tasarım dünyaları</Link>
            <Link href="/shop">Ürünleri keşfet</Link>
            <Link href="/rooms">Odaya göre</Link>
          </nav>
        </details>
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
