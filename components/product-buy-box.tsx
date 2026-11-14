"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { COLOR_HEX, type Variant } from "@/domain/catalog-types";
import { formatTryFromKurus } from "@/domain/money";

type Props = {
  productSlug: string;
  productName: string;
  variants: Variant[];
  sourceWorld: string | null;
  sourceWorldName: string | null;
};

export function ProductBuyBox({ productSlug, productName, variants, sourceWorld, sourceWorldName }: Props) {
  const firstAvailable = variants.find((variant) => variant.stock > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(firstAvailable.id);
  const [quantity, setQuantity] = useState(1);
  const variant = variants.find((entry) => entry.id === variantId) ?? firstAvailable;
  const maxQuantity = Math.max(1, Math.min(20, variant.stock));
  const inStock = variant.stock > 0;
  const stockText = !inStock ? "Tükendi" : variant.stock <= 5 ? `Son ${variant.stock} adet` : "Stokta";

  return (
    <div className="buy-box">
      <strong className="buy-box__price">{formatTryFromKurus(variant.priceInKurus)}</strong>
      <p className={`buy-box__stock buy-box__stock--${!inStock ? "out" : variant.stock <= 5 ? "low" : "in"}`}>{stockText}<span> · demo stok bilgisi</span></p>

      {variants.length > 1 && (
        <fieldset className="buy-box__variants">
          <legend>Seçenek: <b>{variant.label}</b></legend>
          <div>
            {variants.map((entry) => (
              <label key={entry.id} className={`variant-option${entry.id === variantId ? " is-selected" : ""}${entry.stock <= 0 ? " is-out" : ""}`}>
                <input
                  type="radio" name="variant" value={entry.id} checked={entry.id === variantId}
                  onChange={() => { setVariantId(entry.id); setQuantity(1); }}
                />
                {entry.color && <i style={{ background: COLOR_HEX[entry.color] ?? "#ccc" }} aria-hidden="true" />}
                <span>{entry.label}{entry.stock <= 0 ? " (tükendi)" : ""}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="buy-box__row">
        <div className="quantity" role="group" aria-label="Adet">
          <button type="button" aria-label="Adedi azalt" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={!inStock || quantity <= 1}>−</button>
          <output aria-live="polite">{inStock ? quantity : 0}</output>
          <button type="button" aria-label="Adedi artır" onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))} disabled={!inStock || quantity >= maxQuantity}>+</button>
        </div>
        <AddToCartButton productSlug={productSlug} variantId={variant.id} sourceWorld={sourceWorld} quantity={quantity} disabled={!inStock} className="buy-box__add" />
        <FavoriteButton slug={productSlug} name={productName} className="favorite-button--inline" />
      </div>
      {sourceWorldName && <p className="buy-box__world">Bu ürün <b>{sourceWorldName}</b> dünyasından sepete eklenecek; sepette bu dünyanın rengini taşır.</p>}
    </div>
  );
}
