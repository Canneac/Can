import { featuredObjects } from "@/data/homepage";

export const designWorlds = [
  { slug: "modern-form", name: "Modern Form", quality: "Çağdaş form ve mimari çizgi", className: "modern" },
  { slug: "soft-living", name: "Soft Living", quality: "Doğal dokular ve sakin tonlar", className: "soft" },
  { slug: "heritage", name: "Heritage", quality: "Zamansız parçalar ve derin tonlar", className: "heritage" },
  { slug: "art-house", name: "Art House", quality: "Heykelsi nesneler ve yaratıcı ifade", className: "art" },
] as const;

export const catalogCategories = [
  { slug: "dekoratif-objeler", name: "Dekoratif objeler", status: "active" },
  { slug: "mobilya", name: "Mobilya", status: "active" },
  { slug: "mutfak", name: "Mutfak ve sofra", status: "active" },
  { slug: "ev-tekstili", name: "Ev tekstili", status: "planned" },
  { slug: "aydinlatma", name: "Aydınlatma", status: "planned" },
  { slug: "banyo", name: "Banyo", status: "planned" },
  { slug: "temizlik", name: "Temizlik ve günlük ihtiyaçlar", status: "active" },
] as const;

export const catalogProducts = [...featuredObjects.map((item, index) => ({
  ...item,
  slug: ["aren-form-vazo", "neroli-dekor-kasesi", "esik-salon-kompozisyonu"][index],
  categorySlug: "dekoratif-objeler",
  description: [
    "Derin bordo tonu ve dengeli siluetiyle mekânda kendi yerini bulan heykelsi bir seramik form.",
    "Taş kaide ve bronz tonlu yüzeyi bir araya getiren, galeri seçkisi için hazırlanmış dekoratif bir kompozisyon.",
    "Ceviz, ayna ve tekstili aynı yaşam alanında buluşturan editoryal bir salon hikâyesi.",
  ][index],
  worlds: [
    ["heritage", "soft-living"],
    ["art-house", "heritage"],
    ["modern-form", "soft-living"],
  ][index],
  searchTerms: [
    "vazo seramik dekor obje bordo",
    "dekor kase kâse bronz heykelsi obje",
    "salon kompozisyon oturma alanı kanepe sofa",
  ][index],
})), {
  number: "Nº 04",
  name: "Sera — Bouclé Kanepe",
  material: "Bouclé kumaş · fildişi",
  priceInKurus: 3899000,
  image: "/images/sofa-gallery.png",
  imageAlt: "Fildişi bouclé kanepe, ceviz sehpa ve bronz lambaderle kurgulanmış çağdaş salon",
  tone: "stone" as const,
  slug: "sera-boucle-kanepe",
  categorySlug: "mobilya",
  description: "Mimari çizgili, alçak profilli bir kanepe için hazırlanmış NUVESSA tasarım demosu. Kumaş, ölçü ve teknik özellikler henüz ticari ürün verisi olarak doğrulanmamıştır.",
  worlds: ["modern-form", "soft-living"],
  searchTerms: "kanepe koltuk sofa bouclé boucle salon oturma alanı mobilya",
}, {
  number: "Nº 05",
  name: "Lora — Çöp Kovası",
  material: "Mat bordo yüzey · ev düzeni",
  priceInKurus: 249000,
  image: "/images/waste-bin-gallery.png",
  imageAlt: "Bordo gövdeli ev tipi çöp kovası, taş mutfak duvarı önünde",
  tone: "wine" as const,
  slug: "lora-cop-kovasi",
  categorySlug: "temizlik",
  description: "Günlük ev ihtiyaçlarının da özenli bir seçkinin parçası olabileceğini anlatan konsept ürün kaydı. Kapasite, malzeme ve teknik özellikler ticari ürün bilgisi olarak doğrulanmamıştır.",
  worlds: ["modern-form", "heritage"],
  searchTerms: "cop kovasi çöp kovası çöp kovasi cop kovası temizlik atık kova",
}, {
  number: "Nº 06",
  name: "Mira — Çatal Kaşık Seti",
  material: "Sofra seçkisi · demo ürün",
  priceInKurus: 149000,
  image: "/images/cutlery-gallery.png",
  imageAlt: "Fildişi keten örtü üzerinde düzenlenmiş paslanmaz çelik çatal, kaşık ve bıçaklar",
  tone: "stone" as const,
  slug: "mira-catal-kasik-seti",
  categorySlug: "mutfak",
  description: "Sofra kategorisi için oluşturulmuş tasarım demo kaydı. Parça sayısı ve ürün malzemesi üretici bilgisi olarak doğrulanmamıştır.",
  worlds: ["heritage", "soft-living"],
  searchTerms: "kasik kaşık catal çatal catal kasik çatal kaşık sofra servis cutlery",
}];

export type CatalogProduct = (typeof catalogProducts)[number];
export type DesignWorld = (typeof designWorlds)[number];

export function getWorld(slug: string) {
  return designWorlds.find((world) => world.slug === slug);
}

export function getProduct(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}
