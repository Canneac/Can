import Image from "next/image";
import { ProductIcon } from "@/components/product-icon";
import type { Product } from "@/domain/catalog-types";

type Props = {
  product: Pick<Product, "image" | "imageAlt" | "icon" | "tone" | "number">;
  sizes: string;
  priority?: boolean;
};

/** Fotoğrafı olan ürünlerde görseli, olmayanlarda tonlu çizgi-ikon panelini gösterir. */
export function ProductVisual({ product, sizes, priority }: Props) {
  if (product.image) return <Image src={product.image} alt={product.imageAlt} fill sizes={sizes} priority={priority} />;
  return (
    <div className={`product-visual product-visual--${product.tone}`} role="img" aria-label={product.imageAlt}>
      <ProductIcon name={product.icon} className="product-visual__icon" />
      <span>{product.number} · Demo görsel</span>
    </div>
  );
}
