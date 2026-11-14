import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductBuyBox } from "@/components/product-buy-box";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { StorefrontHeader } from "@/components/storefront-header";
import { readSnapshot } from "@/data/catalog-db";
import { designWorlds, getWorld } from "@/data/catalog";
import { formatTryFromKurus } from "@/domain/money";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ world?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = readSnapshot().products.find((entry) => entry.slug === slug);
  if (!product) return { title: "Ürün bulunamadı | NUVESSA" };
  return { title: `${product.name} | NUVESSA`, description: product.description, alternates: { canonical: `/products/${product.slug}` } };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { world } = await searchParams;
  const { products, categories, brands } = readSnapshot();
  const product = products.find((entry) => entry.slug === slug);
  if (!product) notFound();

  const sourceWorld = world && product.worlds.includes(world) ? world : null;
  const category = categories.find((entry) => entry.slug === product.categorySlug);
  const brand = brands.find((entry) => entry.slug === product.brand);
  const related = products
    .filter((entry) => entry.slug !== product.slug && (entry.categorySlug === product.categorySlug || entry.worlds.some((w) => product.worlds.includes(w))))
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description,
    brand: { "@type": "Brand", name: brand?.name ?? "NUVESSA" },
    offers: { "@type": "Offer", priceCurrency: "TRY", price: (product.priceInKurus / 100).toFixed(2), availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <main className="store-page">
      <StorefrontHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="product-breadcrumb" aria-label="İçerik yolu">
        <Link href="/">Ana sayfa</Link><span>/</span><Link href="/shop">Ürünler</Link>
        {category && <><span>/</span><Link href={`/shop?category=${category.slug}`}>{category.name}</Link></>}
        <span>/</span><span>{product.name}</span>
      </nav>
      <article className="product-detail">
        <div className={`product-detail__image product-detail__image--${product.tone}`}>
          <ProductVisual product={product} sizes="(max-width: 700px) 100vw, 55vw" priority />
        </div>
        <div className="product-detail__copy">
          <p className="eyebrow">{brand?.name ?? "NUVESSA"} · {product.number}</p>
          <h1>{product.name}</h1>
          <p className="product-detail__material">{product.material}</p>
          <p className="product-detail__description">{product.description}</p>
          <ProductBuyBox
            productSlug={product.slug} productName={product.name} variants={product.variants}
            sourceWorld={sourceWorld} sourceWorldName={sourceWorld ? getWorld(sourceWorld)?.name ?? null : null}
          />
          <p className="demo-disclosure">DEMO ürün kaydı · Gerçek stok, sipariş veya ödeme yoktur. Fiyat: {formatTryFromKurus(product.priceInKurus)}’den başlar.</p>
          <div className="product-detail__worlds">
            <span>İlgili tasarım dünyaları</span>
            {product.worlds.map((worldSlug) => {
              const entry = designWorlds.find((item) => item.slug === worldSlug);
              return entry ? <Link key={worldSlug} href={`/worlds/${worldSlug}`}>{entry.name} ↗</Link> : null;
            })}
          </div>
        </div>
      </article>

      <section className="product-info" aria-label="Ürün bilgileri">
        <div>
          <h2>Teknik özellikler</h2>
          <dl className="spec-list">
            {product.specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
        <div>
          <h2>Teslimat ve iade</h2>
          <ul className="info-list">
            <li>Kargo: 1.500 ₺ ve üzeri siparişlerde ücretsiz, altında 49,90 ₺ (demo kuralı).</li>
            <li>İade ve teslimat koşulları gerçek satış öncesinde hukuki metinlerle netleştirilecektir.</li>
            <li>Bu sitede gerçek sipariş alınmaz; tüm akış tasarım demosudur.</li>
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="catalog-section product-related" aria-labelledby="related-title">
          <div className="catalog-heading"><div><h2 id="related-title">İlginizi çekebilir</h2></div></div>
          <div className="catalog-grid">
            {related.map((entry) => (
              <ProductCard key={entry.slug} product={entry} brandName={brands.find((b) => b.slug === entry.brand)?.name} categoryName={categories.find((c) => c.slug === entry.categorySlug)?.name} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
