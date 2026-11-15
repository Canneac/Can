import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { WorldLink } from "@/components/world-link";
import { readSnapshot } from "@/data/catalog-db";
import { designWorlds } from "@/data/catalog";
import { WORLD_CONTENT } from "@/data/worlds-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Koleksiyonlar | NUVESSA", description: "NUVESSA'nın dört koleksiyonu: Modern Form, Soft Living, Heritage, Art House." };

export default function WorldsPage() {
  const { products } = readSnapshot();
  return (
    <main>
      <StorefrontHeader />
      <section className="zshop">
        <div className="zshop__title"><h1>Koleksiyonlar</h1><span>Hepsi aynı sepeti kullanır</span></div>
        <div className="zcols" aria-label="NUVESSA koleksiyonları">
          {designWorlds.map((world, position) => (
            <WorldLink key={world.slug} world={world.slug} href={`/worlds/${world.slug}`} className="zcol world-panel">
              <Image src={WORLD_CONTENT[world.slug].image} alt="" fill sizes="(max-width: 760px) 50vw, 25vw" priority={position < 2} />
              <span>{world.name}<small>{world.quality} · {products.filter((product) => product.worlds.includes(world.slug)).length} ürün</small></span>
            </WorldLink>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
