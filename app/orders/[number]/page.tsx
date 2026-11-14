import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontHeader } from "@/components/storefront-header";
import { designWorlds } from "@/data/catalog";
import { formatTryFromKurus } from "@/domain/money";
import { getOrder, ORDER_STATUS_LABELS } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sipariş onayı (demo) | NUVESSA", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const order = getOrder(number);
  if (!order) notFound();
  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="page-section order-confirmation">
        <p className="eyebrow">NUVESSA / SİPARİŞ ALINDI</p>
        <h1 className="page-title">Teşekkürler, siparişiniz oluşturuldu.</h1>
        <p className="demo-banner" role="note"><b>DEMO SİPARİŞ.</b> Gerçek para çekilmedi ve ürün gönderilmeyecek.</p>
        <p className="order-number">Sipariş numaranız: <strong data-testid="order-number">{order.orderNumber}</strong></p>
        <p>Durum: <b>{ORDER_STATUS_LABELS[order.status]}</b></p>
        <ul className="order-items">
          {order.items.map((item, index) => (
            <li key={`${item.variantId}-${index}`}>
              <span>{item.name} <small>{item.variantLabel}{item.sourceWorld ? ` · ${designWorlds.find((w) => w.slug === item.sourceWorld)?.name}` : ""}</small></span>
              <span>{item.quantity} × {formatTryFromKurus(item.unitPriceInKurus)}</span>
            </li>
          ))}
        </ul>
        <p className="order-total">Toplam: <strong>{formatTryFromKurus(order.totalInKurus)}</strong> <small>(kargo {order.shippingInKurus === 0 ? "ücretsiz" : formatTryFromKurus(order.shippingInKurus)})</small></p>
        <Link className="button button--dark" href="/shop">Alışverişe devam et</Link>
      </section>
    </main>
  );
}
