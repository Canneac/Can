export type HomeCollection = {
  number: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  href: string;
  className: string;
};

export type FeaturedObject = {
  number: string;
  name: string;
  material: string;
  priceInKurus: number;
  image: string;
  imageAlt: string;
  tone: "stone" | "wine" | "shadow";
};

export const homeCollections: HomeCollection[] = [
  {
    number: "01",
    title: "Vazolar",
    subtitle: "Biçimin sessiz ifadesi",
    image: "/images/vase-bordeaux.png",
    imageAlt: "Fildişi taş kaide üzerinde heykelsi bordo bir vazo",
    href: "#secim",
    className: "collection-card--vase",
  },
  {
    number: "02",
    title: "Heykelsi objeler",
    subtitle: "Mekâna ait bir imza",
    image: "/images/sculptural-bowl.png",
    imageAlt: "Bordo duvar önünde heykelsi bronz kâse",
    href: "#secim",
    className: "collection-card--objects",
  },
  {
    number: "03",
    title: "Mekân hikâyeleri",
    subtitle: "Bir arada düşünülmüş parçalar",
    image: "/images/salon-editorial.png",
    imageAlt: "Bordo koltuk ve antik bronz aynayla kurgulanmış sakin bir salon",
    href: "#mekan",
    className: "collection-card--rooms",
  },
];

// Fiyatlar ve nesne bilgileri yalnızca tasarım demosu için örnektir.
export const featuredObjects: FeaturedObject[] = [
  {
    number: "Nº 01",
    name: "Aren — Form Vazo",
    material: "Seramik · bordo",
    priceInKurus: 1280000,
    image: "/images/vase-bordeaux.png",
    imageAlt: "Bordo seramik vazonun galeri nişindeki görünümü",
    tone: "stone",
  },
  {
    number: "Nº 02",
    name: "Neroli — Dekor Kâsesi",
    material: "Bronz ton · taş kaide",
    priceInKurus: 1840000,
    image: "/images/sculptural-bowl.png",
    imageAlt: "Taş konsol üzerindeki heykelsi dekor kâsesi",
    tone: "wine",
  },
  {
    number: "Nº 03",
    name: "Eşik — Salon Kompozisyonu",
    material: "Ayna · ceviz · tekstil",
    priceInKurus: 960000,
    image: "/images/salon-editorial.png",
    imageAlt: "Güneş ışığı alan, bordo vurgulu editoryal salon",
    tone: "shadow",
  },
];
