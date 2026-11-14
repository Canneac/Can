import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { readSnapshot } from "@/data/catalog-db";
import { designWorlds } from "@/data/catalog";
import { activeDepartments, allDepartments, getDepartment, inDepartment } from "@/data/departments";
import { COLOR_HEX } from "@/domain/catalog-types";
import { matchesSearch, searchScore } from "@/domain/search";

type Raw = string | string[] | undefined;
type Params = Record<"q" | "min" | "max" | "dept" | "category" | "world" | "sort" | "stock" | "color", Raw>;

export const dynamic = "force-dynamic";
export const metadata = { title: "Alışveriş | NUVESSA", description: "Mutfaktan mobilyaya, tekstilden aydınlatmaya evin tüm ihtiyaçları." };

const sortLabels: Record<string, string> = { relevance: "İlgililik", featured: "Öne çıkanlar", new: "Yeni gelenler", "price-asc": "Fiyat: artan", "price-desc": "Fiyat: azalan" };
const first = (value: Raw) => (Array.isArray(value) ? value[0] : value) ?? "";
const list = (value: Raw) => (Array.isArray(value) ? value : value ? [value] : []);
function toKurus(value: string) {
  if (!value) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Partial<Params>> }) {
  const params = await searchParams;
  const query = first(params.q).trim();
  const subCategory = first(params.category);
  // Eski bağlantılar (?category=mobilya) ilgili departmana yönlendirilmeden de çalışır.
  const world = designWorlds.find((entry) => entry.slug === first(params.world));
  const colors = list(params.color);
  const onlyInStock = first(params.stock) === "1";
  const sort = sortLabels[first(params.sort)] ? first(params.sort) : query ? "relevance" : "featured";
  const min = toKurus(first(params.min));
  const max = toKurus(first(params.max));

  const { products: catalog, categories } = readSnapshot();
  const categorySlugs = categories.map((category) => category.slug);
  const department = getDepartment(first(params.dept), categorySlugs) ?? (subCategory ? allDepartments(categorySlugs).find((d) => d.categories.includes(subCategory)) : undefined);
  const subCategories = department ? categories.filter((category) => department.categories.includes(category.slug) && catalog.some((p) => p.categorySlug === category.slug || p.categorySlugs?.includes(category.slug))) : [];

  const products = catalog
    .filter((product) => !department || inDepartment(product, department))
    .filter((product) => !subCategory || product.categorySlug === subCategory || product.categorySlugs?.includes(subCategory))
    .filter((product) => !world || product.worlds.includes(world.slug))
    .filter((product) => matchesSearch(query, [product.name, product.material, product.description, product.searchTerms]))
    .filter((product) => !colors.length || product.colors.some((color) => colors.includes(color)))
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
  const hasFilters = Boolean(query || subCategory || world || colors.length || onlyInStock || min !== null || max !== null);
  const tabs = activeDepartments(catalog, categorySlugs);

  const hrefFor = (override: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const base: Record<string, string | undefined> = { q: query, dept: department?.slug, category: subCategory, world: world?.slug, sort: first(params.sort), min: first(params.min), max: first(params.max), stock: onlyInStock ? "1" : "", ...override };
    for (const [key, value] of Object.entries(base)) if (value) next.set(key, value);
    colors.forEach((color) => next.append("color", color));
    const text = next.toString();
    return `/shop${text ? `?${text}` : ""}`;
  };
  const title = query ? `“${query}”` : subCategory ? categories.find((c) => c.slug === subCategory)?.name ?? department?.name ?? "Tümü" : department?.name ?? (world ? world.name : "Tümü");

  return (
    <main>
      <StorefrontHeader />
      <section className="zshop" aria-labelledby="shop-title">
        <div className="zshop__title"><h1 id="shop-title">{title}</h1><span>{products.length} ürün</span></div>

        <nav className="ztabs" aria-label="Departmanlar">
          <Link href="/shop" aria-current={!department && !query ? "page" : undefined}>Tümü</Link>
          {tabs.map((tab) => <Link key={tab.slug} href={`/shop?dept=${tab.slug}`} aria-current={department?.slug === tab.slug ? "page" : undefined}>{tab.name}</Link>)}
        </nav>
        {subCategories.length > 1 && (
          <nav className="zsub" aria-label="Alt kategoriler">
            <Link href={hrefFor({ category: undefined })} aria-current={!subCategory ? "page" : undefined}>Hepsi</Link>
            {subCategories.map((category) => <Link key={category.slug} href={hrefFor({ category: category.slug })} aria-current={subCategory === category.slug ? "page" : undefined}>{category.name}</Link>)}
          </nav>
        )}

        <div className="ztools">
          <form action="/shop" className="ztools__form">
            {query && <input type="hidden" name="q" value={query} />}
            {department && <input type="hidden" name="dept" value={department.slug} />}
            {subCategory && <input type="hidden" name="category" value={subCategory} />}
            {world && <input type="hidden" name="world" value={world.slug} />}
            <details className="zfilter" open={Boolean(colors.length || onlyInStock || min !== null || max !== null)}>
              <summary>Filtrele</summary>
              <div className="zfilter__panel">
                <div className="row">
                  <label>En düşük ₺<input type="number" min="0" name="min" defaultValue={first(params.min)} /></label>
                  <label>En yüksek ₺<input type="number" min="0" name="max" defaultValue={first(params.max)} /></label>
                </div>
                <fieldset><legend>Renk</legend>{allColors.map((color) => <label key={color}><input type="checkbox" name="color" value={color} defaultChecked={colors.includes(color)} /><i style={{ background: COLOR_HEX[color] ?? "#ccc" }} aria-hidden="true" />{color}</label>)}</fieldset>
                <label><span><input type="checkbox" name="stock" value="1" defaultChecked={onlyInStock} /> Yalnızca stokta olanlar</span></label>
                <button type="submit" className="zbtn zbtn--dark">Uygula</button>
              </div>
            </details>
            <label className="visually-hidden" htmlFor="sort">Sırala</label>
            <select id="sort" name="sort" defaultValue={sort}>
              {Object.entries(sortLabels).filter(([value]) => value !== "relevance" || query).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button type="submit" className="zbtn zbtn--dark">Sırala</button>
          </form>
        </div>

        {hasFilters && (
          <p className="zactive">
            {query && <span>“{query}”</span>}{world && <span>{world.name}</span>}{colors.map((color) => <span key={color}>{color}</span>)}
            {onlyInStock && <span>Stokta</span>}{(min !== null || max !== null) && <span>{first(params.min) || 0} – {first(params.max) || "∞"} ₺</span>}
            <Link href={department ? `/shop?dept=${department.slug}` : "/shop"}>Temizle ✕</Link>
          </p>
        )}

        {products.length ? (
          <div className="pgrid" id="urunler">{products.map((product, index) => <ProductCard key={product.slug} product={product} priority={index < 4} world={world?.slug} />)}</div>
        ) : (
          <div className="zempty"><h2>Eşleşme bulunamadı</h2><p>Aramanızı kısaltın ya da filtreleri temizleyin.</p><Link href="/shop">Tüm ürünlere dön</Link></div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
