import type { BrandRecord, CategoryRecord, ProductRecord, RoomRecord, Tone, Variant } from "../domain/catalog-types.ts";

export type { BrandRecord, CategoryRecord, ProductRecord, RoomRecord, Product, Variant, ProductIconName } from "../domain/catalog-types.ts";

/** Tohum verisi değiştiğinde artırılır; veritabanı bir sonraki okumada güvenle güncellenir. */
export const CATALOG_REVISION = 5;

export const designWorlds = [
  { slug: "modern-form", name: "Modern Form", quality: "Çağdaş form ve mimari çizgi", className: "modern" },
  { slug: "soft-living", name: "Soft Living", quality: "Doğal dokular ve sakin tonlar", className: "soft" },
  { slug: "heritage", name: "Heritage", quality: "Zamansız parçalar ve derin tonlar", className: "heritage" },
  { slug: "art-house", name: "Art House", quality: "Heykelsi nesneler ve yaratıcı ifade", className: "art" },
] as const;

export type DesignWorld = (typeof designWorlds)[number];

export function getWorld(slug: string) {
  return designWorlds.find((world) => world.slug === slug);
}

// ---- Kategoriler, odalar, markalar (veritabanına tohumlanır; yönetici panelinden değişir) ----

export const seedCategories: CategoryRecord[] = [
  { slug: "mobilya", name: "Koltuk, masa ve raf", order: 1, visible: true, icon: "sofa", image: "/images/sofa-gallery.png" },
  { slug: "beyaz-esya", name: "Beyaz eşya", order: 2, visible: true, icon: "fridge" },
  { slug: "kucuk-ev-aletleri", name: "Küçük ev aletleri", order: 3, visible: true, icon: "coffee" },
  { slug: "mutfak", name: "Pişirme ve gereçler", order: 4, visible: true, icon: "pot" },
  { slug: "sofra-servis", name: "Sofra ve servis", order: 5, visible: true, icon: "cutlery", image: "/images/cutlery-gallery.png" },
  { slug: "ev-tekstili", name: "Ev tekstili", order: 6, visible: true, icon: "bed" },
  { slug: "banyo", name: "Banyo", order: 7, visible: true, icon: "towel" },
  { slug: "temizlik", name: "Temizlik ve günlük ihtiyaçlar", order: 8, visible: true, icon: "bin", image: "/images/waste-bin-gallery.png" },
  { slug: "depolama", name: "Depolama ve organizasyon", order: 9, visible: true, icon: "box" },
  { slug: "aydinlatma", name: "Aydınlatma", order: 10, visible: true, icon: "lamp" },
  { slug: "dekorasyon", name: "Dekorasyon", order: 11, visible: true, icon: "vase", image: "/images/vase-bordeaux.png" },
  { slug: "balkon-bahce", name: "Balkon ve bahçe", order: 12, visible: true, icon: "chair" },
  { slug: "cocuk-odasi", name: "Çocuk ve bebek odası", order: 13, visible: true, icon: "bed" },
  { slug: "ev-ofisi", name: "Ev ofisi", order: 14, visible: true, icon: "desk" },
  { slug: "antre", name: "Antre ve giriş", order: 15, visible: true, icon: "hanger" },
  { slug: "akilli-ev", name: "Akıllı ev", order: 16, visible: true, icon: "plug" },
  { slug: "sezonluk", name: "Sezonluk ürünler", order: 17, visible: true, icon: "box" },
];

export const seedRooms: RoomRecord[] = [
  { slug: "salon", name: "Salon", order: 1, icon: "sofa", image: "/images/sofa-gallery.png" },
  { slug: "mutfak", name: "Mutfak", order: 2, icon: "pot", image: "/images/cutlery-gallery.png" },
  { slug: "yemek-odasi", name: "Yemek odası", order: 3, icon: "table" },
  { slug: "yatak-odasi", name: "Yatak odası", order: 4, icon: "bed" },
  { slug: "banyo", name: "Banyo", order: 5, icon: "towel" },
  { slug: "cocuk-odasi", name: "Çocuk odası", order: 6, icon: "bed" },
  { slug: "calisma-odasi", name: "Çalışma odası", order: 7, icon: "desk" },
  { slug: "antre", name: "Antre", order: 8, icon: "hanger", image: "/images/salon-editorial.png" },
  { slug: "balkon", name: "Balkon", order: 9, icon: "chair" },
  { slug: "bahce", name: "Bahçe", order: 10, icon: "chair" },
];

export const seedBrands: BrandRecord[] = [
  { slug: "nuvessa-home", name: "NUVESSA Home", kind: "own" },
  { slug: "nuvessa-atelier", name: "NUVESSA Atelier", kind: "own" },
  { slug: "nuvessa-kitchen", name: "NUVESSA Kitchen", kind: "own" },
  { slug: "nuvessa-essentials", name: "NUVESSA Essentials", kind: "own" },
];

