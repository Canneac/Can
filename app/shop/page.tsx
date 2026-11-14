import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductIcon } from "@/components/product-icon";
import { StorefrontHeader } from "@/components/storefront-header";
import { readSnapshot } from "@/data/catalog-db";
import { designWorlds } from "@/data/catalog";
import { COLOR_HEX } from "@/domain/catalog-types";
import { matchesSearch, searchScore } from "@/domain/search";

type Raw = string | string[] | undefined;
type Params = Record<"q" | "min" | "max" | "category" | "world" | "sort" | "stock" | "brand" | "color" | "material", Raw>;
type Props = { searchParams: Promise<Partial<Params>> };

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Ürünleri keşfet | NUVESSA",
  description: "Mobilyadan beyaz eşyaya, mutfaktan tekstile evin tüm ihtiyaçları için NUVESSA demo kataloğu.",
};

const sortLabels: Record<string, string> = {
  relevance: "İlgililik", featured: "Öne çıkanlar", "price-asc": "Fiyat: artan", "price-desc": "Fiyat: azalan", new: "Yeni gelenler",
};

const first = (value: Raw) => (Array.isArray(value) ? value[0] : value) ?? "";
const list = (value: Raw) => (Array.isArray(value) ? value : value ? [value] : []);
function toKurus(value: string) {
  if (!value) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null;
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = first(params.q).trim();
  const selectedCategory = first(params.category);
  const selectedWorld = first(params.world);
  const brandFilter = list(params.brand);
  const colorFilter = list(params.color);
  const materialFilter = list(params.material);
  const onlyInStock = first(params.stock) === "1";
  const sort = sortLabels[first(params.sort)] ? first(params.sort) : query ? "relevance" : "featured";
  const min = toKurus(first(params.min));
  const max = toKurus(first(params.max));

  const { products: catalog, categories, brands } = readSnapshot();
  const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name;
  const brandName = (slug: string) => brands.find((brand) => brand.slug === slug)?.name;
  const inCategory = (product: (typeof catalog)[number], slug: string) => product.categorySlug === slug || product.categorySlugs?.includes(slug);

  const products = catalog
    .filter((product) => !selectedCategory || inCategory(product, selectedCategory))
    .filter((product) => !selectedWorld || product.worlds.includes(selectedWorld))
    .filter((product) => matchesSearch(query, [product.name, product.material, product.description, product.searchTerms, brandName(product.brand) ?? ""]))
    .filter((product) => !brandFilter.length || brandFilter.includes(product.brand))
    .filter((product) => !colorFilter.length || product.colors.some((color) => colorFilter.includes(color)))
    .filter((product) => !materialFilter.length || product.materials.some((material) => materialFilter.includes(material)))
    .filter((product) => !onlyInStock || product.inStock)
    .filter((product) => (min === null || product.priceInKurus >= min) && (max === null || product.priceInKurus <= max));

  products.sort((a, b) => {
    if (sort === "price-asc") return a.priceInKurus - b.priceInKurus;
    if (sort === "price-desc") return b.priceInKurus - a.priceInKurus;
    if (sort === "new") return b.createdAt.localeCompare(a.createdAt) || a.rank - b.rank;
    if (sort === "relevance" && query) return searchScore(query, b.name, [b.searchTerms, b.material]) - searchScore(query, a.name, [a.searchTerms, a.material]) || a.rank - b.rank;
    return a.rank - b.rank;
  });

  const allColors = [...new Set(catalog.flatMap((product) => product.colors))].sort((a, b) => a.localeCompare(b, "tr"));
  const allMaterials = [...new Set(catalog.flatMap((product) => product.materials))].sort((a, b) => a.localeCompare(b, "tr"));
  const activeCategory = categories.find((category) => category.slug === selectedCategory);
  const activeWorld = designWorlds.find((world) => world.slug === selectedWorld);
  const hasFilters = Boolean(query || selectedCategory || selectedWorld || brandFilter.length || colorFilter.length || materialFilter.length || onlyInStock || min !== null || max !== null);
  const countFor = (slug: string) => catalog.filter((product) => inCategory(product, slug)).length;
  const tiles = categories.slice(0, 8);

  // Kategori bağlantıları arama, sıralama, fiyat ve diğer filtreleri korur.
  const hrefFor = (category: string) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (category) next.set("category", category);
    if (selectedWorld) next.set("world", selectedWorld);
    if (sort !== "featured" && !(sort === "relevance" && query)) next.set("sort", sort);
    brandFilter.forEach((value) => next.append("brand", value));
    colorFilter.forEach((value) => next.append("color", value));
    materialFilter.forEach((value) => next.append("material", value));
    if (onlyInStock) next.set("stock", "1");
    const minValue = first(params.min);
    const maxValue = first(params.max);
    if (minValue) next.set("min", minValue);
    if (maxValue) next.set("max", maxValue);
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
          <h1 id="shop-hero-title">Evinizin her köşesi için, <em>tek seçki.</em></h1>
          <p>Mobilyadan mutfağa, günlük ihtiyaçlardan özel tasarımlara kadar yaşam alanınız için aradığınız her şey.</p>
          <div className="shop-hero__actions">
            <Link className="button button--solid" href="#urunler">Alışverişe başla</Link>
            <Link className="button button--ghost" href="/rooms">Odaya göre keşfet ↗</Link>
          </div>
        </div>
        <ul className="shop-hero__quick" aria-label="Öne çıkan kategoriler">
          {categories.slice(0, 7).map((category) => (
            <li key={category.slug}><Link href={`/shop?category=${category.slug}#urunler`}>{category.name}</Link></li>
          ))}
        </ul>
      </section>

      <section className="category-tiles" aria-labelledby="category-tiles-title">
        <div className="section-heading"><h2 id="category-tiles-title">Kategoriye göre alışveriş</h2><p>{catalog.length} demo ürün · {categories.length} kategori</p></div>
        <div className="category-tiles__grid">
          {tiles.map((category) => (
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
            <h2 id="catalog-title">{activeCategory ? activeCategory.name : activeWorld ? activeWorld.name : query ? `“${query}” için sonuçlar` : "Tüm ürünler"}</h2>
            <p>{products.length} ürün{hasFilters ? " · filtre uygulandı" : ""} · {sortLabels[sort]}</p>
          </div>
          <p>Ürünler, görseller, stok ve fiyatlar demo amaçlıdır.</p>
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
            <input name="q" defaultValue={query} placeholder="Örn. kanepe, buzdolabı, çöp kovası…" />
          </label>
          {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
          {selectedWorld && <input type="hidden" name="world" value={selectedWorld} />}
          <label>Sırala
            <select name="sort" defaultValue={sort}>
              {Object.entries(sortLabels).filter(([value]) => value !== "relevance" || query).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>En düşük fiyat (₺)<input type="number" min="0" name="min" defaultValue={first(params.min)} /></label>
          <label>En yüksek fiyat (₺)<input type="number" min="0" name="max" defaultValue={first(params.max)} /></label>
          <button type="submit">Uygula</button>

          <details className="catalog-filters" open={Boolean(brandFilter.length || colorFilter.length || materialFilter.length || onlyInStock)}>
            <summary>Marka, renk, malzeme ve stok filtreleri</summary>
            <div className="catalog-filters__groups">
              <fieldset><legend>Marka</legend>
                {brands.filter((brand) => catalog.some((product) => product.brand === brand.slug)).map((brand) => (
                  <label key={brand.slug}><input type="checkbox" name="brand" value={brand.slug} defaultChecked={brandFilter.includes(brand.slug)} />{brand.name}</label>
                ))}
              </fieldset>
              <fieldset><legend>Renk</legend>
                {allColors.map((color) => (
                  <label key={color}><input type="checkbox" name="color" value={color} defaultChecked={colorFilter.includes(color)} /><i style={{ background: COLOR_HEX[color] ?? "#ccc" }} aria-hidden="true" />{color}</label>
                ))}
              </fieldset>
              <fieldset><legend>Malzeme</legend>
                {allMaterials.map((material) => (
                  <label key={material}><input type="checkbox" name="material" value={material} defaultChecked={materialFilter.includes(material)} />{material}</label>
                ))}
              </fieldset>
              <fieldset><legend>Stok</legend>
                <label><input type="checkbox" name="stock" value="1" defaultChecked={onlyInStock} />Yalnızca stokta olanlar</label>
              </fieldset>
            </div>
          </details>
        </form>

        {hasFilters && (
          <p className="catalog-active">
            {query && <span>“{query}”</span>}{activeCategory && <span>{activeCategory.name}</span>}{activeWorld && <span>{activeWorld.name}</span>}
            {brandFilter.map((slug) => <span key={slug}>{brandName(slug) ?? slug}</span>)}
            {colorFilter.map((color) => <span key={color}>{color}</span>)}
            {materialFilter.map((material) => <span key={material}>{material}</span>)}
            {onlyInStock && <span>Stokta</span>}
            {(min !== null || max !== null) && <span>{first(params.min) || 0} – {first(params.max) || "∞"} ₺</span>}
            <Link href="/shop#urunler">Filtreleri temizle ✕</Link>
          </p>
        )}

        {products.length ? (
          <div className="catalog-grid">
            {products.map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index < 2} brandName={brandName(product.brand)} categoryName={categoryName(product.categorySlug)} world={selectedWorld || undefined} />
            ))}
          </div>
        ) : (
          <div className="catalog-empty"><span>NUVESSA / ARAMA</span><h3>Bu demo seçkisinde eşleşme yok.</h3><p>Aramanızı kısaltın ya da filtreleri temizleyip tekrar deneyin. Katalog aşamalı olarak genişleyecek.</p><Link href="/shop#urunler">Seçkinin tamamına dön ↗</Link></div>
        )}
      </section>
      <p className="demo-disclosure">Tasarım önizlemesi · Katalog, adlar, stok ve fiyatlar örnektir. Gerçek sipariş veya ödeme alınmaz.</p>
    </main>
  );
}
