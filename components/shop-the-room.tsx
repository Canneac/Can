"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductIcon } from "@/components/product-icon";
import type { Scene } from "@/data/scenes";
import type { ProductIconName } from "@/domain/catalog-types";
import { formatTryFromKurus } from "@/domain/money";

export type SceneProduct = {
  slug: string; name: string; priceInKurus: number; stock: number; image: string | null; imageAlt: string; icon: ProductIconName;
  singleVariantId: string | null; brandName: string; hasVariants: boolean;
};

export function ShopTheRoom({ scene, products }: { scene: Scene; products: Record<string, SceneProduct> }) {
  const [active, setActive] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setActive(null);
    const onClick = (event: MouseEvent) => {
      if (root.current && !(event.target as HTMLElement).closest("[data-hotspot-ui]")) setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [active]);

  const current = scene.hotspots.find((spot) => spot.id === active);
  const product = current ? products[current.productSlug] : undefined;

  return (
    <div className="room-scene" ref={root} style={{ aspectRatio: `${scene.width} / ${scene.height}` }}>
      <Image src={scene.image} alt={scene.alt} fill sizes="(max-width: 1100px) 100vw, 1100px" className="room-scene__image" />
      {scene.hotspots.map((spot, index) => (
        <button
          key={spot.id} type="button" data-hotspot-ui
          className={`room-scene__dot${active === spot.id ? " is-active" : ""}`}
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          aria-expanded={active === spot.id} aria-label={`${spot.label} ürün bilgisini göster`}
          onClick={() => setActive(active === spot.id ? null : spot.id)}
        >
          <span>{index + 1}</span>
        </button>
      ))}
      {current && product && (
        <div
          className={`room-scene__card ${current.x > 55 ? "room-scene__card--left" : "room-scene__card--right"} ${current.y > 55 ? "room-scene__card--up" : "room-scene__card--down"}`}
          style={{ left: `${current.x}%`, top: `${current.y}%` }} data-hotspot-ui role="dialog" aria-label={product.name}
        >
          <div className="room-scene__thumb">
            {product.image ? <Image src={product.image} alt="" fill sizes="80px" /> : <ProductIcon name={product.icon} className="room-scene__icon" />}
          </div>
          <div className="room-scene__info">
            <small>{product.brandName}</small>
            <strong>{product.name}</strong>
            <span>{product.hasVariants ? "’den " : ""}{formatTryFromKurus(product.priceInKurus)} · {product.stock > 0 ? "Stokta" : "Tükendi"}</span>
            <div className="room-scene__actions">
              <Link href={`/products/${product.slug}`}>Ürüne git →</Link>
              {product.singleVariantId && product.stock > 0 ? (
                <AddToCartButton productSlug={product.slug} variantId={product.singleVariantId} sourceWorld={null} />
              ) : (
                <Link className="add-to-cart__button add-to-cart__button--ghost" href={`/products/${product.slug}`}>{product.stock > 0 ? "Seçenekler" : "İncele"}</Link>
              )}
            </div>
          </div>
          <button type="button" className="room-scene__close" aria-label="Kapat" onClick={() => setActive(null)}>×</button>
        </div>
      )}
    </div>
  );
}
