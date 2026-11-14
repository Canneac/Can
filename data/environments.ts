/**
 * Ana sayfa girişinin "20 ortamı". Giriş açılır açılmaz oynar ve ortamlar arasında kendiliğinden dönüşür.
 *
 * DÜRÜST NOT: Elimizde yalnızca 1 gerçek video (Pexels lisanslı) ve 7 editoryal fotoğraf var.
 * 1. ortam gerçek videodur; diğerleri aynı fotoğrafların FARKLI KADRAJLARI (yakın plan/ayrıntı) olup
 * yavaş yakınlaşma ile hareketlendirilir. Daha çok gerçek video eklendikçe `kind: "video"` ile
 * buraya eklenir; bileşende değişiklik gerekmez.
 */
export type Environment = {
  id: string;
  name: string;
  kind: "video" | "image";
  src: string;
  /** Video için ilk kare görseli */
  poster?: string;
  /** Odak noktası (%): kadraj ve yakınlaşma buraya yapılır */
  focus: [number, number];
  /** 1 = tam kadraj; büyük sayı = yakın plan */
  zoom: number;
  seconds: number;
  /** "Bu ortamdaki ürünler" bağlantısı */
  href: string;
};

const sofa = "/images/sofa-gallery.png";
const salon = "/images/salon-editorial.png";
const vase = "/images/vase-bordeaux.png";
const bowl = "/images/sculptural-bowl.png";
const cutlery = "/images/cutlery-gallery.png";
const bin = "/images/waste-bin-gallery.png";
const dusk = "/images/private-gallery-hero.png";

export const environments: Environment[] = [
  { id: "yasam-odasi", name: "Yaşam odası — gün ışığı", kind: "video", src: "/video/living-room.mp4", poster: "/images/living-room-poster.jpg", focus: [50, 55], zoom: 1, seconds: 8, href: "/shop?dept=mobilya" },
  { id: "kanepe", name: "Salon — bouclé kanepe", kind: "image", src: sofa, focus: [50, 60], zoom: 1, seconds: 5, href: "/shop?dept=mobilya" },
  { id: "lambader", name: "Kemerli lambader", kind: "image", src: sofa, focus: [80, 26], zoom: 1.6, seconds: 5, href: "/shop?dept=aydinlatma" },
  { id: "duvar-sanati", name: "Duvar sanatı", kind: "image", src: sofa, focus: [60, 24], zoom: 1.55, seconds: 5, href: "/shop?dept=dekorasyon" },
  { id: "sehpa-ustu", name: "Sehpa üstü", kind: "image", src: sofa, focus: [28, 68], zoom: 1.7, seconds: 5, href: "/shop?dept=dekorasyon" },
  { id: "antre", name: "Antre — büyük ayna", kind: "image", src: salon, focus: [50, 50], zoom: 1, seconds: 5, href: "/shop?dept=mobilya" },
  { id: "berjer", name: "Bordo kadife berjer", kind: "image", src: salon, focus: [82, 74], zoom: 1.7, seconds: 5, href: "/shop?dept=mobilya" },
  { id: "konsol", name: "Konsol ve heykel", kind: "image", src: salon, focus: [56, 52], zoom: 1.7, seconds: 5, href: "/shop?dept=dekorasyon" },
  { id: "ayna", name: "Antik ayna", kind: "image", src: salon, focus: [17, 45], zoom: 1.6, seconds: 5, href: "/shop?dept=dekorasyon" },
  { id: "pencere", name: "Zeytin ağacı penceresi", kind: "image", src: salon, focus: [92, 36], zoom: 1.7, seconds: 5, href: "/shop?dept=mobilya" },
  { id: "seramik-vazo", name: "Seramik vazo", kind: "image", src: vase, focus: [50, 50], zoom: 1, seconds: 5, href: "/shop?dept=dekorasyon" },
  { id: "tas-kaide", name: "Taş kaide", kind: "image", src: vase, focus: [50, 82], zoom: 1.6, seconds: 5, href: "/shop?dept=dekorasyon" },
  { id: "heykelsi-kase", name: "Heykelsi kâse", kind: "image", src: bowl, focus: [50, 50], zoom: 1, seconds: 5, href: "/shop?dept=dekorasyon" },
  { id: "bronz-yuzey", name: "Bronz yüzey", kind: "image", src: bowl, focus: [52, 46], zoom: 1.7, seconds: 5, href: "/shop?dept=dekorasyon" },
  { id: "sofra", name: "Sofra — keten örtü", kind: "image", src: cutlery, focus: [50, 55], zoom: 1, seconds: 5, href: "/shop?dept=mutfak" },
  { id: "catal-kasik", name: "Çatal ve kaşık", kind: "image", src: cutlery, focus: [40, 58], zoom: 1.6, seconds: 5, href: "/shop?dept=mutfak" },
  { id: "kadeh", name: "Sofrada çiçek ve kadeh", kind: "image", src: cutlery, focus: [86, 20], zoom: 1.7, seconds: 5, href: "/shop?dept=mutfak" },
  { id: "mutfak", name: "Mutfak — günlük ihtiyaçlar", kind: "image", src: bin, focus: [50, 55], zoom: 1, seconds: 5, href: "/shop?dept=temizlik" },
  { id: "tezgah", name: "Mutfak tezgâhı", kind: "image", src: bin, focus: [76, 24], zoom: 1.6, seconds: 5, href: "/shop?dept=mutfak" },
  { id: "aksam-salonu", name: "Akşam salonu", kind: "image", src: dusk, focus: [60, 55], zoom: 1, seconds: 5, href: "/shop?dept=mobilya" },
];
