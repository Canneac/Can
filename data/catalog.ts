import { featuredObjects } from "./homepage.ts";

/** Tohum verisi değiştiğinde artırılır; veritabanı bir sonraki okumada güvenle güncellenir. */
export const CATALOG_REVISION = 2;

export const designWorlds = [
  { slug: "modern-form", name: "Modern Form", quality: "Çağdaş form ve mimari çizgi", className: "modern" },
  { slug: "soft-living", name: "Soft Living", quality: "Doğal dokular ve sakin tonlar", className: "soft" },
  { slug: "heritage", name: "Heritage", quality: "Zamansız parçalar ve derin tonlar", className: "heritage" },
  { slug: "art-house", name: "Art House", quality: "Heykelsi nesneler ve yaratıcı ifade", className: "art" },
] as const;

export type ProductIconName =
  | "sofa" | "table" | "fridge" | "oven" | "dishwasher" | "pot" | "bed"
  | "rug" | "lamp" | "towel" | "spray" | "bin" | "cutlery" | "vase";

export type CatalogCategory = {
  slug: string;
  name: string;
  status: "active" | "planned";
  icon: ProductIconName;
  /** Fotoğrafı olan kategoriler görsel kartla, diğerleri çizgi ikonlu kartla gösterilir. */
  image?: string;
};

export const catalogCategories: CatalogCategory[] = [
  { slug: "mobilya", name: "Mobilya", status: "active", icon: "sofa", image: "/images/sofa-gallery.png" },
  { slug: "beyaz-esya", name: "Beyaz eşya", status: "active", icon: "fridge" },
  { slug: "mutfak", name: "Mutfak ve sofra", status: "active", icon: "cutlery", image: "/images/cutlery-gallery.png" },
  { slug: "ev-tekstili", name: "Ev tekstili", status: "active", icon: "bed" },
  { slug: "aydinlatma", name: "Aydınlatma", status: "active", icon: "lamp" },
  { slug: "banyo", name: "Banyo", status: "active", icon: "towel" },
  { slug: "temizlik", name: "Temizlik ve günlük ihtiyaçlar", status: "active", icon: "bin", image: "/images/waste-bin-gallery.png" },
  { slug: "dekoratif-objeler", name: "Dekorasyon", status: "active", icon: "vase", image: "/images/vase-bordeaux.png" },
];

export type CatalogProduct = {
  number: string;
  name: string;
  material: string;
  priceInKurus: number;
  /** Fotoğrafı henüz hazır olmayan demo ürünlerde null; arayüz çizgi ikonlu bir panel gösterir. */
  image: string | null;
  imageAlt: string;
  tone: "stone" | "wine" | "shadow" | "sage" | "ink";
  slug: string;
  categorySlug: string;
  description: string;
  worlds: string[];
  searchTerms: string;
  icon: ProductIconName;
  /** "Öne çıkanlar" sıralaması; küçük sayı önce gelir. */
  rank: number;
};

const demoNote = "Ölçü, malzeme ve teknik özellikler ticari ürün verisi olarak doğrulanmamıştır.";

const decorative: CatalogProduct[] = featuredObjects.map((item, index) => ({
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
  icon: (["vase", "vase", "sofa"] as const)[index],
  rank: [6, 14, 16][index],
}));

