import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer site-footer--shop">
      <div className="site-footer__top">
        <Link href="/" className="site-footer__logo" aria-label="NUVESSA ana sayfa"><BrandLogo variant="footer" decorative className="footer-wordmark" /></Link>
        <p>Bir evden daha fazlası.<br /><span>Evin tüm ihtiyaçları için modern bir seçki.</span></p>
        <nav aria-label="Alışveriş"><Link href="/shop">Tüm ürünler</Link><Link href="/shop?sort=new#urunler">Yeni gelenler</Link><Link href="/rooms">Odalara göre</Link><Link href="/worlds">Tasarım dünyaları</Link></nav>
        <nav aria-label="Hesap"><Link href="/cart">Sepetim</Link><Link href="/wishlist">Favorilerim</Link><Link href="/shop?category=temizlik">Günlük ihtiyaçlar</Link></nav>
      </div>
      <div className="site-footer__bottom">
        <span>© NUVESSA</span>
        <span>Tasarım demosu · Ürünler, fiyatlar ve stoklar örnektir. Gerçek sipariş veya ödeme alınmaz.</span>
        <span>NUVESSA adı için marka tescili/hukuki inceleme tamamlanmamıştır.</span>
      </div>
    </footer>
  );
}
