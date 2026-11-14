import Image from "next/image";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront-header";
import { designWorlds } from "@/data/catalog";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tasarım dünyaları | NUVESSA", description: "NUVESSA'nın dört tasarım dünyasını keşfedin." };

export default function WorldsPage() {
  return <main className="store-page"><StorefrontHeader />
    <section className="worlds-intro"><p className="eyebrow">TEK MARKA / DÖRT BAKIŞ</p><h1>Tarzınızı<br /><em>bulun.</em></h1><p>Dünyalar, ürün kategorileri değil; ortak katalogdaki parçaları bir araya getiren dört farklı tasarım bakışı.</p></section>
    <section className="worlds-grid" aria-label="NUVESSA tasarım dünyaları">
      {designWorlds.map((world, index) => <Link href={`/worlds/${world.slug}`} className={`world-panel world-panel--${world.className}`} key={world.slug}>
        <Image src={`/images/${["salon-editorial","sofa-gallery","vase-bordeaux","sculptural-bowl"][index]}.png`} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" /><strong>{world.name}</strong><p>{world.quality}</p><i aria-hidden="true">↗</i>
      </Link>)}
    </section>
  </main>;
}

