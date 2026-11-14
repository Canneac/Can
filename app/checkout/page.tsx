import { CheckoutView } from "@/components/checkout-view";
import { StorefrontHeader } from "@/components/storefront-header";
import { currentMember } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ödeme (demo) | NUVESSA" };

export default async function CheckoutPage() {
  const member = await currentMember();
  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="page-section">
        <p className="eyebrow">NUVESSA / DEMO ÖDEME</p>
        <h1 className="page-title">Siparişi tamamla</h1>
        <CheckoutView member={member ? { name: member.name, email: member.email, phone: member.phone, address: member.address, city: member.city } : null} />
      </section>
    </main>
  );
}
