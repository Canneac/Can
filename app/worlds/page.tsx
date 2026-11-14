import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { WorldLink } from "@/components/world-link";
import { readSnapshot } from "@/data/catalog-db";
import { designWorlds } from "@/data/catalog";
import { WORLD_CONTENT } from "@/data/worlds-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tasarım dünyaları | NUVESSA", description: "NUVESSA'nın dört tasarım dünyasını keşfedin: Modern Form, Soft Living, Heritage, Art House." };

export default function WorldsPage() {
  const { products } = readSnapshot();
  return (
    <main className="store-page">
      <StorefrontHeader />
      <section className="worlds-intro">
        <p className="eyebrow">TEK MARKA / DÖRT BAKIŞ</p>
        <h1>Tarzınızı<br /><em>bulun.</em></h1>
        <p>Dünyalar ürün kategorisi değil; aynı katalogdaki parçaları dört farklı bakışla bir araya getiren tasarım atmosferleridir. Hepsi aynı sepeti ve ödemeyi kullanır.</p>
      </section>
      <section className="worlds-grid" aria-label="NUVESSA tasarım dünyaları">
        {designWorlds.map((world) => {
          const content = WORLD_CONTENT[world.slug];
          const count = products.filter((product) => product.worlds.includes(world.slug)).length;
          return (
            <WorldLink key={world.slug} world={world.slug} href={`/worlds/${world.slug}`} className={`world-panel world-panel--${world.className}`}>
              <Image src={content.image} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" />
              <span>{content.kicker}</span>
              <strong>{world.name}</strong>
              <p>{world.quality} · {count} ürün</p>
              <i aria-hidden="true">↗</i>
            </WorldLink>
          );
        })}
      </section>
      <SiteFooter />
    </main>
  );
}
