export type ProductIconName =
  | "sofa" | "table" | "fridge" | "oven" | "dishwasher" | "pot" | "bed" | "rug" | "lamp"
  | "towel" | "spray" | "bin" | "cutlery" | "vase" | "coffee" | "box" | "plug" | "chair"
  | "desk" | "hanger" | "cup" | "sponge";

export type Tone = "stone" | "wine" | "shadow" | "sage" | "ink";

/** Satın alınabilir en küçük birim. Sepet ve siparişler variant id'siyle çalışır. */
export type Variant = {
  id: string;
  label: string;
  /** Renk adı (COLOR_HEX içinde); renk seçimi olmayan varyantlarda boş. */
  color?: string;
  priceInKurus: number;
  /** Demo stok adedi. Gerçek envanter değildir. */
  stock: number;
};

export type ProductRecord = {
  slug: string;
  number: string;
  name: string;
  /** brands tablosundaki slug */
  brand: string;
  /** Kartta gösterilen kısa malzeme/özet satırı */
  material: string;
  /** Filtrelenebilir malzeme grupları */
  materials: string[];
  image: string | null;
  imageAlt: string;
  tone: Tone;
  /** Ana kategori; ek kategoriler categorySlugs'ta */
  categorySlug: string;
  categorySlugs?: string[];
  description: string;
  worlds: string[];
  rooms: string[];
  searchTerms: string;
  icon: ProductIconName;
  /** "Öne çıkanlar" sırası; küçük sayı önce gelir. */
  rank: number;
  /** ISO tarih; "Yeni gelenler" sıralaması için. */
  createdAt: string;
  status: "active" | "archived";
  variants: Variant[];
  /** Ürün grubuna özel teknik özellikler: [etiket, değer] */
  specs: [string, string][];
  isDemo: boolean;
  /** Yönetici elle düzenlediyse tohum güncellemesi bu kaydı ezmez. */
  adminEdited?: boolean;
};

/** Okuma sırasında türetilen alanlarla zenginleştirilmiş ürün. */
export type Product = ProductRecord & {
  priceInKurus: number;
  stock: number;
  inStock: boolean;
  colors: string[];
};

export type CategoryRecord = {
  slug: string;
  name: string;
  parent?: string;
  order: number;
  visible: boolean;
  icon: ProductIconName;
  image?: string;
  adminEdited?: boolean;
};

export type BrandRecord = {
  slug: string;
  name: string;
  /** own: NUVESSA'nın kendi hattı. partner: gerçek bir anlaşma olmadan kullanılmaz. */
  kind: "own" | "partner";
  adminEdited?: boolean;
};

export type RoomRecord = {
  slug: string;
  name: string;
  order: number;
  icon: ProductIconName;
  image?: string;
  adminEdited?: boolean;
};

export const COLOR_HEX: Record<string, string> = {
  Fildişi: "#efe6d6", Krem: "#e8dcc6", Bordo: "#5a2230", Antrasit: "#33363a", Siyah: "#1c1b1b",
  Beyaz: "#f5f3ee", Ceviz: "#5b3d2b", Doğal: "#c9b28f", Adaçayı: "#a9b39a", Petrol: "#1f4f5a",
  Bronz: "#8a6a3b", Gri: "#8b8b88", Mor: "#4b2d5e", İnox: "#b9bcbf", Şeffaf: "#dfe7ea",
};

export function deriveProduct(record: ProductRecord): Product {
  const sellable = record.variants.filter((variant) => variant.priceInKurus > 0);
  const stock = record.variants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0);
  const colors = [...new Set(record.variants.map((variant) => variant.color).filter((color): color is string => Boolean(color)))];
  return {
    ...record,
    priceInKurus: sellable.length ? Math.min(...sellable.map((variant) => variant.priceInKurus)) : 0,
    stock,
    inStock: stock > 0,
    colors,
  };
}
