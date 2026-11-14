import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function StorefrontHeader() {
  return (
    <>
      <div className="announcement" aria-label="Site bilgisi">
        <span>THE PRIVATE GALLERY</span><span className="announcement__divider" aria-hidden="true" />
        <span>YAŞAMIN HER KÖŞESİ İÇİN BİR SEÇKİ</span>
      </div>
      <header className="site-header">
        <Link className="site-header__logo" href="/" aria-label="NUVESSA ana sayfa">
          <BrandLogo variant="header" decorative priority className="wordmark" />
        </Link>
        <nav className="desktop-nav" aria-label="Ana gezinme">
          <Link href="/worlds">Tasarım dünyaları</Link>
          <Link href="/shop">Ürünleri keşfet</Link>
          <Link href="/rooms">Odaya göre</Link>
        </nav>
        <Link className="header-note" href="/shop"><span>Seçkiyi keşfet</span><span aria-hidden="true">↗</span></Link>
        <details className="mobile-nav">
          <summary aria-label="Gezinme menüsünü aç veya kapat"><span /><span /></summary>
          <nav aria-label="Mobil gezinme">
            <Link href="/worlds">Tasarım dünyaları</Link>
            <Link href="/shop">Ürünleri keşfet</Link>
            <Link href="/rooms">Odaya göre</Link>
          </nav>
        </details>
      </header>
    </>
  );
}

