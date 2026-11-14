import { CheckoutView } from "@/components/checkout-view";
import { StorefrontHeader } from "@/components/storefront-header";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ödeme (demo) | NUVESSA" };

export default function CheckoutPage() {
  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="page-section">
        <p className="eyebrow">NUVESSA / DEMO ÖDEME</p>
        <h1 className="page-title">Siparişi tamamla</h1>
        <CheckoutView />
      </section>
    </main>
  );
}
