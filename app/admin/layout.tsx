import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Yönetim | NUVESSA", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();
  return (
    <div className="admin">
      <header className="admin__bar">
        <Link href="/admin" className="admin__brand">NUVESSA · Yönetim</Link>
        {authed && (
          <>
            <nav aria-label="Yönetim gezinmesi">
              <Link href="/admin">Özet</Link><Link href="/admin/products">Ürünler</Link><Link href="/admin/categories">Kategoriler</Link>
              <Link href="/admin/brands">Markalar</Link><Link href="/admin/orders">Siparişler</Link><Link href="/" target="_blank">Siteyi aç ↗</Link>
            </nav>
            <form action={logoutAction}><button type="submit">Çıkış</button></form>
          </>
        )}
      </header>
      <div className="admin__body">{children}</div>
    </div>
  );
}
