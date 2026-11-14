"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductIcon } from "@/components/product-icon";
import { designWorlds } from "@/data/catalog";
import { formatTryFromKurus } from "@/domain/money";
import { FREE_SHIPPING_THRESHOLD_KURUS, type QuoteLine } from "@/domain/cart";
import { removeLine, setLineQuantity } from "@/lib/cart-store";
import { useQuote } from "@/lib/use-quote";

const worldClass: Record<string, string> = Object.fromEntries(designWorlds.map((world) => [world.slug, world.className]));
const worldName: Record<string, string> = Object.fromEntries(designWorlds.map((world) => [world.slug, world.name]));

export function CartLineCard({ line, editable = true }: { line: QuoteLine; editable?: boolean }) {
  const theme = line.sourceWorld ? worldClass[line.sourceWorld] : "neutral";
  return (
    <li className={`cart-line cart-line--${theme}`} data-world={line.sourceWorld ?? "shop"}>
      <Link className="cart-line__image" href={`/products/${line.productSlug}`} aria-label={`${line.name} ürün sayfası`}>
        {line.image ? <Image src={line.image} alt="" fill sizes="96px" /> : <ProductIcon name={line.icon} className="cart-line__icon" />}
      </Link>
      <div className="cart-line__body">
        <p className="cart-line__world">{line.sourceWorld ? `${worldName[line.sourceWorld]} dünyasından` : "NUVESSA seçkisi"}</p>
        <h3><Link href={`/products/${line.productSlug}`}>{line.name}</Link></h3>
        <p className="cart-line__variant">{line.variantLabel} · {formatTryFromKurus(line.unitPriceInKurus)}</p>
        {line.note === "quantity_reduced" && <p className="cart-line__note">Stok yetersiz olduğu için adet {line.quantity}’e düşürüldü.</p>}
        {editable ? (
          <div className="cart-line__controls">
            <div className="quantity" role="group" aria-label={`${line.name} adedi`}>
              <button type="button" aria-label="Adedi azalt" onClick={() => setLineQuantity(line.key, line.quantity - 1)}>−</button>
              <output>{line.quantity}</output>
              <button type="button" aria-label="Adedi artır" disabled={line.quantity >= line.available} onClick={() => setLineQuantity(line.key, line.quantity + 1)}>+</button>
            </div>
            <button type="button" className="cart-line__remove" onClick={() => removeLine(line.key)}>Kaldır</button>
          </div>
        ) : <p className="cart-line__variant">Adet: {line.quantity}</p>}
      </div>
      <strong className="cart-line__total">{formatTryFromKurus(line.lineTotalInKurus)}</strong>
    </li>
  );
}

export function CartSummary({ subtotal, shipping, discount, total }: { subtotal: number; shipping: number; discount: number; total: number }) {
  return (
    <dl className="cart-summary__rows">
      <div><dt>Ara toplam</dt><dd>{formatTryFromKurus(subtotal)}</dd></div>
      <div><dt>Kargo</dt><dd>{shipping === 0 ? "Ücretsiz" : formatTryFromKurus(shipping)}</dd></div>
      <div><dt>İndirim</dt><dd>{discount === 0 ? "—" : `−${formatTryFromKurus(discount)}`}</dd></div>
      <div className="cart-summary__total"><dt>Genel toplam</dt><dd>{formatTryFromKurus(total)}</dd></div>
    </dl>
  );
}

export function CartView() {
  const { lines, quote, error, notice, loading } = useQuote();

  if (lines.length === 0) {
    return (
      <div className="cart-empty">
        <ProductIcon name="box" className="cart-empty__icon" />
        <h2>Sepetiniz boş</h2>
        <p>Beğendiğiniz ürünleri sepete ekleyin; hangi tasarım dünyasından eklediğinizi sepetiniz hatırlayacak.</p>
        <Link className="button button--dark" href="/shop">Alışverişe başla</Link>
      </div>
    );
  }
  if (error) return <p className="cart-error" role="alert">Sepet bilgileri şu an alınamadı. Lütfen sayfayı yenileyin.</p>;
  if (loading || !quote) return <p className="cart-loading" role="status">Sepetiniz hesaplanıyor…</p>;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_KURUS - quote.subtotalInKurus);
  return (
    <div className="cart-layout">
      <div>
        {notice && <p className="cart-notice" role="status">{notice}</p>}
        <ul className="cart-lines">{quote.lines.map((line) => <CartLineCard key={line.key} line={line} />)}</ul>
        <Link className="cart-continue" href="/shop">← Alışverişe devam et</Link>
      </div>
      <aside className="cart-summary" aria-label="Sipariş özeti">
        <h2>Sipariş özeti</h2>
        <CartSummary subtotal={quote.subtotalInKurus} shipping={quote.shippingInKurus} discount={quote.discountInKurus} total={quote.totalInKurus} />
        {remaining > 0 && <p className="cart-summary__hint">{formatTryFromKurus(remaining)} daha ekleyin, kargo ücretsiz olsun.</p>}
        <Link className="button button--dark button--block" href="/checkout">Ödemeye geç</Link>
        <p className="cart-summary__demo">DEMO · Gerçek ödeme alınmaz, para çekilmez.</p>
      </aside>
    </div>
  );
}
