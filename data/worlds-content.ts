/** Her tasarım dünyasının görsel kimliği ve editoryal metni. (İleride yönetici panelinden yönetilecek.) */
export type WorldContent = {
  image: string;
  imageAlt: string;
  kicker: string;
  headline: string;
  intro: string;
  palette: { name: string; hex: string }[];
  highlights: string[];
};

export const WORLD_CONTENT: Record<string, WorldContent> = {
  "modern-form": {
    image: "/images/salon-editorial.png",
    imageAlt: "Kemerli duvar, büyük ayna ve gün ışığı alan çağdaş salon",
    kicker: "01 / ÇAĞDAŞ MİMARİ",
    headline: "Net çizgi. Dengeli form.",
    intro: "Geometrik formlar, cam ve metal detaylar, minimalist mobilyalar. Mekânı sadeleştiren, mimariyle konuşan parçalar.",
    palette: [{ name: "Petrol", hex: "#1f4f5a" }, { name: "Buz mavisi", hex: "#cfe0e6" }, { name: "Antrasit", hex: "#2a2e32" }, { name: "Kırık beyaz", hex: "#f4f3ef" }],
    highlights: ["Modern koltuk ve sehpalar", "Metal ve cam aydınlatma", "Akıllı ev ve elektrikli aletler"],
  },
  "soft-living": {
    image: "/images/sofa-gallery.png",
    imageAlt: "Doğal ışıkta yumuşak dokulu bouclé kanepe",
    kicker: "02 / SICAKLIK VE HUZUR",
    headline: "Yumuşak doku. Sakin yaşam.",
    intro: "Doğal ışık, keten, ahşap ve organik formlar. Evde nefes almayı kolaylaştıran sıcak, rahat parçalar.",
    palette: [{ name: "Krem", hex: "#f1e8d6" }, { name: "Kum beji", hex: "#d9c8a8" }, { name: "Açık ahşap", hex: "#c39a6b" }, { name: "Adaçayı", hex: "#a9b39a" }],
    highlights: ["Nevresim, halı ve havlular", "Seramik mutfak ürünleri", "Doğal dokulu depolama"],
  },
  heritage: {
    image: "/images/vase-bordeaux.png",
    imageAlt: "Taş kaide üzerinde bordo seramik vazo",
    kicker: "03 / ZAMANSIZ PRESTİJ",
    headline: "Derin ton. Kalıcı zarafet.",
    intro: "Ceviz ahşap, kaliteli döşemeler ve ince detaylar. Klasik değerleri çağdaş bir sadelikle yorumlayan seçki.",
    palette: [{ name: "Bordo", hex: "#5a2230" }, { name: "Espresso", hex: "#2b1b17" }, { name: "Ceviz", hex: "#5b3d2b" }, { name: "Fildişi", hex: "#efe6d6" }],
    highlights: ["Yemek masaları ve koltuklar", "Sofra ve servis takımları", "Dekoratif aydınlatma"],
  },
  "art-house": {
    image: "/images/sculptural-bowl.png",
    imageAlt: "Bordo duvar önünde heykelsi bronz kâse",
    kicker: "04 / YARATICI İFADE",
    headline: "Cesur form. Sanatsal ev.",
    intro: "Heykelsi mobilyalar, özgün formlar ve deneysel tasarım. Evi sergiye değil, kişisel bir ifadeye dönüştüren parçalar.",
    palette: [{ name: "Derin mor", hex: "#3b2455" }, { name: "Gece mavisi", hex: "#161a3a" }, { name: "Koyu nötr", hex: "#1c1b1f" }, { name: "Vurgu", hex: "#d96bff" }],
    highlights: ["Tasarım lambalar", "Heykelsi sehpalar", "Sanatsal aksesuarlar"],
  },
};
