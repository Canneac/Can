import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction, profileAction } from "@/app/account/actions";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { formatTryFromKurus } from "@/domain/money";
import { listOrdersForUser, ORDER_STATUS_LABELS } from "@/lib/orders";
import { currentMember, readFavorites } from "@/lib/user-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hesabım | NUVESSA", robots: { index: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const member = await currentMember();
  if (!member) redirect("/account/login?next=/account");
  const { saved, error } = await searchParams;
  const orders = listOrdersForUser(member.id);
  const favorites = readFavorites(member.id);
  return (
    <main>
      <StorefrontHeader />
      <section className="page-section account">
        <p className="eyebrow">NUVESSA / HESABIM</p>
        <h1 className="page-title">Merhaba, {member.name.split(" ")[0]}</h1>
        <div className="account__grid">
          <div>
            <h2 className="account__h">Profil ve teslimat adresi</h2>
            <form action={profileAction} className="auth__form">
              <label className="checkout-field"><span>Ad soyad</span><input name="name" defaultValue={member.name} required minLength={2} /></label>
              <label className="checkout-field"><span>E-posta</span><input value={member.email} readOnly aria-readonly="true" /></label>
              <label className="checkout-field"><span>Telefon</span><input name="phone" type="tel" autoComplete="tel" defaultValue={member.phone} /></label>
              <label className="checkout-field"><span>Şehir</span><input name="city" autoComplete="address-level1" defaultValue={member.city} /></label>
              <label className="checkout-field"><span>Açık adres</span><input name="address" autoComplete="street-address" defaultValue={member.address} /></label>
              {saved && <p className="cart-notice" role="status">Bilgileriniz kaydedildi.</p>}
              {error && <p className="cart-error" role="alert">{error}</p>}
              <button type="submit" className="zbtn zbtn--dark auth__submit">Kaydet</button>
            </form>
            <p className="auth__note">Bu bilgiler ödeme sayfasında otomatik doldurulur.</p>
          </div>
          <div>
            <h2 className="account__h">Siparişlerim <small>(demo)</small></h2>
            {orders.length ? (
              <ul className="account__orders">
                {orders.map((order) => (
                  <li key={order.orderNumber}>
                    <Link href={`/orders/${order.orderNumber}`}><b>{order.orderNumber}</b><span>{new Date(order.createdAt).toLocaleDateString("tr-TR")} · {ORDER_STATUS_LABELS[order.status]}</span></Link>
                    <strong>{formatTryFromKurus(order.totalInKurus)}</strong>
                  </li>
                ))}
              </ul>
            ) : <p className="auth__note">Henüz siparişiniz yok. <Link href="/shop">Alışverişe başlayın</Link>.</p>}
            <h2 className="account__h">Favorilerim</h2>
            <p className="auth__note">{favorites.length} ürün hesabınıza kayıtlı. <Link href="/wishlist">Favorilerimi gör</Link></p>
            <form action={logoutAction}><button type="submit" className="zbtn account__logout">Çıkış yap</button></form>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
