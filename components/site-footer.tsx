import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { departments } from "@/data/departments";

export function SiteFooter() {
  return (
    <footer className="zf">
      <div className="zf__top">
        <div>
          <Link href="/" className="zf__logo" aria-label="NUVESSA ana sayfa"><BrandLogo variant="header" decorative className="wordmark" /></Link>
          <p>Bir evden daha fazlası. Evin tüm ihtiyaçları için modern bir seçki.</p>
        </div>
        <nav aria-label="Alışveriş"><h3>Alışveriş</h3>{departments.slice(0, 5).map((department) => <Link key={department.slug} href={`/shop?dept=${department.slug}`}>{department.name}</Link>)}</nav>
        <nav aria-label="Keşfet"><h3>Keşfet</h3><Link href="/shop?sort=new">Yeni gelenler</Link><Link href="/worlds">Koleksiyonlar</Link><Link href="/shop">Tüm ürünler</Link></nav>
        <nav aria-label="Hesap"><h3>Hesabım</h3><Link href="/cart">Sepetim</Link><Link href="/wishlist">Favorilerim</Link></nav>
      </div>
      <div className="zf__bottom">
        <span>© NUVESSA</span>
        <span>Tasarım demosu · Ürünler, fiyatlar ve stoklar örnektir · Gerçek sipariş veya ödeme alınmaz</span>
      </div>
    </footer>
  );
}
