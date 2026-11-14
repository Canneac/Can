import { readCatalog } from "@/data/catalog-db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { StorefrontHeader } from "@/components/storefront-header";
import { designWorlds, getWorld } from "@/data/catalog";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function WorldPage({ params }: PageProps<"/worlds/[slug]">) {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) notFound();
  const products = readCatalog().filter((product) => product.worlds.includes(slug));
  const scene = { modern: "salon-editorial", soft: "sofa-gallery", heritage: "vase-bordeaux", art: "sculptural-bowl" }[world.className];
  return <main className={`store-page world-page world-page--${world.className}`}><StorefrontHeader />
    <section className="world-hero scenic-world"><div className="scenic-world__image"><Image src={`/images/${scene}.png`} alt="" fill sizes="(max-width: 700px) 100vw, 55vw" priority /></div><p className="eyebrow">NUVESSA / TASARIM DÜNYASI</p><h1>{world.name}</h1><p>{world.quality}. Ortak NUVESSA seçkisinden, bu bakışla buluşan parçalar.</p><Link href={`/shop?world=${world.slug}`}>Dünyadaki seçkiyi keşfet ↗</Link><span>0{designWorlds.findIndex((item) => item.slug === slug) + 1} / 04</span></section>
    <section className="world-products"><div className="catalog-heading"><div><p className="eyebrow">ORTAK ÜRÜN KATALOĞU</p><h2>Bu dünyadan <em>seçkiler.</em></h2></div><Link href="/worlds">Diğer dünyalar ↗</Link></div>
      <div className="catalog-grid">{products.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
      <p className="demo-disclosure">Tasarım önizlemesi · Ürün bilgileri ve fiyatlar örnektir; stok ve satış sunulmaz.</p>
    </section>
  </main>;
}


