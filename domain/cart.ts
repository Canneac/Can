import type { Product } from "./catalog-types.ts";

/** Tarayıcıdan gelen sepet satırı: yalnızca kimlikler, adet ve kaynak dünya. Fiyat yok. */
export type CartLineInput = {
  productSlug: string;
  variantId: string;
  quantity: number;
  /** Ürünün sepete eklendiği tasarım dünyası; /shop gibi nötr yerlerden eklenmişse null. */
  sourceWorld: string | null;
};

export type QuoteLine = {
  key: string;
  productSlug: string;
  variantId: string;
  name: string;
  variantLabel: string;
  image: string | null;
  imageAlt: string;
  tone: Product["tone"];
  icon: Product["icon"];
  unitPriceInKurus: number;
  quantity: number;
  lineTotalInKurus: number;
  sourceWorld: string | null;
  /** Bu varyant için sunucunun bildiği stok */
  available: number;
  note?: "quantity_reduced";
};

export type Quote = {
  lines: QuoteLine[];
  /** Artık satışta olmayan/bulunamayan satırların anahtarları */
  removedKeys: string[];
  subtotalInKurus: number;
  shippingInKurus: number;
  discountInKurus: number;
  totalInKurus: number;
};

/** Demo kargo kuralı: 1.500 ₺ üzeri ücretsiz, altı 49,90 ₺. Gerçek bir ticari kural değildir. */
export const FREE_SHIPPING_THRESHOLD_KURUS = 150000;
export const SHIPPING_FEE_KURUS = 4990;
export const MAX_LINE_QUANTITY = 20;

/** Aynı ürün farklı dünyalardan eklenirse ayrı satır olur: anahtar kaynak dünyayı içerir. */
export function lineKey(variantId: string, sourceWorld: string | null) {
  return `${variantId}::${sourceWorld ?? "shop"}`;
}

export function computeQuote(inputs: readonly CartLineInput[], products: readonly Product[], validWorlds: readonly string[]): Quote {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const merged = new Map<string, CartLineInput>();
  for (const input of inputs) {
    if (!input || typeof input.productSlug !== "string" || typeof input.variantId !== "string") continue;
    const quantity = Math.floor(Number(input.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) continue;
    const world = typeof input.sourceWorld === "string" && validWorlds.includes(input.sourceWorld) ? input.sourceWorld : null;
    const key = lineKey(input.variantId, world);
    const existing = merged.get(key);
    merged.set(key, { productSlug: input.productSlug, variantId: input.variantId, sourceWorld: world, quantity: (existing?.quantity ?? 0) + quantity });
  }

  const lines: QuoteLine[] = [];
  const removedKeys: string[] = [];
  for (const [key, input] of merged) {
    const product = bySlug.get(input.productSlug);
    const variant = product?.variants.find((entry) => entry.id === input.variantId);
    if (!product || !variant || variant.priceInKurus <= 0 || variant.stock <= 0) {
      removedKeys.push(key);
      continue;
    }
    // Ürün sonradan bu dünyadan çıkarılmışsa satır nötr temaya döner.
    const sourceWorld = input.sourceWorld && product.worlds.includes(input.sourceWorld) ? input.sourceWorld : null;
    const wanted = Math.min(input.quantity, MAX_LINE_QUANTITY);
    const quantity = Math.min(wanted, variant.stock);
    lines.push({
      key, productSlug: product.slug, variantId: variant.id, name: product.name, variantLabel: variant.label,
      image: product.image, imageAlt: product.imageAlt, tone: product.tone, icon: product.icon,
      unitPriceInKurus: variant.priceInKurus, quantity, lineTotalInKurus: variant.priceInKurus * quantity,
      sourceWorld, available: variant.stock, note: quantity < input.quantity ? "quantity_reduced" : undefined,
    });
  }

  const subtotalInKurus = lines.reduce((sum, line) => sum + line.lineTotalInKurus, 0);
  const shippingInKurus = lines.length === 0 || subtotalInKurus >= FREE_SHIPPING_THRESHOLD_KURUS ? 0 : SHIPPING_FEE_KURUS;
  const discountInKurus = 0; // Gerçek bir kampanya yokken indirim uydurulmaz.
  return { lines, removedKeys, subtotalInKurus, shippingInKurus, discountInKurus, totalInKurus: subtotalInKurus + shippingInKurus - discountInKurus };
}
