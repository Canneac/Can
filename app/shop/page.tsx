import { readCatalog } from "@/data/catalog-db";
import Image from "next/image";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront-header";
import { catalogCategories, designWorlds } from "@/data/catalog";
import { matchesSearch } from "@/domain/search";
import { formatTryFromKurus } from "@/domain/money";

type Props = { searchParams: Promise<{ q?: string | string[]; min?: string; max?: string; category?: string; world?: string; sort?: string }> };

export const metadata = { title: "Ürünleri keşfet | NUVESSA", description: "NUVESSA demo kataloğundaki seçili yaşam objelerini keşfedin." };

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const selectedCategory = params.category ?? "";
  const selectedWorld = params.world ?? "";
  const sort = params.sort ?? "featured";
  const products = readCatalog().sort((a, b) => Number(a.categorySlug === "dekoratif-objeler") - Number(b.categorySlug === "dekoratif-objeler"))
    .filter((product) => !selectedCategory || product.categorySlug === selectedCategory)
    .filter((product) => !selectedWorld || product.worlds.includes(selectedWorld))
    .filter((product) => matchesSearch(query, [product.name, product.material, product.description, product.searchTerms]))
    .filter((product) => (!params.min || product.priceInKurus >= Number(params.min) * 100) && (!params.max || product.priceInKurus <= Number(params.max) * 100))
    .sort((a, b) => sort === "price-asc" ? a.priceInKurus - b.priceInKurus : sort === "price-desc" ? b.priceInKurus - a.priceInKurus : 0);

  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="shop-editorial"><div><h1>Evinizin her köşesi için.</h1><p>Mobilyadan sofraya, günlük ihtiyaçlardan özel tasarımlara.</p><Link href="#urunler">Ürünleri keşfet ↗</Link></div><figure><Image src="/images/sofa-gallery.png" alt="Fildişi kanepe, ceviz sehpa ve bronz lambaderle düzenlenmiş salon" fill sizes="(max-width: 700px) 100vw, 58vw" priority /></figure></section>

      <nav className="shop-departments" aria-label="Ürün kategorileri">{[["mobilya","Mobilya","sofa-gallery"],["mutfak","Mutfak ve sofra","cutlery-gallery"],["temizlik","Temizlik","waste-bin-gallery"],["dekoratif-objeler","Dekorasyon","vase-bordeaux"]].map(([slug,name,image]) => <Link key={slug} href={`/shop?category=${slug}#urunler`}><figure><Image src={`/images/${image}.png`} alt="" fill sizes="(max-width: 700px) 45vw, 24vw" /></figure><strong>{name} ↗</strong></Link>)}</nav><section id="urunler" className="catalog-section" aria-labelledby="catalog-title">
        <div className="catalog-heading">
          <div><h2 id="catalog-title">Tüm ürünleri keşfet</h2><p>{products.length} ürün · Demo katalog</p></div>
          <p>Ürünler ve fiyatlar demo amaçlıdır.</p>
        </div>
        <div className="catalog-categories" aria-label="Katalog kategorileri"><Link href="/shop">Tüm ürünler</Link>
          {catalogCategories.filter((category) => category.status === "active").map((category) => (
            <Link key={category.slug} href={`/shop?category=${category.slug}`} aria-current={selectedCategory === category.slug ? "page" : undefined}>{category.name}</Link>
          ))}
        </div>
        <form className="catalog-controls" action="/shop">
          <label className="catalog-search">Katalogda ara
            <input name="q" defaultValue={query} placeholder="Örn. vazo, kanepe, mutfak..." />
          </label>
          {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
          {selectedWorld && <input type="hidden" name="world" value={selectedWorld} />}
          <label>Sırala
            <select name="sort" defaultValue={sort}>
              <option value="featured">Öne çıkanlar</option><option value="price-asc">Fiyat: artan</option><option value="price-desc">Fiyat: azalan</option>
            </select>
          </label>
          <label>En düşük fiyat (₺)<input type="number" min="0" name="min" defaultValue={params.min} /></label><label>En yüksek fiyat (₺)<input type="number" min="0" name="max" defaultValue={params.max} /></label><button type="submit">Uygula</button>
        </form>

        {products.length ? <div className="catalog-grid">
          {products.map((product) => (
            <article className={`catalog-card catalog-card--${product.tone}`} key={product.slug}>
              <Link href={`/products/${product.slug}`} className="catalog-card__image">
                <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 700px) 88vw, 31vw" />
                
                <i aria-hidden="true">↗</i>
              </Link>
              <div className="catalog-card__details"><div><p>NUVESSA · {product.material}</p><h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3></div><strong>{formatTryFromKurus(product.priceInKurus)}</strong></div>
              <div className="catalog-card__worlds">{product.worlds.map((slug) => <Link key={slug} href={`/worlds/${slug}`}>{designWorlds.find((world) => world.slug === slug)?.name}</Link>)}</div>
            </article>
          ))}
        </div> : <div className="catalog-empty"><span>NUVESSA / ARAMA</span><h3>Bu demo seçkisinde eşleşme yok.</h3><p>Aramanızı kısaltıp tekrar deneyin. Geniş ev ve yaşam kataloğu aşamalı olarak eklenecek.</p><Link href="/shop">Seçkinin tamamına dön ↗</Link></div>}
      </section>
      <p className="demo-disclosure">Tasarım önizlemesi · Katalog, adlar ve fiyatlar örnektir. Gerçek sipariş veya ödeme alınmaz.</p>
    </main>
  );
}



