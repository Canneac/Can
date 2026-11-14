import { ShopTheRoom, type SceneProduct } from "@/components/shop-the-room";
import { readSnapshot } from "@/data/catalog-db";
import type { Scene } from "@/data/scenes";

/** Sunucuda sahnedeki ürünleri gerçek katalogdan okuyup istemci bileşenine verir. */
export function SceneBlock({ scene }: { scene: Scene }) {
  const { products, brands } = readSnapshot();
  const map: Record<string, SceneProduct> = {};
  for (const spot of scene.hotspots) {
    const product = products.find((entry) => entry.slug === spot.productSlug);
    if (!product) continue;
    map[product.slug] = {
      slug: product.slug, name: product.name, priceInKurus: product.priceInKurus, stock: product.stock, image: product.image, imageAlt: product.imageAlt,
      icon: product.icon, singleVariantId: product.variants.length === 1 ? product.variants[0].id : null, hasVariants: product.variants.length > 1,
      brandName: brands.find((brand) => brand.slug === product.brand)?.name ?? "NUVESSA",
    };
  }
  // Kataloğdan kalkmış ürüne ait nokta gösterilmez (sahte/çalışmayan nokta olmasın).
  const live = { ...scene, hotspots: scene.hotspots.filter((spot) => map[spot.productSlug]) };
  return <ShopTheRoom scene={live} products={map} />;
}
