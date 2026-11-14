import Link from "next/link";
import { ProductVisual } from "@/components/product-visual";
import { designWorlds, getCategory, type CatalogProduct } from "@/data/catalog";
import { formatTryFromKurus } from "@/domain/money";

export function ProductCard({ product, priority }: { product: CatalogProduct; priority?: boolean }) {
  const category = getCategory(product.categorySlug);
  return (
    <article className={`catalog-card catalog-card--${product.tone}`}>
      <Link href={`/products/${product.slug}`} className="catalog-card__image" aria-label={`${product.name} detayları`}>
        <ProductVisual product={product} sizes="(max-width: 700px) 46vw, (max-width: 1100px) 30vw, 23vw" priority={priority} />
        {category && <span className="catalog-card__tag">{category.name}</span>}
        <i aria-hidden="true">↗</i>
      </Link>
      <div className="catalog-card__details">
        <div>
          <p>NUVESSA · {product.material}</p>
          <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
        </div>
        <strong>{formatTryFromKurus(product.priceInKurus)}</strong>
      </div>
      <div className="catalog-card__worlds">
        {product.worlds.map((slug) => (
          <Link key={slug} href={`/worlds/${slug}`}>{designWorlds.find((world) => world.slug === slug)?.name}</Link>
        ))}
      </div>
    </article>
  );
}
