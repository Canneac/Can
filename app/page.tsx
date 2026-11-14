import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { HeroVideo } from "@/components/hero-video";
import { ProductCard } from "@/components/product-card";
import { ProductIcon } from "@/components/product-icon";
import { SceneBlock } from "@/components/scene-block";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { WorldLink } from "@/components/world-link";
import { readSnapshot } from "@/data/catalog-db";
import { designWorlds } from "@/data/catalog";
import { scenes } from "@/data/scenes";
import { WORLD_CONTENT } from "@/data/worlds-content";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const { products, categories, brands, rooms } = readSnapshot();
  const brandName = (slug: string) => brands.find((brand) => brand.slug === slug)?.name;
  const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name;
  const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.rank - b.rank).slice(0, 4);
  const essentials = products.filter((product) => ["temizlik", "mutfak", "depolama", "banyo"].includes(product.categorySlug)).slice(0, 4);
  const countFor = (slug: string) => products.filter((product) => product.categorySlug === slug || product.categorySlugs?.includes(slug)).length;

  return (
    <main id="top">
      <StorefrontHeader />

      <section className="hero" aria-labelledby="hero-title">
        <Image
          src="/images/private-gallery-hero.png"
          alt="Geç ışıkla aydınlanan fildişi bir salon, bordo heykelsi vazo ve kadife oturma alanı"
          fill priority sizes="100vw" className="hero__image"
        />
        <HeroVideo /><div className="hero__wash" aria-hidden="true" />
        <div className="hero__copy">
          <div className="eyebrow hero__eyebrow"><span className="eyebrow__rule" /> EVİN TÜM İHTİYAÇLARI, TEK YERDE</div>
          <h1 id="hero-title">NUVESSA</h1>
          <p className="hero__description">Bir evden daha fazlası.</p>
          <div className="hero__actions">
            <Link className="button button--dark" href="/worlds">Tasarım dünyalarını keşfet</Link>
            <Link className="button button--outline" href="/shop">Alışverişe başla</Link>
          </div>
        </div>
        <div className="hero__caption" aria-hidden="true"><span>MODERN FORM · SOFT LIVING · HERITAGE · ART HOUSE</span></div>
      </section>

      <section className="home-block" aria-labelledby="worlds-title">
        <div className="section-heading"><div><p className="eyebrow">TEK MARKA / DÖRT BAKIŞ</p><h2 id="worlds-title">Dört tasarım dünyası</h2></div><Link className="text-link" href="/worlds">Tüm dünyalar →</Link></div>
        <div className="home-worlds">
          {designWorlds.map((world) => (
            <WorldLink key={world.slug} world={world.slug} href={`/worlds/${world.slug}`} className={`home-world home-world--${world.className}`}>
              <Image src={WORLD_CONTENT[world.slug].image} alt="" fill sizes="(max-width: 700px) 100vw, 25vw" />
              <span className="home-world__text"><strong>{world.name}</strong><small>{world.quality}</small></span>
            </WorldLink>
          ))}
        </div>
      </section>

      <section className="home-block" aria-labelledby="categories-title">
        <div className="section-heading"><div><p className="eyebrow">KATEGORİYE GÖRE</p><h2 id="categories-title">Evin her ihtiyacı için</h2></div><Link className="text-link" href="/shop">Tüm ürünler →</Link></div>
        <div className="category-tiles__grid">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.slug} href={`/shop?category=${category.slug}#urunler`} className={`category-tile${category.image ? "" : " category-tile--icon"}`}>
              {category.image ? <Image src={category.image} alt="" fill sizes="(max-width: 700px) 46vw, 24vw" /> : <ProductIcon name={category.icon} className="category-tile__icon" />}
              <span className="category-tile__label"><strong>{category.name}</strong><small>{countFor(category.slug)} ürün ↗</small></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-block" aria-labelledby="new-title">
        <div className="section-heading"><div><p className="eyebrow">YENİ GELENLER</p><h2 id="new-title">Yeni eklenenler</h2></div><Link className="text-link" href="/shop?sort=new#urunler">Hepsini gör →</Link></div>
        <div className="catalog-grid">{newest.map((product) => <ProductCard key={product.slug} product={product} brandName={brandName(product.brand)} categoryName={categoryName(product.categorySlug)} />)}</div>
      </section>

      <section className="home-block home-block--room" aria-labelledby="room-title">
        <div className="section-heading"><div><p className="eyebrow">SHOP THE ROOM</p><h2 id="room-title">Bir odadan, doğrudan sepete.</h2></div><Link className="text-link" href="/rooms">Tüm odalar →</Link></div>
        <SceneBlock scene={scenes[0]} />
        <p className="room-scenes__note">Numaralı noktalara dokunun: ürünü görün, detaya gidin ya da sepete ekleyin.</p>
      </section>

      <section className="home-block home-block--essentials" aria-labelledby="essentials-title">
        <div className="section-heading"><div><p className="eyebrow">GÜNLÜK EV İHTİYAÇLARI</p><h2 id="essentials-title">Çöp kovasından tencereye.</h2></div><Link className="text-link" href="/shop?category=temizlik#urunler">Günlük ihtiyaçlar →</Link></div>
        <p className="room-scenes__note">Büyük mobilya kadar küçük ihtiyaçlar da burada: temizlik, mutfak, depolama ve banyo.</p>
        <div className="catalog-grid">{essentials.map((product) => <ProductCard key={product.slug} product={product} brandName={brandName(product.brand)} categoryName={categoryName(product.categorySlug)} />)}</div>
      </section>

      <section className="home-block" aria-labelledby="rooms-title">
        <div className="section-heading"><div><p className="eyebrow">ODALARA GÖRE</p><h2 id="rooms-title">Hangi odayı donatıyorsunuz?</h2></div></div>
        <div className="home-rooms">{rooms.map((room) => <Link key={room.slug} href={`/rooms/${room.slug}`}>{room.name}</Link>)}</div>
      </section>

      <section className="manifesto" id="yaklasim" aria-labelledby="manifesto-title">
        <div className="manifesto__mark"><BrandLogo variant="darkSection" decorative className="primary-logo" /></div>
        <div className="manifesto__copy">
          <p className="eyebrow eyebrow--light">NUVESSA YAKLAŞIMI</p>
          <h2 id="manifesto-title">Ev; büyük kararların<br />ve küçük ihtiyaçların <em>toplamıdır.</em></h2>
          <p className="manifesto__note">Bir koltuk seçmek kadar bir çöp kovası bulmak da önemlidir. NUVESSA, evin her ihtiyacını tek yerde, özenli tasarımla ve sade bir alışverişle buluşturmayı hedefler.</p>
          <Link className="button button--outline-light" href="/shop">Alışverişe başla</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