// ---- Demo ürünler ----

const demoNote = "Bu kayıt tasarım demosudur; ölçü, malzeme, stok ve teknik özellikler ticari ürün verisi olarak doğrulanmamıştır.";

function v(id: string, label: string, priceInKurus: number, stock: number, color?: string): Variant {
  return { id, label, priceInKurus, stock, color };
}

type Seed = Omit<ProductRecord, "status" | "isDemo" | "createdAt"> & { createdAt?: string };

function product(seed: Seed): ProductRecord {
  return { createdAt: "2026-10-20", status: "active", isDemo: true, ...seed };
}

export const seedProducts: ProductRecord[] = [
  product({
    slug: "sera-boucle-kanepe", number: "Nº 04", name: "Sera — Bouclé Kanepe", brand: "nuvessa-home",
    material: "Bouclé kumaş · fildişi", materials: ["Kumaş", "Ahşap"], image: "/images/sofa-gallery.png",
    imageAlt: "Fildişi bouclé kanepe, ceviz sehpa ve bronz lambaderle kurgulanmış çağdaş salon", tone: "stone",
    categorySlug: "mobilya", description: `Mimari çizgili, alçak profilli üçlü kanepe. ${demoNote}`,
    worlds: ["modern-form", "soft-living"], rooms: ["salon"], searchTerms: "kanepe koltuk sofa üçlü koltuk bouclé boucle salon oturma alanı mobilya",
    icon: "sofa", rank: 1, createdAt: "2026-11-02",
    variants: [v("sera-fildisi", "Fildişi", 3899000, 6, "Fildişi"), v("sera-bordo", "Bordo", 4099000, 3, "Bordo")],
    specs: [["Oturma kapasitesi", "3 kişilik"], ["Genişlik", "240 cm"], ["Derinlik", "105 cm"], ["Yükseklik", "72 cm"], ["Kumaş", "Bouclé"], ["İskelet", "Ahşap"]],
  }),
  product({
    slug: "vela-cift-kapili-buzdolabi", number: "Nº 07", name: "Vela — Çift Kapılı Buzdolabı", brand: "nuvessa-home",
    material: "Mat inox · no-frost", materials: ["Metal"], image: null, imageAlt: "Çift kapılı mat inox buzdolabı için çizgi illüstrasyon", tone: "shadow",
    categorySlug: "beyaz-esya", description: `Mutfağın sessiz merkezi olarak tasarlanmış geniş hacimli buzdolabı. ${demoNote}`,
    worlds: ["modern-form"], rooms: ["mutfak"], searchTerms: "buzdolabi buzdolabı dolap soğutucu no frost inox beyaz esya beyaz eşya mutfak",
    icon: "fridge", rank: 2, createdAt: "2026-10-28",
    variants: [v("vela-inox", "Mat inox", 8499000, 4, "İnox"), v("vela-siyah", "Siyah", 8899000, 2, "Siyah")],
    specs: [["Net hacim", "540 litre"], ["Enerji sınıfı", "E"], ["Ölçüler (G×D×Y)", "83 × 70 × 185 cm"], ["Soğutma", "No-frost"], ["Model", "VLA-540 (demo)"]],
  }),
  product({
    slug: "halo-bronz-lambader", number: "Nº 13", name: "Halo — Bronz Lambader", brand: "nuvessa-atelier",
    material: "Bronz kaplama · kemerli kol", materials: ["Metal"], image: null, imageAlt: "Kemerli bronz lambader için çizgi illüstrasyon", tone: "wine",
    categorySlug: "aydinlatma", description: `Kemerli koluyla oturma alanının üzerine sıcak ışık bırakan lambader. ${demoNote}`,
    worlds: ["art-house", "heritage"], rooms: ["salon"], searchTerms: "lambader aydinlatma aydınlatma lamba isik ışık bronz salon",
    icon: "lamp", rank: 3, createdAt: "2026-10-30",
    variants: [v("halo-bronz", "Bronz", 329000, 12, "Bronz"), v("halo-siyah", "Siyah", 299000, 9, "Siyah")],
    specs: [["Yükseklik", "190 cm"], ["Duy", "E27"], ["Malzeme", "Metal"], ["Kablo uzunluğu", "2 m"]],
  }),
  product({
    slug: "mira-catal-kasik-seti", number: "Nº 06", name: "Mira — Çatal Kaşık Seti", brand: "nuvessa-kitchen",
    material: "Paslanmaz çelik · 24 parça", materials: ["Metal"], image: "/images/cutlery-gallery.png",
    imageAlt: "Fildişi keten örtü üzerinde düzenlenmiş paslanmaz çelik çatal, kaşık ve bıçaklar", tone: "stone",
    categorySlug: "sofra-servis", description: `24 parçalık çatal, kaşık ve bıçak seti. ${demoNote}`,
    worlds: ["heritage", "soft-living"], rooms: ["mutfak", "yemek-odasi"], searchTerms: "kasik kaşık catal çatal catal kasik çatal kaşık bıçak sofra servis cutlery set",
    icon: "cutlery", rank: 4, createdAt: "2026-11-05",
    variants: [v("mira-24", "24 parça", 149000, 40, "İnox"), v("mira-84", "84 parça", 459000, 11, "İnox")],
    specs: [["Parça sayısı", "24 / 84"], ["Malzeme", "18/10 paslanmaz çelik"], ["Bulaşık makinesi", "Uygun"], ["Kişi sayısı", "6 / 12"]],
  }),
  product({
    slug: "kaya-ceviz-yemek-masasi", number: "Nº 10", name: "Kaya — Ceviz Yemek Masası", brand: "nuvessa-home",
    material: "Masif ceviz · 6 kişilik", materials: ["Ahşap"], image: null, imageAlt: "Masif ceviz yemek masası için çizgi illüstrasyon", tone: "wine",
    categorySlug: "mobilya", description: `Yoğun damarlı ceviz yüzeyli, sade ayak çizgili yemek masası. ${demoNote}`,
    worlds: ["heritage", "modern-form"], rooms: ["yemek-odasi"], searchTerms: "masa yemek masasi yemek masası ceviz ahşap mobilya yemek odası",
    icon: "table", rank: 5, createdAt: "2026-10-25",
    variants: [v("kaya-180", "180 × 90 cm", 2189000, 5, "Ceviz"), v("kaya-220", "220 × 100 cm", 2689000, 2, "Ceviz")],
    specs: [["Malzeme", "Masif ceviz"], ["Kapasite", "6 / 8 kişilik"], ["Yükseklik", "75 cm"], ["Yüzey", "Mat vernik"]],
  }),
  product({
    slug: "aren-form-vazo", number: "Nº 01", name: "Aren — Form Vazo", brand: "nuvessa-atelier",
    material: "Seramik · bordo", materials: ["Seramik"], image: "/images/vase-bordeaux.png", imageAlt: "Bordo seramik vazonun galeri nişindeki görünümü", tone: "stone",
    categorySlug: "dekorasyon", description: `Derin bordo tonu ve dengeli siluetiyle heykelsi bir seramik form. ${demoNote}`,
    worlds: ["heritage", "art-house", "soft-living"], rooms: ["salon", "antre"], searchTerms: "vazo seramik dekor obje bordo heykelsi",
    icon: "vase", rank: 6, createdAt: "2026-10-12",
    variants: [v("aren-bordo", "Bordo", 1280000, 7, "Bordo")],
    specs: [["Yükseklik", "38 cm"], ["Malzeme", "El yapımı seramik"], ["Su geçirmezlik", "İç yüzey sırlı"]],
  }),
  product({
    slug: "lino-keten-nevresim-takimi", number: "Nº 11", name: "Lino — Keten Nevresim Takımı", brand: "nuvessa-home",
    material: "Yıkanmış keten", materials: ["Kumaş"], image: null, imageAlt: "Keten nevresim takımı için çizgi illüstrasyon", tone: "sage",
    categorySlug: "ev-tekstili", description: `Yıkandıkça yumuşayan, doğal dokulu yatak tekstili. ${demoNote}`,
    worlds: ["soft-living"], rooms: ["yatak-odasi"], searchTerms: "nevresim yatak takimi yatak takımı keten tekstil yatak odası çarşaf",
    icon: "bed", rank: 7, createdAt: "2026-11-08",
    variants: [v("lino-tek-adacayi", "Tek kişilik · Adaçayı", 159000, 14, "Adaçayı"), v("lino-cift-adacayi", "Çift kişilik · Adaçayı", 189000, 20, "Adaçayı"), v("lino-cift-krem", "Çift kişilik · Krem", 189000, 18, "Krem")],
    specs: [["Kumaş türü", "%100 yıkanmış keten"], ["Set içeriği", "Nevresim + 2 yastık kılıfı"], ["Yıkama", "40 °C, makinede"], ["Ölçü", "Tek 160×220 / Çift 200×220 cm"]],
  }),
  product({
    slug: "tavla-dokum-tencere-seti", number: "Nº 15", name: "Tavla — Döküm Tencere Seti", brand: "nuvessa-kitchen",
    material: "Emaye döküm · 5 parça", materials: ["Metal"], image: null, imageAlt: "Emaye döküm tencere seti için çizgi illüstrasyon", tone: "ink",
    categorySlug: "mutfak", description: `Isıyı eşit dağıtan, fırından sofraya taşınabilen tencere seti. ${demoNote}`,
    worlds: ["heritage", "modern-form"], rooms: ["mutfak"], searchTerms: "tencere tava döküm mutfak pişirme yemek takımı tencere seti",
    icon: "pot", rank: 8, createdAt: "2026-10-18",
    variants: [v("tavla-antrasit", "Antrasit", 479000, 15, "Antrasit"), v("tavla-bordo", "Bordo", 499000, 8, "Bordo")],
    specs: [["Parça sayısı", "5 (3 tencere + 2 kapak)"], ["Çap", "20 / 24 / 28 cm"], ["Hacim", "2,5 / 4 / 6 litre"], ["Malzeme", "Emaye kaplı dökme demir"], ["Ocak uyumluluğu", "Gazlı, elektrikli, seramik, indüksiyon"]],
  }),
  product({
    slug: "lora-cop-kovasi", number: "Nº 05", name: "Lora — Çöp Kovası", brand: "nuvessa-essentials",
    material: "Mat bordo yüzey · 30 litre", materials: ["Metal", "Plastik"], image: "/images/waste-bin-gallery.png", imageAlt: "Bordo gövdeli ev tipi çöp kovası, taş mutfak duvarı önünde", tone: "wine",
    categorySlug: "temizlik", categorySlugs: ["mutfak"], description: `Pedallı, yavaş kapanan kapaklı ev tipi çöp kovası. ${demoNote}`,
    worlds: ["modern-form", "heritage"], rooms: ["mutfak", "banyo"], searchTerms: "cop kovasi çöp kovası çöp kovasi cop kovası temizlik atık kova pedallı",
    icon: "bin", rank: 9, createdAt: "2026-11-10",
    variants: [v("lora-bordo-30", "30 L · Bordo", 249000, 25, "Bordo"), v("lora-siyah-30", "30 L · Siyah", 249000, 30, "Siyah"), v("lora-bordo-50", "50 L · Bordo", 329000, 0, "Bordo")],
    specs: [["Kapasite", "30 / 50 litre"], ["Malzeme", "Çelik gövde, plastik iç kova"], ["Kapak tipi", "Pedallı, yavaş kapanan"], ["Renk", "Bordo / Siyah"]],
  }),
  product({
    slug: "orin-sessiz-bulasik-makinesi", number: "Nº 08", name: "Orin — Sessiz Bulaşık Makinesi", brand: "nuvessa-home",
    material: "Ankastre · 14 kişilik", materials: ["Metal"], image: null, imageAlt: "Ankastre bulaşık makinesi için çizgi illüstrasyon", tone: "ink",
    categorySlug: "beyaz-esya", description: `Gürültüsü düşük, mutfak cephesiyle bütünleşen bulaşık makinesi. ${demoNote}`,
    worlds: ["modern-form", "soft-living"], rooms: ["mutfak"], searchTerms: "bulasik makinesi bulaşık makinesi ankastre sessiz beyaz esya beyaz eşya mutfak",
    icon: "dishwasher", rank: 10, createdAt: "2026-10-22",
    variants: [v("orin-inox", "İnox", 3249000, 5, "İnox")],
    specs: [["Kapasite", "14 kişilik"], ["Enerji sınıfı", "D"], ["Ses seviyesi", "42 dB"], ["Program sayısı", "8"]],
  }),
  product({
    slug: "bora-yun-karisimli-hali", number: "Nº 12", name: "Bora — Yün Karışımlı Halı", brand: "nuvessa-home",
    material: "Yün karışımı · doğal ton", materials: ["Kumaş"], image: null, imageAlt: "Yün karışımlı halı için çizgi illüstrasyon", tone: "stone",
    categorySlug: "ev-tekstili", description: `Salonun zeminini yumuşatan, doğal tonlu dokulu halı. ${demoNote}`,
    worlds: ["soft-living", "heritage"], rooms: ["salon", "yatak-odasi"], searchTerms: "hali halı zemin yün tekstil salon",
    icon: "rug", rank: 11, createdAt: "2026-10-15",
    variants: [v("bora-160", "160 × 230 cm", 449000, 9, "Doğal"), v("bora-200", "200 × 300 cm", 649000, 6, "Doğal")],
    specs: [["Malzeme", "%60 yün, %40 pamuk"], ["Ölçü", "160×230 / 200×300 cm"], ["Taban", "Kaymaz"], ["Bakım", "Kuru temizleme"]],
  }),
  product({
    slug: "arda-ankastre-firin", number: "Nº 09", name: "Arda — Ankastre Fırın", brand: "nuvessa-home",
    material: "Siyah cam · buharlı pişirme", materials: ["Metal", "Cam"], image: null, imageAlt: "Siyah camlı ankastre fırın için çizgi illüstrasyon", tone: "shadow",
    categorySlug: "beyaz-esya", description: `Siyah cam yüzeyli, buharlı pişirme modlu ankastre fırın. ${demoNote}`,
    worlds: ["modern-form", "heritage"], rooms: ["mutfak"], searchTerms: "firin fırın ankastre ocak pişirme beyaz esya beyaz eşya mutfak",
    icon: "oven", rank: 12, createdAt: "2026-10-16",
    variants: [v("arda-siyah", "Siyah cam", 2749000, 7, "Siyah")],
    specs: [["Hacim", "72 litre"], ["Enerji sınıfı", "A+"], ["Pişirme modları", "10 (buharlı dahil)"], ["Ölçü", "60 × 60 × 59 cm"]],
  }),
  product({
    slug: "sulun-pamuk-havlu-seti", number: "Nº 14", name: "Sülün — Pamuk Havlu Seti", brand: "nuvessa-home",
    material: "Organik pamuk · 4 parça", materials: ["Kumaş"], image: null, imageAlt: "Pamuk havlu seti için çizgi illüstrasyon", tone: "sage",
    categorySlug: "banyo", categorySlugs: ["ev-tekstili"], description: `Yoğun dokulu, hızlı kuruyan pamuk havlulardan oluşan banyo seti. ${demoNote}`,
    worlds: ["soft-living"], rooms: ["banyo"], searchTerms: "havlu banyo pamuk tekstil el havlusu banyo havlusu bornoz",
    icon: "towel", rank: 13, createdAt: "2026-11-01",
    variants: [v("sulun-krem", "Krem", 119000, 30, "Krem"), v("sulun-adacayi", "Adaçayı", 119000, 22, "Adaçayı"), v("sulun-antrasit", "Antrasit", 119000, 17, "Antrasit")],
    specs: [["Set içeriği", "2 banyo + 2 el havlusu"], ["Malzeme", "%100 organik pamuk"], ["Gramaj", "550 g/m²"], ["Yıkama", "60 °C"]],
  }),
  product({
    slug: "neroli-dekor-kasesi", number: "Nº 02", name: "Neroli — Dekor Kâsesi", brand: "nuvessa-atelier",
    material: "Bronz ton · taş kaide", materials: ["Metal", "Taş"], image: "/images/sculptural-bowl.png", imageAlt: "Taş konsol üzerindeki heykelsi dekor kâsesi", tone: "wine",
    categorySlug: "dekorasyon", description: `Taş kaide ve bronz tonlu yüzeyi buluşturan dekoratif kompozisyon. ${demoNote}`,
    worlds: ["art-house", "heritage"], rooms: ["salon", "antre"], searchTerms: "dekor kase kâse bronz heykelsi obje",
    icon: "vase", rank: 14, createdAt: "2026-10-12",
    variants: [v("neroli-bronz", "Bronz", 1840000, 3, "Bronz")],
    specs: [["Çap", "34 cm"], ["Malzeme", "Bronz kaplama, doğal taş"], ["Ağırlık", "6,2 kg"]],
  }),
  product({
    slug: "saf-bitkisel-temizlik-seti", number: "Nº 16", name: "Saf — Bitkisel Temizlik Seti", brand: "nuvessa-essentials",
    material: "Yüzey, cam ve zemin · 3 parça", materials: ["Plastik"], image: null, imageAlt: "Bitkisel temizlik seti için çizgi illüstrasyon", tone: "sage",
    categorySlug: "temizlik", description: `Günlük bakım için sade ambalajlı temizlik seti. ${demoNote}`,
    worlds: ["soft-living", "modern-form"], rooms: ["mutfak", "banyo"], searchTerms: "temizlik deterjan sprey yüzey cam zemin bakim bakım günlük ihtiyaç",
    icon: "spray", rank: 15, createdAt: "2026-11-09",
    variants: [v("saf-set", "3'lü set", 89000, 60)],
    specs: [["Set içeriği", "Yüzey + cam + zemin temizleyici"], ["Hacim", "3 × 500 ml"], ["İçerik", "Bitki bazlı"]],
  }),
  product({
    slug: "esik-salon-kompozisyonu", number: "Nº 03", name: "Eşik — Salon Kompozisyonu", brand: "nuvessa-atelier",
    material: "Ayna · ceviz · tekstil", materials: ["Ahşap", "Cam"], image: "/images/salon-editorial.png", imageAlt: "Güneş ışığı alan, bordo vurgulu editoryal salon", tone: "shadow",
    categorySlug: "dekorasyon", categorySlugs: ["antre"], description: `Ayna, ceviz konsol ve tekstili bir araya getiren salon hikâyesi. ${demoNote}`,
    worlds: ["modern-form", "soft-living", "heritage"], rooms: ["salon", "antre"], searchTerms: "salon kompozisyon oturma alanı kanepe sofa ayna konsol",
    icon: "sofa", rank: 16, createdAt: "2026-10-12",
    variants: [v("esik-set", "Set", 960000, 4)],
    specs: [["Set içeriği", "Ayna + konsol + kırlent"], ["Malzeme", "Ceviz, metal çerçeve"]],
  }),
  product({
    slug: "dora-kadife-berjer", number: "Nº 17", name: "Dora — Kadife Berjer", brand: "nuvessa-home",
    material: "Kadife · ceviz ayak", materials: ["Kumaş", "Ahşap"], image: null, imageAlt: "Kadife berjer için çizgi illüstrasyon", tone: "wine",
    categorySlug: "mobilya", description: `Kavisli sırtlı, kadife döşemeli tekli koltuk. ${demoNote}`,
    worlds: ["heritage", "soft-living"], rooms: ["salon", "yatak-odasi"], searchTerms: "berjer koltuk tekli koltuk kadife mobilya oturma",
    icon: "chair", rank: 17, createdAt: "2026-11-06",
    variants: [v("dora-bordo", "Bordo", 1249000, 8, "Bordo"), v("dora-adacayi", "Adaçayı", 1249000, 5, "Adaçayı")],
    specs: [["Oturma kapasitesi", "1 kişilik"], ["Genişlik", "78 cm"], ["Derinlik", "80 cm"], ["Yükseklik", "76 cm"], ["Kumaş", "Kadife"]],
  }),
  product({
    slug: "mono-metal-cam-sehpa", number: "Nº 18", name: "Mono — Metal Cam Sehpa", brand: "nuvessa-atelier",
    material: "Siyah metal · temperli cam", materials: ["Metal", "Cam"], image: null, imageAlt: "Metal ve cam orta sehpa için çizgi illüstrasyon", tone: "ink",
    categorySlug: "mobilya", description: `Geometrik formlu, cam tablalı orta sehpa. ${demoNote}`,
    worlds: ["modern-form"], rooms: ["salon"], searchTerms: "sehpa orta sehpa cam metal modern mobilya",
    icon: "table", rank: 18, createdAt: "2026-11-04",
    variants: [v("mono-siyah", "Siyah / şeffaf", 459000, 10, "Siyah")],
    specs: [["Ölçü", "90 × 55 × 40 cm"], ["Malzeme", "Metal iskelet, 8 mm temperli cam"], ["Montaj", "Gerekli"]],
  }),
  product({
    slug: "nora-espresso-makinesi", number: "Nº 19", name: "Nora — Espresso Makinesi", brand: "nuvessa-home",
    material: "Paslanmaz çelik · 15 bar", materials: ["Metal"], image: null, imageAlt: "Espresso makinesi için çizgi illüstrasyon", tone: "shadow",
    categorySlug: "kucuk-ev-aletleri", categorySlugs: ["mutfak"], description: `Süt köpürtücülü yarı otomatik kahve makinesi. ${demoNote}`,
    worlds: ["modern-form", "heritage"], rooms: ["mutfak"], searchTerms: "kahve makinesi espresso kahve makinasi türk kahvesi filtre kahve küçük ev aleti mutfak",
    icon: "coffee", rank: 19, createdAt: "2026-11-11",
    variants: [v("nora-inox", "İnox", 1899000, 6, "İnox"), v("nora-krem", "Krem", 1899000, 4, "Krem")],
    specs: [["Basınç", "15 bar"], ["Su haznesi", "1,5 litre"], ["Güç", "1350 W"], ["Süt köpürtücü", "Var"]],
  }),
  product({
    slug: "ayla-seramik-kupa-seti", number: "Nº 20", name: "Ayla — Seramik Kupa Seti", brand: "nuvessa-kitchen",
    material: "Seramik · 4'lü", materials: ["Seramik"], image: null, imageAlt: "Seramik kupa seti için çizgi illüstrasyon", tone: "stone",
    categorySlug: "sofra-servis", description: `El yapımı görünümlü, mat sırlı dört kupa. ${demoNote}`,
    worlds: ["soft-living", "heritage"], rooms: ["mutfak", "yemek-odasi"], searchTerms: "kupa bardak fincan seramik sofra kahve çay",
    icon: "cup", rank: 20, createdAt: "2026-11-07",
    variants: [v("ayla-krem", "Krem", 129000, 35, "Krem"), v("ayla-adacayi", "Adaçayı", 129000, 28, "Adaçayı")],
    specs: [["Set içeriği", "4 kupa"], ["Hacim", "320 ml"], ["Malzeme", "Seramik"], ["Mikrodalga / bulaşık makinesi", "Uygun"]],
  }),
  product({
    slug: "ova-kapakli-saklama-kutusu-seti", number: "Nº 21", name: "Ova — Kapaklı Saklama Kutusu Seti", brand: "nuvessa-essentials",
    material: "BPA'sız plastik · 6'lı", materials: ["Plastik"], image: null, imageAlt: "Kapaklı saklama kutusu seti için çizgi illüstrasyon", tone: "sage",
    categorySlug: "depolama", categorySlugs: ["mutfak"], description: `İç içe geçen, hava almaz kapaklı saklama kapları. ${demoNote}`,
    worlds: ["modern-form", "soft-living"], rooms: ["mutfak"], searchTerms: "saklama kutusu saklama kabı kapaklı kutu organizer mutfak depolama",
    icon: "box", rank: 21, createdAt: "2026-11-03",
    variants: [v("ova-6", "6'lı set", 99000, 50)],
    specs: [["Set içeriği", "6 kap + 6 kapak"], ["Malzeme", "BPA içermeyen plastik"], ["Derin dondurucu", "Uygun"]],
  }),
  product({
    slug: "sunger-mutfak-sungeri-6li", number: "Nº 22", name: "Pür — Mutfak Süngeri 6'lı", brand: "nuvessa-essentials",
    material: "Selüloz · çizmeyen yüzey", materials: ["Diğer"], image: null, imageAlt: "Mutfak süngeri için çizgi illüstrasyon", tone: "sage",
    categorySlug: "temizlik", description: `Yüzeyi çizmeyen, hızlı kuruyan günlük bulaşık süngeri. ${demoNote}`,
    worlds: ["soft-living"], rooms: ["mutfak"], searchTerms: "sünger sunger bulaşık süngeri temizlik süngeri mutfak süngeri temizlik",
    icon: "sponge", rank: 22, createdAt: "2026-11-12",
    variants: [v("pur-6", "6'lı paket", 29000, 200)],
    specs: [["Paket içeriği", "6 adet"], ["Ölçü", "11 × 7 cm"], ["Kullanım", "Bulaşık, tezgâh"]],
  }),
  product({
    slug: "ekol-cop-poseti-rulo", number: "Nº 23", name: "Ekol — Çöp Poşeti Rulo", brand: "nuvessa-essentials",
    material: "Geri dönüştürülmüş PE · 30 litre", materials: ["Plastik"], image: null, imageAlt: "Çöp poşeti rulosu için çizgi illüstrasyon", tone: "ink",
    categorySlug: "temizlik", description: `Dayanıklı, kolay ayrılan çöp poşeti. ${demoNote}`,
    worlds: ["modern-form"], rooms: ["mutfak", "banyo"], searchTerms: "cop poseti çöp poşeti poşet torba kova temizlik",
    icon: "bin", rank: 23, createdAt: "2026-11-12",
    variants: [v("ekol-30", "30 L · 20'li rulo", 39000, 150), v("ekol-50", "50 L · 15'li rulo", 49000, 120)],
    specs: [["Hacim", "30 / 50 litre"], ["Adet", "20 / 15"], ["Malzeme", "Geri dönüştürülmüş polietilen"]],
  }),
  product({
    slug: "orta-banyo-paspasi", number: "Nº 24", name: "Orta — Banyo Paspası", brand: "nuvessa-home",
    material: "Pamuk · kaymaz taban", materials: ["Kumaş"], image: null, imageAlt: "Banyo paspası için çizgi illüstrasyon", tone: "stone",
    categorySlug: "banyo", description: `Hızlı emen, kaymaz tabanlı pamuklu paspas. ${demoNote}`,
    worlds: ["soft-living"], rooms: ["banyo"], searchTerms: "banyo paspası paspas kaymaz banyo halısı",
    icon: "rug", rank: 24, createdAt: "2026-11-01",
    variants: [v("orta-krem", "Krem", 89000, 44, "Krem"), v("orta-antrasit", "Antrasit", 89000, 31, "Antrasit")],
    specs: [["Ölçü", "50 × 80 cm"], ["Malzeme", "%100 pamuk"], ["Taban", "Kaymaz lateks"]],
  }),
  product({
    slug: "elin-calisma-masasi", number: "Nº 25", name: "Elin — Çalışma Masası", brand: "nuvessa-home",
    material: "Meşe kaplama · çelik ayak", materials: ["Ahşap", "Metal"], image: null, imageAlt: "Çalışma masası için çizgi illüstrasyon", tone: "stone",
    categorySlug: "ev-ofisi", categorySlugs: ["mobilya"], description: `Kablo geçişli, sade çizgili ev ofisi masası. ${demoNote}`,
    worlds: ["modern-form", "soft-living"], rooms: ["calisma-odasi"], searchTerms: "çalışma masası calisma masasi ofis masası ev ofisi masa bilgisayar",
    icon: "desk", rank: 25, createdAt: "2026-10-27",
    variants: [v("elin-120", "120 × 60 cm", 1499000, 9, "Doğal"), v("elin-140", "140 × 70 cm", 1799000, 5, "Doğal")],
    specs: [["Ölçü", "120×60 / 140×70 cm"], ["Yükseklik", "74 cm"], ["Malzeme", "Meşe kaplama MDF, çelik ayak"], ["Kablo geçişi", "Var"]],
  }),
  product({
    slug: "kapi-antre-askiligi", number: "Nº 26", name: "Eşya — Duvar Askılığı", brand: "nuvessa-atelier",
    material: "Masif ceviz · 5 askı", materials: ["Ahşap"], image: null, imageAlt: "Duvar askılığı için çizgi illüstrasyon", tone: "wine",
    categorySlug: "antre", description: `Antre için sade, masif ahşap duvar askılığı. ${demoNote}`,
    worlds: ["heritage", "modern-form"], rooms: ["antre"], searchTerms: "askılık portmanto antre askı duvar askısı giriş",
    icon: "hanger", rank: 26, createdAt: "2026-10-29",
    variants: [v("askilik-ceviz", "Ceviz", 219000, 16, "Ceviz")],
    specs: [["Askı sayısı", "5"], ["Genişlik", "80 cm"], ["Malzeme", "Masif ceviz"], ["Taşıma kapasitesi", "15 kg"]],
  }),
  product({
    slug: "luma-akilli-ampul-seti", number: "Nº 27", name: "Luma — Akıllı Ampul Seti", brand: "nuvessa-essentials",
    material: "LED · Wi-Fi · 3'lü", materials: ["Plastik"], image: null, imageAlt: "Akıllı ampul seti için çizgi illüstrasyon", tone: "ink",
    categorySlug: "akilli-ev", categorySlugs: ["aydinlatma"], description: `Renk ve parlaklığı telefondan ayarlanan LED ampul seti. ${demoNote}`,
    worlds: ["modern-form"], rooms: ["salon", "yatak-odasi"], searchTerms: "akıllı ampul akilli ampul led ampul wifi aydınlatma akıllı ev",
    icon: "plug", rank: 27, createdAt: "2026-11-09",
    variants: [v("luma-3", "3'lü set", 179000, 24)],
    specs: [["Duy", "E27"], ["Güç", "9 W"], ["Bağlantı", "Wi-Fi"], ["Renk", "16 milyon renk + beyaz tonları"]],
  }),
  product({
    slug: "bahar-balkon-sandalye-seti", number: "Nº 28", name: "Bahar — Balkon Sandalye Seti", brand: "nuvessa-home",
    material: "Alüminyum · katlanır · 2'li", materials: ["Metal"], image: null, imageAlt: "Balkon sandalye seti için çizgi illüstrasyon", tone: "sage",
    categorySlug: "balkon-bahce", categorySlugs: ["mobilya"], description: `Hafif, katlanır, dış mekâna uygun sandalye ikilisi. ${demoNote}`,
    worlds: ["soft-living"], rooms: ["balkon", "bahce"], searchTerms: "balkon sandalyesi bahçe sandalyesi katlanır sandalye dış mekan balkon bahçe",
    icon: "chair", rank: 28, createdAt: "2026-10-24",
    variants: [v("bahar-adacayi", "Adaçayı", 349000, 13, "Adaçayı"), v("bahar-antrasit", "Antrasit", 349000, 10, "Antrasit")],
    specs: [["Set içeriği", "2 sandalye"], ["Malzeme", "Alüminyum iskelet, tekstilen oturum"], ["Taşıma kapasitesi", "120 kg"], ["Katlanır", "Evet"]],
  }),
  product({
    slug: "mini-cocuk-gece-lambasi", number: "Nº 29", name: "Mini — Çocuk Gece Lambası", brand: "nuvessa-home",
    material: "Silikon · şarjlı", materials: ["Plastik"], image: null, imageAlt: "Çocuk gece lambası için çizgi illüstrasyon", tone: "stone",
    categorySlug: "cocuk-odasi", categorySlugs: ["aydinlatma"], description: `Dokununca ışığı değişen, şarjlı yumuşak silikon gece lambası. ${demoNote}`,
    worlds: ["soft-living"], rooms: ["cocuk-odasi"], searchTerms: "gece lambası çocuk lambası bebek odası aydınlatma silikon",
    icon: "lamp", rank: 29, createdAt: "2026-11-10",
    variants: [v("mini-krem", "Krem", 119000, 21, "Krem"), v("mini-adacayi", "Adaçayı", 119000, 19, "Adaçayı")],
    specs: [["Güç kaynağı", "USB-C şarj"], ["Çalışma süresi", "12 saat"], ["Malzeme", "Gıda sınıfı silikon"], ["Sıcaklık", "Dokunmatik 3 kademe"]],
  }),
  product({
    slug: "fon-heykelsi-sehpa", number: "Nº 30", name: "Fon — Heykelsi Sehpa", brand: "nuvessa-atelier",
    material: "Mat mor lake · ahşap", materials: ["Ahşap"], image: null, imageAlt: "Heykelsi sehpa için çizgi illüstrasyon", tone: "ink",
    categorySlug: "mobilya", categorySlugs: ["dekorasyon"], description: `Akışkan formlu, sanat objesi gibi duran yan sehpa. ${demoNote}`,
    worlds: ["art-house"], rooms: ["salon"], searchTerms: "sehpa yan sehpa heykelsi sanatsal tasarım mobilya mor",
    icon: "table", rank: 30, createdAt: "2026-11-11",
    variants: [v("fon-mor", "Mor", 1899000, 0, "Mor")],
    specs: [["Ölçü", "55 × 45 × 48 cm"], ["Yüzey", "Mat lake"], ["Malzeme", "Masif ahşap gövde"]],
  }),
];

export const catalogProducts = seedProducts;

export type { Tone };
