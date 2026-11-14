import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductIcon } from "@/components/product-icon";
import { StorefrontHeader } from "@/components/storefront-header";
import { readCatalog } from "@/data/catalog-db";
import { catalogCategories, designWorlds, getCategory } from "@/data/catalog";
import { matchesSearch } from "@/domain/search";

type Params = { q?: string | string[]; min?: string; max?: string; category?: string; world?: string; sort?: string };
type Props = { searchParams: Promise<Params> };

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Ürünleri keşfet | NUVESSA",
  description: "Mobilyadan beyaz eşyaya, mutfaktan tekstile evin tüm ihtiyaçları için NUVESSA demo kataloğu.",
};

const sortLabels: Record<string, string> = { featured: "Öne çıkanlar", "price-asc": "Fiyat: artan", "price-desc": "Fiyat: azalan" };

function toKurus(value: string | undefined) {
  if (!value) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null;
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const selectedCategory = params.category ?? "";
  const selectedWorld = params.world ?? "";
  const sort = params.sort && sortLabels[params.sort] ? params.sort : "featured";
  const min = toKurus(params.min);
  const max = toKurus(params.max);

  const catalog = readCatalog();
  const categories = catalogCategories.filter((category) => category.status === "active");
  const countFor = (slug: string) => catalog.filter((product) => product.categorySlug === slug).length;

  const products = catalog
    .filter((product) => !selectedCategory || product.categorySlug === selectedCategory)
    .filter((product) => !selectedWorld || product.worlds.includes(selectedWorld))
    .filter((product) => matchesSearch(query, [product.name, product.material, product.description, product.searchTerms]))
    .filter((product) => (min === null || product.priceInKurus >= min) && (max === null || product.priceInKurus <= max))
    .sort((a, b) => (sort === "price-asc" ? a.priceInKurus - b.priceInKurus : sort === "price-desc" ? b.priceInKurus - a.priceInKurus : 0));

  const activeCategory = getCategory(selectedCategory);
  const activeWorld = designWorlds.find((world) => world.slug === selectedWorld);
  const hasFilters = Boolean(query || selectedCategory || selectedWorld || params.min || params.max);

  // Kategori bağlantıları arama, sıralama, fiyat ve dünya seçimini korur.
  const hrefFor = (category: string) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (category) next.set("category", category);
    if (selectedWorld) next.set("world", selectedWorld);
    if (sort !== "featured") next.set("sort", sort);
    if (params.min) next.set("min", params.min);
    if (params.max) next.set("max", params.max);
    const text = next.toString();
    return `/shop${text ? `?${text}` : ""}#urunler`;
  };

  return (
    <main className="store-page">
      <StorefrontHeader />

      <section className="shop-hero" aria-labelledby="shop-hero-title">
        <Image className="shop-hero__image" src="/images/sofa-gallery.png" alt="Gün ışığı alan salonda fildişi bouclé kanepe, ceviz sehpa ve bronz lambader" fill sizes="100vw" priority />
        <div className="shop-hero__shade" aria-hidden="true" />
        <div className="shop-hero__content">
          <p className="eyebrow">NUVESSA / EVİN TÜM İHTİYAÇLARI</p>
          <h1 id="shop-hero-title">Yaşadığınız her oda için, <em>tek seçki.</em></h1>
          <p>Mobilyadan beyaz eşyaya, sofradan tekstile, aydınlatmadan günlük ihtiyaçlara — özenle seçilmiş parçalar tek yerde.</p>
          <div className="shop-hero__actions">
            <Link className="button button--solid" href="#urunler">Alışverişe başla</Link>
            <Link className="button button--ghost" href="/rooms">Odaya göre keşfet ↗</Link>
          </div>
        </div>
        <ul className="shop-hero__quick" aria-label="Öne çıkan kategoriler">
          {categories.slice(0, 6).map((category) => (
            <li key={category.slug}><Link href={`/shop?category=${category.slug}#urunler`}>{category.name}</Link></li>
          ))}
        </ul>
      </section>

      <section className="category-tiles" aria-labelledby="category-tiles-title">
        <div className="section-heading"><h2 id="category-tiles-title">Kategoriye göre alışveriş</h2><p>{catalog.length} demo ürün · {categories.length} kategori</p></div>
        <div className="category-tiles__grid">
          {categories.map((category) => (
            <Link key={category.slug} href={`/shop?category=${category.slug}#urunler`} className={`category-tile${category.image ? "" : " category-tile--icon"}`}>
              {category.image ? <Image src={category.image} alt="" fill sizes="(max-width: 700px) 46vw, 24vw" /> : <ProductIcon name={category.icon} className="category-tile__icon" />}
              <span className="category-tile__label"><strong>{category.name}</strong><small>{countFor(category.slug)} ürün ↗</small></span>
            </Link>
          ))}
        </div>
      </section>

      <section id="urunler" className="catalog-section" aria-labelledby="catalog-title">
        <div className="catalog-heading">
          <div>
            <h2 id="catalog-title">{activeCategory ? activeCategory.name : activeWorld ? activeWorld.name : "Tüm ürünler"}</h2>
            <p>{products.length} ürün{hasFilters ? " · filtre uygulandı" : ""} · {sortLabels[sort]}</p>
          </div>
          <p>Ürünler, görseller ve fiyatlar demo amaçlıdır.</p>
        </div>

        <div className="catalog-categories" aria-label="Katalog kategorileri">
          <Link href={hrefFor("")} aria-current={!selectedCategory ? "page" : undefined}>Tümü <small>{catalog.length}</small></Link>
          {categories.map((category) => (
            <Link key={category.slug} href={hrefFor(category.slug)} aria-current={selectedCategory === category.slug ? "page" : undefined}>
              {category.name} <small>{countFor(category.slug)}</small>
            </Link>
          ))}
        </div>

        <form className="catalog-controls" action="/shop">
          <label className="catalog-search">Katalogda ara
            <input name="q" defaultValue={query} placeholder="Örn. kanepe, buzdolabı, havlu, vazo…" />
          </label>
          {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
          {selectedWorld && <input type="hidden" name="world" value={selectedWorld} />}
          <label>Sırala
            <select name="sort" defaultValue={sort}>
              {Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>En düşük fiyat (₺)<input type="number" min="0" name="min" defaultValue={params.min} /></label>
          <label>En yüksek fiyat (₺)<input type="number" min="0" name="max" defaultValue={params.max} /></label>
          <button type="submit">Uygula</button>
        </form>

        {hasFilters && (
          <p className="catalog-active">
            {query && <span>“{query}”</span>}{activeCategory && <span>{activeCategory.name}</span>}{activeWorld && <span>{activeWorld.name}</span>}
            {(params.min || params.max) && <span>{params.min || 0} – {params.max || "∞"} ₺</span>}
            <Link href="/shop#urunler">Filtreleri temizle ✕</Link>
          </p>
        )}

        {products.length ? (
          <div className="catalog-grid">
            {products.map((product, index) => <ProductCard key={product.slug} product={product} priority={index < 2} />)}
          </div>
        ) : (
          <div className="catalog-empty"><span>NUVESSA / ARAMA</span><h3>Bu demo seçkisinde eşleşme yok.</h3><p>Aramanızı kısaltın ya da filtreleri temizleyip tekrar deneyin. Katalog aşamalı olarak genişleyecek.</p><Link href="/shop#urunler">Seçkinin tamamına dön ↗</Link></div>
        )}
      </section>
      <p className="demo-disclosure">Tasarım önizlemesi · Katalog, adlar ve fiyatlar örnektir. Gerçek sipariş veya ödeme alınmaz.</p>
    </main>
  );
}
