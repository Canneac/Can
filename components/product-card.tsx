import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductVisual } from "@/components/product-visual";
import { designWorlds, type Product } from "@/data/catalog";
import { formatTryFromKurus } from "@/domain/money";

type Props = {
  product: Product;
  categoryName?: string;
  brandName?: string;
  priority?: boolean;
  /** Dünya sayfasından geliyorsa ürün bağlantısı ve sepet bu dünyayı taşır. */
  world?: string;
};

export function stockLabel(product: Pick<Product, "stock" | "inStock">) {
  if (!product.inStock) return { text: "Tükendi", tone: "out" as const };
  if (product.stock <= 5) return { text: `Son ${product.stock} adet`, tone: "low" as const };
  return { text: "Stokta", tone: "in" as const };
}

export function ProductCard({ product, categoryName, brandName, priority, world }: Props) {
  const href = `/products/${product.slug}${world ? `?world=${world}` : ""}`;
  const stock = stockLabel(product);
  const single = product.variants.length === 1 ? product.variants[0] : null;
  const multiple = product.variants.length > 1;
  return (
    <article className={`catalog-card catalog-card--${product.tone}`}>
      <div className="catalog-card__media">
        <Link href={href} className="catalog-card__image" aria-label={`${product.name} detayları`}>
          <ProductVisual product={product} sizes="(max-width: 700px) 46vw, (max-width: 1100px) 30vw, 23vw" priority={priority} />
          {categoryName && <span className="catalog-card__tag">{categoryName}</span>}
        </Link>
        <FavoriteButton slug={product.slug} name={product.name} />
      </div>
      <div className="catalog-card__details">
        <div>
          <p>{brandName ?? "NUVESSA"} · {product.material}</p>
          <h3><Link href={href}>{product.name}</Link></h3>
        </div>
        <strong>{multiple ? <small>’den</small> : null}{formatTryFromKurus(product.priceInKurus)}</strong>
      </div>
      <p className={`catalog-card__stock catalog-card__stock--${stock.tone}`}>{stock.text}</p>
      <div className="catalog-card__actions">
        {single && product.inStock ? (
          <AddToCartButton productSlug={product.slug} variantId={single.id} sourceWorld={world ?? null} />
        ) : (
          <Link className="add-to-cart__button add-to-cart__button--ghost" href={href}>{product.inStock ? "Seçenekleri gör" : "Ürünü incele"}</Link>
        )}
      </div>
      <div className="catalog-card__worlds">
        {product.worlds.map((slug) => (
          <Link key={slug} href={`/worlds/${slug}`}>{designWorlds.find((entry) => entry.slug === slug)?.name}</Link>
        ))}
      </div>
    </article>
  );
}
