import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { WorldLink } from "@/components/world-link";
import { designWorlds } from "@/data/catalog";
import { WORLD_CONTENT } from "@/data/worlds-content";
import type { Product } from "@/domain/catalog-types";

type Props = { slug: string; name: string; products: Product[] };

/** Koleksiyon (tasarım dünyası) sayfası: büyük görsel + aynı sade ürün ızgarası. Renk atmosferi dünyaya göre değişir. */
export function WorldPageLayout({ slug, name, products }: Props) {
  const content = WORLD_CONTENT[slug];
  const world = designWorlds.find((entry) => entry.slug === slug);
  return (
    <main className={`zw zw--${world?.className ?? "modern"}`}>
      <StorefrontHeader />
      <section className="zw__hero">
        <Image src={content.image} alt={content.imageAlt} fill priority sizes="100vw" />
        <div>
          <h1>{name}</h1>
          <p>{content.intro}</p>
        </div>
      </section>
      <nav className="zw__tabs" aria-label="Koleksiyonlar">
        {designWorlds.map((entry) => (
          <WorldLink key={entry.slug} world={entry.slug} href={`/worlds/${entry.slug}`} className={entry.slug === slug ? "is-current" : undefined}>{entry.name}</WorldLink>
        ))}
        <Link href="/worlds">Tümü</Link>
      </nav>
      <section className="zshop" aria-label={`${name} ürünleri`}>
        <div className="zshop__title"><h2 className="visually-hidden">Ürünler</h2><span>{products.length} ürün</span></div>
        {products.length ? <div className="pgrid" id="urunler">{products.map((product, index) => <ProductCard key={product.slug} product={product} world={slug} priority={index < 4} />)}</div> : <p>Bu koleksiyonda henüz ürün yok.</p>}
      </section>
      <SiteFooter />
    </main>
  );
}
