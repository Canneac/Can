import { CartView } from "@/components/cart-view";
import { StorefrontHeader } from "@/components/storefront-header";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sepetim | NUVESSA" };

export default function CartPage() {
  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="page-section">
        <p className="eyebrow">NUVESSA / SEPET</p>
        <h1 className="page-title">Sepetim</h1>
        <CartView />
      </section>
    </main>
  );
}
