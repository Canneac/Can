import Image from "next/image";
import Link from "next/link";
import { CinematicIntro } from "@/components/cinematic-intro";
import { ProductCard } from "@/components/product-card";
import { SceneBlock } from "@/components/scene-block";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { WorldLink } from "@/components/world-link";
import { readSnapshot } from "@/data/catalog-db";
import { designWorlds } from "@/data/catalog";
import { activeDepartments, getDepartment, inDepartment } from "@/data/departments";
import { scenes } from "@/data/scenes";
import { WORLD_CONTENT } from "@/data/worlds-content";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const { products, categories } = readSnapshot();
  const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.rank - b.rank).slice(0, 8);
  const kitchen = getDepartment("mutfak")!;
  const kitchenProducts = products.filter((product) => inDepartment(product, kitchen)).slice(0, 4);
  const list = activeDepartments(products, categories.map((category) => category.slug));

  return (
    <main id="top">
      <StorefrontHeader overlay />
      <CinematicIntro
        nextImage="/images/salon-editorial.png"
        nextAlt="Gün ışığı alan, kemerli duvarlı geniş salon"
        nextTitle="Evin her köşesi için"
      />

      <section id="koleksiyonlar" className="zsec" aria-labelledby="col-title">
        <div className="zsec__head"><h2 id="col-title">Koleksiyonlar</h2><Link href="/worlds">Tümü</Link></div>
        <div className="zcols">
          {designWorlds.map((world) => (
            <WorldLink key={world.slug} world={world.slug} href={`/worlds/${world.slug}`} className="zcol">
              <Image src={WORLD_CONTENT[world.slug].image} alt="" fill sizes="(max-width: 760px) 50vw, 25vw" />
              <span>{world.name}<small>{world.quality}</small></span>
            </WorldLink>
          ))}
        </div>
      </section>

      <section className="zsec" aria-labelledby="new-title">
        <div className="zsec__head"><h2 id="new-title">Yeni gelenler</h2><Link href="/shop?sort=new">Hepsini gör</Link></div>
        <div className="zrail">{newest.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
      </section>

      <section className="zsec" aria-labelledby="kitchen-title">
        <div className="zsec__head"><h2 id="kitchen-title">Mutfak</h2><Link href="/shop?dept=mutfak">Mutfaktaki her şey</Link></div>
        <div className="zsplit">
          <Link href="/shop?dept=mutfak" className="zsplit__img"><Image src="/images/cutlery-gallery.png" alt="Keten örtü üzerinde sofra gereçleri" fill sizes="(max-width: 760px) 100vw, 50vw" /><span>Mutfak</span></Link>
          <div className="zsplit__grid">{kitchenProducts.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
        </div>
      </section>

      <section className="zsec" aria-labelledby="room-title">
        <div className="zsec__head"><h2 id="room-title">Odadan alışveriş</h2></div>
        <SceneBlock scene={scenes[0]} />
        <p className="zscene-note">Numaralı noktalara dokunun: ürünü görün, sepete ekleyin.</p>
      </section>

      <section className="zsec" aria-labelledby="all-title">
        <div className="zsec__head"><h2 id="all-title">Tüm kategoriler</h2></div>
        <nav className="zlist" aria-label="Tüm kategoriler">
          {list.map((department) => (
            <Link key={department.slug} href={`/shop?dept=${department.slug}`}>{department.name}<small>{products.filter((product) => inDepartment(product, department)).length} ürün</small></Link>
          ))}
        </nav>
      </section>

      <SiteFooter />
    </main>
  );
}
