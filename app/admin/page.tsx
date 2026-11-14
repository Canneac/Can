import Link from "next/link";
import { formatTryFromKurus } from "@/domain/money";
import { requireAdmin } from "@/lib/admin-auth";
import { readAdminCatalog } from "@/lib/admin-data";
import { listOrders, ORDER_STATUS_LABELS } from "@/lib/orders";

export default async function AdminHome() {
  await requireAdmin();
  const { products, categories } = readAdminCatalog();
  const orders = listOrders();
  const active = products.filter((product) => product.status === "active");
  const lowStock = active.flatMap((product) => product.variants.filter((variant) => variant.stock <= 3).map((variant) => ({ product, variant })));
  const total = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.totalInKurus, 0);
  return (
    <>
      <h1>Özet</h1>
      <p className="admin-note">Tüm siparişler <b>demo</b> siparişidir; gerçek ödeme alınmamıştır.</p>
      <div className="admin-stats">
        <div><b>{active.length}</b><span>Aktif ürün</span></div>
        <div><b>{categories.length}</b><span>Kategori</span></div>
        <div><b>{orders.length}</b><span>Demo sipariş</span></div>
        <div><b>{formatTryFromKurus(total)}</b><span>Demo sipariş tutarı</span></div>
      </div>
      <h2>Düşük stok (3 ve altı)</h2>
      {lowStock.length ? <ul className="admin-list">{lowStock.map(({ product, variant }) => <li key={variant.id}><Link href={`/admin/products/${product.slug}`}>{product.name}</Link> — {variant.label}: <b>{variant.stock}</b></li>)}</ul> : <p>Düşük stoklu ürün yok.</p>}
      <h2>Son siparişler</h2>
      {orders.length ? <ul className="admin-list">{orders.slice(0, 5).map((order) => <li key={order.orderNumber}>{order.orderNumber} — {order.customer.name} — {formatTryFromKurus(order.totalInKurus)} — {ORDER_STATUS_LABELS[order.status]} <span className="admin-badge">DEMO</span></li>)}</ul> : <p>Henüz sipariş yok.</p>}
    </>
  );
}
