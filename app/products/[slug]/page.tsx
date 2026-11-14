import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductBuyBox } from "@/components/product-buy-box";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { readSnapshot } from "@/data/catalog-db";
import { getWorld } from "@/data/catalog";
import { departments, inDepartment } from "@/data/departments";

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
  const { products, brands } = readSnapshot();
  const product = products.find((entry) => entry.slug === slug);
  if (!product) notFound();

  const sourceWorld = world && product.worlds.includes(world) ? world : null;
  const department = departments.find((entry) => inDepartment(product, entry));
  const brand = brands.find((entry) => entry.slug === product.brand);
  const related = products
    .filter((entry) => entry.slug !== product.slug && department && inDepartment(entry, department))
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description,
    brand: { "@type": "Brand", name: brand?.name ?? "NUVESSA" },
    offers: { "@type": "Offer", priceCurrency: "TRY", price: (product.priceInKurus / 100).toFixed(2), availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <main>
      <StorefrontHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="zp__crumbs" aria-label="İçerik yolu">
        <Link href="/shop">Alışveriş</Link>
        {department && <><span>/</span><Link href={`/shop?dept=${department.slug}`}>{department.name}</Link></>}
      </nav>
      <article className="zp">
        <div className="zp__media"><ProductVisual product={product} sizes="(max-width: 760px) 100vw, 55vw" priority /></div>
        <div className="zp__info">
          <h1>{product.name}</h1>
          <p className="zp__desc">{product.material}</p>
          <ProductBuyBox
            productSlug={product.slug} productName={product.name} variants={product.variants}
            sourceWorld={sourceWorld} sourceWorldName={sourceWorld ? getWorld(sourceWorld)?.name ?? null : null}
          />
          <div className="zp__more">
            <details open><summary>Açıklama</summary><p>{product.description}</p></details>
            <details><summary>Özellikler</summary><dl>{product.specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details>
            <details><summary>Teslimat ve iade</summary><p>1.500 ₺ ve üzeri siparişlerde kargo ücretsiz, altında 49,90 ₺ (demo kuralı). İade ve teslimat koşulları gerçek satıştan önce netleştirilecektir.</p></details>
          </div>
          <p className="zdemo">DEMO ürün · Gerçek stok, sipariş veya ödeme yoktur.</p>
        </div>
      </article>

      {related.length > 0 && (
        <section className="zsec" aria-labelledby="related-title">
          <div className="zsec__head"><h2 id="related-title">Birlikte iyi gider</h2></div>
          <div className="pgrid">{related.map((entry) => <ProductCard key={entry.slug} product={entry} />)}</div>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