export const catalogProducts: CatalogProduct[] = [
  ...decorative,
  {
    number: "Nº 04",
    name: "Sera — Bouclé Kanepe",
    material: "Bouclé kumaş · fildişi",
    priceInKurus: 3899000,
    image: "/images/sofa-gallery.png",
    imageAlt: "Fildişi bouclé kanepe, ceviz sehpa ve bronz lambaderle kurgulanmış çağdaş salon",
    tone: "stone",
    slug: "sera-boucle-kanepe",
    categorySlug: "mobilya",
    description: `Mimari çizgili, alçak profilli bir kanepe için hazırlanmış NUVESSA tasarım demosu. ${demoNote}`,
    worlds: ["modern-form", "soft-living"],
    searchTerms: "kanepe koltuk sofa bouclé boucle salon oturma alanı mobilya",
    icon: "sofa",
    rank: 1,
  },
  {
    number: "Nº 05",
    name: "Lora — Çöp Kovası",
    material: "Mat bordo yüzey · ev düzeni",
    priceInKurus: 249000,
    image: "/images/waste-bin-gallery.png",
    imageAlt: "Bordo gövdeli ev tipi çöp kovası, taş mutfak duvarı önünde",
    tone: "wine",
    slug: "lora-cop-kovasi",
    categorySlug: "temizlik",
    description: `Günlük ev ihtiyaçlarının da özenli bir seçkinin parçası olabileceğini anlatan konsept ürün kaydı. ${demoNote}`,
    worlds: ["modern-form", "heritage"],
    searchTerms: "cop kovasi çöp kovası çöp kovasi cop kovası temizlik atık kova",
    icon: "bin",
    rank: 9,
  },
  {
    number: "Nº 06",
    name: "Mira — Çatal Kaşık Seti",
    material: "Sofra seçkisi · demo ürün",
    priceInKurus: 149000,
    image: "/images/cutlery-gallery.png",
    imageAlt: "Fildişi keten örtü üzerinde düzenlenmiş paslanmaz çelik çatal, kaşık ve bıçaklar",
    tone: "stone",
    slug: "mira-catal-kasik-seti",
    categorySlug: "mutfak",
    description: `Sofra kategorisi için oluşturulmuş tasarım demo kaydı. ${demoNote}`,
    worlds: ["heritage", "soft-living"],
    searchTerms: "kasik kaşık catal çatal catal kasik çatal kaşık sofra servis cutlery",
    icon: "cutlery",
    rank: 4,
  },
  {
    number: "Nº 07",
    name: "Vela — Çift Kapılı Buzdolabı",
    material: "Mat inox · no-frost · demo",
    priceInKurus: 8499000,
    image: null,
    imageAlt: "Çift kapılı mat inox buzdolabı için çizgi illüstrasyon",
    tone: "shadow",
    slug: "vela-cift-kapili-buzdolabi",
    categorySlug: "beyaz-esya",
    description: `Mutfağın sessiz merkezi olarak tasarlanmış, geniş hacimli bir buzdolabı konsepti. ${demoNote}`,
    worlds: ["modern-form"],
    searchTerms: "buzdolabi buzdolabı dolap soğutucu no frost inox beyaz esya beyaz eşya mutfak",
    icon: "fridge",
    rank: 2,
  },
  {
    number: "Nº 08",
    name: "Orin — Sessiz Bulaşık Makinesi",
    material: "Ankastre · 14 kişilik · demo",
    priceInKurus: 3249000,
    image: null,
    imageAlt: "Ankastre bulaşık makinesi için çizgi illüstrasyon",
    tone: "ink",
    slug: "orin-sessiz-bulasik-makinesi",
    categorySlug: "beyaz-esya",
    description: `Gürültüsü düşük, mutfak cephesiyle bütünleşen bir bulaşık makinesi konsepti. ${demoNote}`,
    worlds: ["modern-form", "soft-living"],
    searchTerms: "bulasik makinesi bulaşık makinesi ankastre sessiz beyaz esya beyaz eşya mutfak",
    icon: "dishwasher",
    rank: 10,
  },
  {
    number: "Nº 09",
    name: "Arda — Ankastre Fırın",
    material: "Siyah cam · buharlı pişirme · demo",
    priceInKurus: 2749000,
    image: null,
    imageAlt: "Siyah camlı ankastre fırın için çizgi illüstrasyon",
    tone: "shadow",
    slug: "arda-ankastre-firin",
    categorySlug: "beyaz-esya",
    description: `Siyah cam yüzeyli, buharlı pişirme modlu bir ankastre fırın konsepti. ${demoNote}`,
    worlds: ["modern-form", "heritage"],
    searchTerms: "firin fırın ankastre ocak pişirme beyaz esya beyaz eşya mutfak",
    icon: "oven",
    rank: 12,
  },
  {
    number: "Nº 10",
    name: "Kaya — Ceviz Yemek Masası",
    material: "Masif ceviz · 6 kişilik · demo",
    priceInKurus: 2189000,
    image: null,
    imageAlt: "Masif ceviz yemek masası için çizgi illüstrasyon",
    tone: "wine",
    slug: "kaya-ceviz-yemek-masasi",
    categorySlug: "mobilya",
    description: `Yoğun damarlı ceviz yüzeyi ve sade ayak çizgisiyle uzun sofralar için hazırlanmış masa konsepti. ${demoNote}`,
    worlds: ["heritage", "modern-form"],
    searchTerms: "masa yemek masasi yemek masası ceviz ahşap mobilya yemek odası",
    icon: "table",
    rank: 5,
  },
  {
    number: "Nº 11",
    name: "Lino — Keten Nevresim Takımı",
    material: "Yıkanmış keten · çift kişilik · demo",
    priceInKurus: 189000,
    image: null,
    imageAlt: "Keten nevresim takımı için çizgi illüstrasyon",
    tone: "sage",
    slug: "lino-keten-nevresim-takimi",
    categorySlug: "ev-tekstili",
    description: `Yıkandıkça yumuşayan, doğal dokulu bir yatak tekstili konsepti. ${demoNote}`,
    worlds: ["soft-living"],
    searchTerms: "nevresim yatak takimi yatak takımı keten tekstil yatak odası",
    icon: "bed",
    rank: 7,
  },
  {
    number: "Nº 12",
    name: "Bora — Yün Karışımlı Halı",
    material: "Yün karışımı · 200 × 300 cm · demo",
    priceInKurus: 649000,
    image: null,
    imageAlt: "Yün karışımlı halı için çizgi illüstrasyon",
    tone: "stone",
    slug: "bora-yun-karisimli-hali",
    categorySlug: "ev-tekstili",
    description: `Salonun zeminini yumuşatan, doğal tonlu, dokulu bir halı konsepti. ${demoNote}`,
    worlds: ["soft-living", "heritage"],
    searchTerms: "hali halı zemin yün tekstil salon",
    icon: "rug",
    rank: 11,
  },
  {
    number: "Nº 13",
    name: "Halo — Bronz Lambader",
    material: "Bronz kaplama · kemerli kol · demo",
    priceInKurus: 329000,
    image: null,
    imageAlt: "Kemerli bronz lambader için çizgi illüstrasyon",
    tone: "wine",
    slug: "halo-bronz-lambader",
    categorySlug: "aydinlatma",
    description: `Kemerli koluyla oturma alanının üzerine sıcak bir ışık bırakan lambader konsepti. ${demoNote}`,
    worlds: ["art-house", "heritage"],
    searchTerms: "lambader aydinlatma aydınlatma lamba isik ışık bronz salon",
    icon: "lamp",
    rank: 3,
  },
  {
    number: "Nº 14",
    name: "Sülün — Pamuk Havlu Seti",
    material: "Organik pamuk · 4 parça · demo",
    priceInKurus: 119000,
    image: null,
    imageAlt: "Pamuk havlu seti için çizgi illüstrasyon",
    tone: "sage",
    slug: "sulun-pamuk-havlu-seti",
    categorySlug: "banyo",
    description: `Yoğun dokulu, hızlı kuruyan pamuk havlulardan oluşan banyo seti konsepti. ${demoNote}`,
    worlds: ["soft-living"],
    searchTerms: "havlu banyo pamuk tekstil el havlusu bornoz",
    icon: "towel",
    rank: 13,
  },
  {
    number: "Nº 15",
    name: "Tavla — Döküm Tencere Seti",
    material: "Emaye döküm · 5 parça · demo",
    priceInKurus: 479000,
    image: null,
    imageAlt: "Emaye döküm tencere seti için çizgi illüstrasyon",
    tone: "ink",
    slug: "tavla-dokum-tencere-seti",
    categorySlug: "mutfak",
    description: `Isıyı eşit dağıtan, fırından sofraya taşınabilen bir tencere seti konsepti. ${demoNote}`,
    worlds: ["heritage", "modern-form"],
    searchTerms: "tencere tava döküm mutfak pişirme yemek takımı",
    icon: "pot",
    rank: 8,
  },
  {
    number: "Nº 16",
    name: "Saf — Bitkisel Temizlik Seti",
    material: "Yüzey, cam ve zemin · 3 parça · demo",
    priceInKurus: 89000,
    image: null,
    imageAlt: "Bitkisel temizlik seti için çizgi illüstrasyon",
    tone: "sage",
    slug: "saf-bitkisel-temizlik-seti",
    categorySlug: "temizlik",
    description: `Günlük bakım için bir araya getirilmiş, sade ambalajlı temizlik seti konsepti. ${demoNote}`,
    worlds: ["soft-living", "modern-form"],
    searchTerms: "temizlik deterjan sprey yüzey cam zemin bakim bakım günlük ihtiyaç",
    icon: "spray",
    rank: 15,
  },
];

export type DesignWorld = (typeof designWorlds)[number];

export function getWorld(slug: string) {
  return designWorlds.find((world) => world.slug === slug);
}

export function getCategory(slug: string) {
  return catalogCategories.find((category) => category.slug === slug);
}

export function getProduct(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}
