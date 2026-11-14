/**
 * Ana sayfa girişinin 20 ortamı — hepsi gerçek video (Pexels, ücretsiz lisans: ticari kullanım serbest,
 * atıf zorunlu değil). Giriş açılır açılmaz oynar ve ortamlar arasında kendiliğinden dönüşür.
 * Dosyalar: public/video/ortamlar/ortam-NN.mp4 (+ aynı adlı .jpg poster). Kaynaklar: docs/MEDIA.md
 * Yeni ortam eklemek için buraya bir satır eklemek yeterlidir.
 */
export type Environment = {
  id: string;
  name: string;
  src: string;
  /** Video yüklenene kadar görünen ilk kare */
  poster: string;
  /** Bu ortamın ekranda kalma süresi (saniye); video bundan kısaysa başa sarar */
  seconds: number;
  /** "Bu ortamdaki ürünler" bağlantısı */
  href: string;
};

export const environments: Environment[] = [
  { id: "ortam-01", name: "Yaşam odası — gün ışığı", src: "/video/ortamlar/ortam-01.mp4", poster: "/video/ortamlar/ortam-01.jpg", seconds: 8, href: "/shop?dept=mobilya" },
  { id: "ortam-02", name: "Beyaz mutfak — ada tezgâh", src: "/video/ortamlar/ortam-02.mp4", poster: "/video/ortamlar/ortam-02.jpg", seconds: 10, href: "/shop?dept=mutfak" },
  { id: "ortam-03", name: "Klasik mutfak — ankastre fırın", src: "/video/ortamlar/ortam-03.mp4", poster: "/video/ortamlar/ortam-03.jpg", seconds: 7, href: "/shop?dept=mutfak" },
  { id: "ortam-04", name: "Salon — gri köşe koltuk", src: "/video/ortamlar/ortam-04.mp4", poster: "/video/ortamlar/ortam-04.jpg", seconds: 10, href: "/shop?dept=mobilya" },
  { id: "ortam-05", name: "Cam kapılı oturma alanı", src: "/video/ortamlar/ortam-05.mp4", poster: "/video/ortamlar/ortam-05.jpg", seconds: 10, href: "/shop?dept=mobilya" },
  { id: "ortam-06", name: "Mutfak ve yemek köşesi", src: "/video/ortamlar/ortam-06.mp4", poster: "/video/ortamlar/ortam-06.jpg", seconds: 10, href: "/shop?dept=mutfak" },
  { id: "ortam-07", name: "Beyaz yemek alanı — ahşap masa", src: "/video/ortamlar/ortam-07.mp4", poster: "/video/ortamlar/ortam-07.jpg", seconds: 10, href: "/shop?dept=mobilya" },
  { id: "ortam-08", name: "Loft yemek odası", src: "/video/ortamlar/ortam-08.mp4", poster: "/video/ortamlar/ortam-08.jpg", seconds: 10, href: "/shop?dept=mobilya" },
  { id: "ortam-09", name: "Yemek odası — ahşap masa ve ayna", src: "/video/ortamlar/ortam-09.mp4", poster: "/video/ortamlar/ortam-09.jpg", seconds: 10, href: "/shop?dept=mobilya" },
  { id: "ortam-10", name: "Geniş yemek ve oturma alanı", src: "/video/ortamlar/ortam-10.mp4", poster: "/video/ortamlar/ortam-10.jpg", seconds: 10, href: "/shop?dept=mobilya" },
  { id: "ortam-11", name: "Sarkıt avizeli yemek alanı", src: "/video/ortamlar/ortam-11.mp4", poster: "/video/ortamlar/ortam-11.jpg", seconds: 9, href: "/shop?dept=aydinlatma" },
  { id: "ortam-12", name: "Yatak odası", src: "/video/ortamlar/ortam-12.mp4", poster: "/video/ortamlar/ortam-12.jpg", seconds: 7, href: "/shop?dept=tekstil" },
  { id: "ortam-13", name: "Banyo — bağımsız küvet", src: "/video/ortamlar/ortam-13.mp4", poster: "/video/ortamlar/ortam-13.jpg", seconds: 10, href: "/shop?dept=banyo" },
  { id: "ortam-14", name: "Panoramik pencereli salon", src: "/video/ortamlar/ortam-14.mp4", poster: "/video/ortamlar/ortam-14.jpg", seconds: 10, href: "/shop?dept=mobilya" },
  { id: "ortam-15", name: "Koridor — sıcak aydınlatma", src: "/video/ortamlar/ortam-15.mp4", poster: "/video/ortamlar/ortam-15.jpg", seconds: 7, href: "/shop?dept=aydinlatma" },
  { id: "ortam-16", name: "Çalışma masası", src: "/video/ortamlar/ortam-16.mp4", poster: "/video/ortamlar/ortam-16.jpg", seconds: 10, href: "/shop?dept=mobilya" },
  { id: "ortam-17", name: "Teras — dış mekân koltukları", src: "/video/ortamlar/ortam-17.mp4", poster: "/video/ortamlar/ortam-17.jpg", seconds: 10, href: "/shop?dept=balkon-bahce" },
  { id: "ortam-18", name: "Mutfak — granit tezgâh", src: "/video/ortamlar/ortam-18.mp4", poster: "/video/ortamlar/ortam-18.jpg", seconds: 10, href: "/shop?dept=mutfak" },
  { id: "ortam-19", name: "Salon — mavi koltuklar", src: "/video/ortamlar/ortam-19.mp4", poster: "/video/ortamlar/ortam-19.jpg", seconds: 10, href: "/shop?dept=mobilya" },
  { id: "ortam-20", name: "Mutfak — çelik evye ve buzdolabı", src: "/video/ortamlar/ortam-20.mp4", poster: "/video/ortamlar/ortam-20.jpg", seconds: 10, href: "/shop?dept=mutfak" },
];
