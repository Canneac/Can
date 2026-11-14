/**
 * Shop the Room sahneleri. Noktalar görselin yüzde koordinatlarıdır; görsel yeniden boyutlansa da
 * kaymaz. Her nokta gerçek bir katalog ürününe bağlıdır. (İleride yönetici panelinden yönetilecek.)
 */
export type SceneHotspot = { id: string; x: number; y: number; productSlug: string; label: string };
export type Scene = { slug: string; room: string; title: string; image: string; alt: string; width: number; height: number; hotspots: SceneHotspot[] };

export const scenes: Scene[] = [
  {
    slug: "salon-gun-isigi", room: "salon", title: "Gün ışıklı salon",
    image: "/images/sofa-gallery.png", alt: "Gün ışığı alan salonda fildişi bouclé kanepe, ceviz sehpa ve bronz lambader", width: 1536, height: 1024,
    hotspots: [
      { id: "kanepe", x: 63, y: 57, productSlug: "sera-boucle-kanepe", label: "Kanepe" },
      { id: "lambader", x: 79, y: 25, productSlug: "halo-bronz-lambader", label: "Lambader" },
      { id: "vazo", x: 24, y: 63, productSlug: "aren-form-vazo", label: "Vazo" },
      { id: "kase", x: 32, y: 72, productSlug: "neroli-dekor-kasesi", label: "Dekor kâsesi" },
    ],
  },
  {
    slug: "salon-berjer", room: "salon", title: "Işıkla dolan antre salonu",
    image: "/images/salon-editorial.png", alt: "Bordo berjer, büyük ayna ve ceviz konsolla kurgulanmış gün ışıklı salon", width: 1536, height: 1024,
    hotspots: [
      { id: "berjer", x: 81, y: 72, productSlug: "dora-kadife-berjer", label: "Kadife berjer" },
      { id: "obje", x: 57, y: 50, productSlug: "neroli-dekor-kasesi", label: "Heykelsi obje" },
      { id: "kompozisyon", x: 20, y: 40, productSlug: "esik-salon-kompozisyonu", label: "Ayna ve konsol seti" },
    ],
  },
];

export function sceneBySlug(slug: string) {
  return scenes.find((scene) => scene.slug === slug);
}
