import { readCatalog } from "@/data/catalog-db";
import { notFound } from "next/navigation";
import { ProductVisual } from "@/components/product-visual";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront-header";
import { designWorlds } from "@/data/catalog";
import { formatTryFromKurus } from "@/domain/money";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = readCatalog().find((entry) => entry.slug === slug);
  if (!product) notFound();
  return <main className="store-page"><StorefrontHeader /><nav className="product-breadcrumb" aria-label="İçerik yolu"><Link href="/">Ana sayfa</Link><span>/</span><Link href="/shop">Seçki</Link><span>/</span><span>{product.name}</span></nav>
    <article className="product-detail"><div className={`product-detail__image product-detail__image--${product.tone}`}><ProductVisual product={product} sizes="(max-width: 700px) 100vw, 55vw" priority /></div><div className="product-detail__copy"><p className="eyebrow">NUVESSA / TASARIM ÖNİZLEMESİ</p><h1>{product.name}</h1><p className="product-detail__material">{product.material}</p><strong className="product-detail__price">{formatTryFromKurus(product.priceInKurus)}</strong><p className="product-detail__description">{product.description}</p><p className="demo-disclosure">Örnek ürün kaydı · Stok doğrulanmamış · Sipariş alınmaz.</p><div className="product-detail__worlds"><span>İlgili tasarım dünyaları</span>{product.worlds.map((worldSlug) => { const world = designWorlds.find((entry) => entry.slug === worldSlug); return world ? <Link key={worldSlug} href={`/worlds/${worldSlug}`}>{world.name} ↗</Link> : null; })}</div><Link className="product-detail__return" href="/shop">Seçkiye dön ↗</Link></div></article>
  </main>;
}

