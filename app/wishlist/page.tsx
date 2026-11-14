import { StorefrontHeader } from "@/components/storefront-header";
import { WishlistView } from "@/components/wishlist-view";
import { readSnapshot } from "@/data/catalog-db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Favorilerim | NUVESSA" };

export default function WishlistPage() {
  const { products } = readSnapshot();
  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="page-section">
        <p className="eyebrow">NUVESSA / FAVORİLER</p>
        <h1 className="page-title">Favorilerim</h1>
        <WishlistView products={products} />
      </section>
    </main>
  );
}
