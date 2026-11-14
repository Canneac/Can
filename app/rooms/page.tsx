import Image from "next/image";
import Link from "next/link";
import { ProductIcon } from "@/components/product-icon";
import { SceneBlock } from "@/components/scene-block";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { readSnapshot } from "@/data/catalog-db";
import { scenes } from "@/data/scenes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Odalara göre alışveriş | NUVESSA", description: "Salon, mutfak, yatak odası, banyo ve daha fazlası: odanıza uygun ürünleri keşfedin." };

export default function RoomsPage() {
  const { rooms, products } = readSnapshot();
  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="page-section">
        <p className="eyebrow">NUVESSA / ODALARA GÖRE</p>
        <h1 className="page-title">Hangi odayı donatıyorsunuz?</h1>
        <div className="category-tiles__grid room-tiles">
          {rooms.map((room) => {
            const count = products.filter((product) => product.rooms.includes(room.slug)).length;
            return (
              <Link key={room.slug} href={`/rooms/${room.slug}`} className={`category-tile${room.image ? "" : " category-tile--icon"}`}>
                {room.image ? <Image src={room.image} alt="" fill sizes="(max-width: 700px) 46vw, 24vw" /> : <ProductIcon name={room.icon} className="category-tile__icon" />}
                <span className="category-tile__label"><strong>{room.name}</strong><small>{count} ürün ↗</small></span>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="page-section room-scenes">
        <p className="eyebrow">SHOP THE ROOM</p>
        <h2 className="page-title page-title--small">Odadaki ürünlere dokunun</h2>
        <p className="room-scenes__note">Numaralı noktalara dokunarak ürünü görün, detaya gidin ya da sepete ekleyin.</p>
        <div className="room-scenes__list">
          {scenes.map((scene) => <figure key={scene.slug}><SceneBlock scene={scene} /><figcaption>{scene.title}</figcaption></figure>)}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
