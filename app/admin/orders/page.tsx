import { orderStatusAction } from "@/app/admin/actions";
import { designWorlds } from "@/data/catalog";
import { formatTryFromKurus } from "@/domain/money";
import { requireAdmin } from "@/lib/admin-auth";
import { listOrders, ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/lib/orders";

export default async function AdminOrders() {
  await requireAdmin();
  const orders = listOrders();
  return (
    <>
      <h1>Siparişler</h1>
      <p className="admin-note">Bu listedeki tüm siparişler <b>demo</b> siparişidir: gerçek ödeme alınmadı, gerçek gönderim yapılmayacak.</p>
      {!orders.length && <p>Henüz sipariş yok.</p>}
      {orders.map((order) => (
        <article key={order.orderNumber} className="admin-card admin-order">
          <header>
            <h2>{order.orderNumber} {order.isDemo && <span className="admin-badge">DEMO</span>}</h2>
            <span>{new Date(order.createdAt).toLocaleString("tr-TR")}</span>
          </header>
          <p>{order.customer.name} · {order.customer.email} · {order.customer.phone}<br />{order.customer.address}, {order.customer.city}{order.customer.note ? ` — Not: ${order.customer.note}` : ""}</p>
          <ul className="admin-list">
            {order.items.map((item, index) => (
              <li key={index}>{item.quantity} × {item.name} <small>({item.variantLabel})</small> — {formatTryFromKurus(item.unitPriceInKurus)}{item.sourceWorld ? ` · dünya: ${designWorlds.find((w) => w.slug === item.sourceWorld)?.name}` : ""}</li>
            ))}
          </ul>
          <p>Ara toplam {formatTryFromKurus(order.subtotalInKurus)} · Kargo {formatTryFromKurus(order.shippingInKurus)} · <b>Toplam {formatTryFromKurus(order.totalInKurus)}</b></p>
          <form action={orderStatusAction} className="admin-inline">
            <input type="hidden" name="orderNumber" value={order.orderNumber} />
            <select name="status" defaultValue={order.status} aria-label={`${order.orderNumber} durumu`}>{ORDER_STATUSES.map((status) => <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>)}</select>
            <button type="submit">Durumu güncelle</button>
          </form>
        </article>
      ))}
    </>
  );
}
