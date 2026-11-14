import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductVisual } from "@/components/product-visual";
import { QuickAdd } from "@/components/quick-add";
import type { Product } from "@/domain/catalog-types";
import { formatTryFromKurus } from "@/domain/money";

type Props = {
  product: Product;
  priority?: boolean;
  /** Koleksiyon (tasarım dünyası) sayfasından geliyorsa bağlantı ve sepet bu dünyayı taşır. */
  world?: string;
};

/** Sade ürün kartı: görsel, ad, fiyat. Hızlı ekleme (+) ve favori kalbi görselin üstünde. */
export function ProductCard({ product, priority, world }: Props) {
  const href = `/products/${product.slug}${world ? `?world=${world}` : ""}`;
  const single = product.variants.length === 1 ? product.variants[0] : null;
  return (
    <article className="pcard">
      <div className="pcard__media">
        <Link href={href} className="pcard__img" aria-label={`${product.name} detayları`}>
          <ProductVisual product={product} sizes="(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 25vw" priority={priority} />
        </Link>
        {!product.inStock && <span className="pcard__badge">Tükendi</span>}
        <FavoriteButton slug={product.slug} name={product.name} className="pcard__fav" />
        {product.inStock && (single
          ? <QuickAdd productSlug={product.slug} variantId={single.id} sourceWorld={world ?? null} name={product.name} />
          : <Link className="pcard__add" href={href} aria-label={`${product.name} için seçenekleri gör`}>+</Link>)}
      </div>
      <div className="pcard__info">
        <Link className="pcard__name" href={href}>{product.name}</Link>
        <span className="pcard__price">{formatTryFromKurus(product.priceInKurus)}{product.variants.length > 1 && <small>’den</small>}</span>
      </div>
    </article>
  );
}

export function stockLabel(product: Pick<Product, "stock" | "inStock">) {
  if (!product.inStock) return { text: "Tükendi", tone: "out" as const };
  if (product.stock <= 5) return { text: `Son ${product.stock} adet`, tone: "low" as const };
  return { text: "Stokta", tone: "in" as const };
}
