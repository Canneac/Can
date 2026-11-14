import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SceneBlock } from "@/components/scene-block";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { readSnapshot } from "@/data/catalog-db";
import { scenes } from "@/data/scenes";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { rooms, products, categories, brands } = readSnapshot();
  const room = rooms.find((entry) => entry.slug === slug);
  if (!room) notFound();
  const inRoom = products.filter((product) => product.rooms.includes(slug));
  const roomScenes = scenes.filter((scene) => scene.room === slug);
  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="page-section">
        <nav className="product-breadcrumb" aria-label="İçerik yolu"><Link href="/rooms">Odalara göre</Link><span>/</span><span>{room.name}</span></nav>
        <h1 className="page-title">{room.name}</h1>
        <p className="room-scenes__note">{inRoom.length} ürün · Tasarım dünyalarından bağımsız, odanıza göre seçki.</p>
        {roomScenes.length > 0 && <div className="room-scenes__list">{roomScenes.map((scene) => <figure key={scene.slug}><SceneBlock scene={scene} /><figcaption>{scene.title}</figcaption></figure>)}</div>}
        {inRoom.length ? (
          <div className="catalog-grid room-products">
            {inRoom.map((product) => <ProductCard key={product.slug} product={product} brandName={brands.find((b) => b.slug === product.brand)?.name} categoryName={categories.find((c) => c.slug === product.categorySlug)?.name} />)}
          </div>
        ) : <p>Bu odada henüz ürün yok.</p>}
      </section>
      <SiteFooter />
    </main>
  );
}
