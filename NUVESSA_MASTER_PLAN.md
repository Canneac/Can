# NUVESSA — Ana Proje Planı (kalıcı çalışma belgesi)

Bu belge, proje sahibinin uzun vadeli isteklerinin kalıcı özetidir. Kararlar değiştiğinde **bu dosya güncellenir**; eski kararlarla çelişen yeni karar önce buraya yazılır. Durum çizelgesi en altta, her aşama sonunda güncellenir.

- Çalışma klasörü: `C:\Users\Can\Documents\Codex\2026-11-12\sela` (doğrulandı; `localhost:3000` bu klasörü sunuyor)
- Teknoloji: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · yerel SQLite (`node:sqlite`)
- Marka adı: **NUVESSA** (değiştirilmez). Tescil/marka hukuku incelemesi gerçek satış ve büyük reklam öncesi **zorunlu risk maddesidir**; marka tescilliymiş gibi gösterilmez.

## 1. Vizyon

NUVESSA; evin küçük/büyük hemen her ihtiyacını (mobilya, beyaz eşya, mutfak, sofra, tekstil, banyo, temizlik, depolama, aydınlatma, dekorasyon, balkon-bahçe, çocuk, ev ofisi, antre, akıllı ev, sezonluk) karşılayan; modern, zarif, farklı bütçelere açık, uluslararası büyümeyi hedefleyen bir ev ve yaşam e-ticaret markasıdır.

- **Lüks dekorasyon butiği DEĞİLDİR.** "Çöp kovası", "mutfak süngeri" de satılabilmeli; ucuz ürün kalitesiz görünmemeli, pahalı ürün sahte pazarlama diliyle sunulmamalı.
- İki karakter: **etkileyici marka vitrini** (ana sayfa, dünyalar) + **kusursuz alışveriş** (liste, arama, sepet, ödeme, hesap: sade, hızlı, net fiyat).
- Başlangıç modeli: **tek satıcılı perakende** (çok satıcılı pazaryeri değil). Marka/tedarikçi yapıları altyapıda vardır; gerçek anlaşma olmadan yetkili satıcı/sponsor iddiası yapılmaz.

## 2. Tasarım sistemi

- Ana renkler: espresso, koyu bordo, sıcak siyah, kırık beyaz, fildişi, krem, kontrollü şampanya. Tüm site siyah-bordo galeriye **dönüşmez**; açık, nefes alan alanlar korunur.
- Eski referans değerleri (zorunlu değil): `#111111`, `#FAFAFA`, `#C5A059`, `#888888`.
- Tipografi: serif başlık (Cormorant Garamond) + okunur sans arayüz (Manrope). Küçük menü yazısı, amaçsız boşluk, aşırı animasyon, her yerde aynı kart düzeni, gereksiz altın süs **istenmez**.
- Marka varlıkları: `public/brand/logos/`, `config/brand.ts`.

## 3. Tek site, dört tasarım dünyası

Dört ayrı site değil; ortak katalog, üyelik, sepet, ödeme. Her dünya **kendi kompozisyonuna** sahip olmalı (yalnızca renk değişimi yetmez).

| Dünya | Adres | Karakter | Renkler |
|---|---|---|---|
| Modern Form | `/worlds/modern-form` | Çağdaş mimari, geometri, cam/metal, net formlar | petrol mavisi, buz mavisi, antrasit, kırık beyaz |
| Soft Living | `/worlds/soft-living` | Sıcak, huzurlu, doğal doku, keten, ahşap | krem, kum beji, açık ahşap, adaçayı |
| Heritage | `/worlds/heritage` | Zamansız, klasik, ceviz, prestij (eski moda değil) | koyu bordo, espresso, ceviz, fildişi, şampanya |
| Art House | `/worlds/art-house` | Heykelsi, deneysel, asimetrik, sanatsal ama satılabilir | derin mor, gece mavisi, koyu nötr, canlı vurgu |

## 4. Üç keşif yolu + arama

1. Tasarım dünyasına göre (`/worlds`) 2. Kategoriye göre (`/shop`, `/categories/[slug]`) 3. Odaya göre (`/rooms`: salon, mutfak, yemek odası, yatak odası, banyo, çocuk odası, çalışma odası, antre, balkon, bahçe).
Arama: Türkçe karakter duyarsız (cop kovasi = çöp kovası), eş anlamlı destek, gerçek veriyle çalışır; sıralama: ilgililik, fiyat artan/azalan, yeni gelenler; **sahte popülerlik verisi yok**.

## 5. Ürün kapsamı (başlangıç; kod içine sabitlenmez)

Kategoriler/alt kategoriler/odalar **veritabanında** tutulur, yönetici panelinden eklenir/düzenlenir. Bir ürün birden çok kategori, oda ve dünyayla ilişkilenebilir.

A Mobilya · B Mutfak · C Sofra ve servis · D Küçük elektrikli aletler · E Beyaz eşya · F Ev tekstili · G Banyo · H Temizlik ve günlük ihtiyaçlar · I Depolama ve organizasyon · J Aydınlatma · K Dekorasyon · L Balkon ve bahçe · M Çocuk ve bebek odası · N Ev ofisi · O Antre · P Akıllı ev · R Sezonluk.
(Ayrıntılı alt ürün listeleri proje sahibinin devir metnindedir; katalog genişledikçe kategorilere alt kategori olarak eklenir.)

Ürün kartı: görsel, ad, marka, fiyat, (gerçekse) indirim, stok, favori, detay, uygun olunca sepete ekle. Ürün detayı: galeri, açıklama, fiyat, renk/ölçü varyantı, stok, adet, sepete ekle, teslimat/iade, **ürün grubuna özel** teknik özellikler (koltuk: ölçü/kumaş/kapasite; buzdolabı: hacim/enerji sınıfı; çöp kovası: kapasite/malzeme/kapak; nevresim: kumaş/ölçü/set; tencere: çap/hacim/malzeme/ocak uyumu), ilgili ürünler.
Demo katalog: önce 24–32, sonra 100–120 ürün. Demo ürünler **yönetilebilir/silinebilir**, "demo" olarak etiketli; sahte stok/indirim/marka iddiası yok.

## 6. Dünya renkli sepet (özgün özellik — unutulmayacak)

- Her **sepet satırı** eklendiği dünyayı hatırlar: `productId`, `variantId`, `quantity`, `sourceWorld` (+ gerekli alanlar). Satır kendi dünyasının hafif gradyanını taşır; sepetin tamamı son dünyaya boyanmaz. `/shop`'tan eklenen = nötr NUVESSA teması.
- Aynı ürün iki dünyadan eklenirse **iki ayrı satır** (tutarlı kural).
- Kaynak dünya CSS state değildir: sayfa yenilenince korunur (kalıcı), siparişe taşınır, hesap varsa sepetle ilişkilendirilir.
- Fiyat ve toplamlar **sunucuda yeniden doğrulanır**; tarayıcıdaki fiyata güvenilmez.
- Okunabilirlik gradyandan önce gelir. Mobilde de korunur.

## 7. Shop the Room

2D hotspot sistemi (ağır 3D yok): oda fotoğrafı + gerçek katalog ürünlerine bağlı noktalar; mobil dokunma, yeniden boyutlandırmada kaymama, doğru stok/fiyat, detay sayfasına gitme, sepete ekleme.

## 8. Hesap, favoriler, ödeme, sipariş

- Hesap: kayıt, giriş, çıkış, güvenli oturum, profil, adres, favori, sipariş geçmişi, şifre sıfırlama; misafir alışverişi desteklenir. Favoriler gerçek kalıcı veridir (misafir: yerel; üye: veritabanı).
- **Şimdilik gerçek ödeme YOK.** Demo akış: sepet → özet → teslimat → demo ödeme → onay → sipariş no → admin'e düşer. Her adımda "DEMO, para çekilmez" yazar. Ödeme katmanı ileride sağlayıcı (iyzico, PayTR vb.) eklemeye uygun soyutlanır; şirket/sağlayıcı bilgisi oluşmadan canlı entegrasyon varmış gibi davranılmaz.
- Sipariş güvenliği: sunucuda fiyat/stok doğrulama, güvenilir toplam, sipariş satırında **fiyat anlık görüntüsü**, çift sipariş önleme (idempotency), güvenli durum geçişleri.

## 9. Yönetici paneli (`/admin`)

Halka açık değil; güvenli giriş. Ürün (ekle/güncelle/arşivle/fiyat/stok/görsel/varyant/kategori/marka/dünya/oda), kategori (ekle/alt kategori/sıra/görünürlük), sipariş (liste/detay/durum/demo ayrımı), marka–tedarikçi kayıtları; ileride banner, dünya görselleri, kampanya, Shop the Room sahneleri, editoryal içerik.

## 10. Teknik ilkeler

- Sıfırdan kurulum yok; mevcut proje üzerinden ilerlenir; `git reset --hard` gibi yıkıcı işlem yok.
- Veri katmanı depo (repository) arkasında; SQLite şimdilik yerel/demo içindir, barındırmada kalıcı veritabanına geçiş ayrıca planlanır (bkz. Riskler).
- Migration ve demo seed güvenli, sürümlü, yedekli, kayıt silmeyen.
- Gizli bilgiler yalnızca `.env*` (Git dışı); koda yazılmaz.
- SEO (meta, sitemap, canonical, ürün structured data), erişilebilirlik, performans, i18n/çoklu para birimine engel olmayan yapı; öncelik Türkçe + Türkiye.
- Video: gerçek video ≠ CSS animasyonu (ayrı raporlanır); sessiz/inline/poster; `prefers-reduced-motion`'a saygı; mobilde ağır olmamalı; yalnızca lisanslı medya (Pexels lisansı vb.).

## 11. Onay kapıları

Güvenli ve geri alınabilir işlemler için onay beklenmez. **Önce onay alınır:** veri silme, büyük mimari değişiklik (ör. veritabanı motoru değişimi), ücretli servis, internete yayınlama / GitHub'a gönderme.

## 12. Riskler ve dürüstlük notları

- NUVESSA adının Türkiye/uluslararası marka uygunluğu doğrulanmadı.
- KVKK, mesafeli satış, ön bilgilendirme, iade/iptal, fatura/vergi, çerez/gizlilik, şirket bilgileri gerçek ticaret öncesi doğrulanmalı; sahte şirket/vergi/hukuki beyan üretilmez.
- Şu an elde yalnızca 7 fotoğraf ve 1 lisanslı video var; çoğu demo ürün **fotoğrafsız** (çizgi ikonlu panel). Gerçek/lisanslı ürün fotoğrafları gereklidir.
- `node:sqlite` dosyası Vercel gibi sunucusuz ortamda kalıcı değildir; yatırımcı demosu için barındırma + kalıcı veritabanı kararı onay gerektirir.
- Yatırımcıya sahte müşteri/satış/anlaşma gösterilmez.

## 13. Yol haritası ve durum

| # | Aşama | Durum |
|---|---|---|
| 0 | Kod tabanı tespiti, geri dönüş noktası | ✅ Tamamlandı |
| 1 | `/shop` yenileme | ✅ Hero, gezinme, kategori, filtre (marka/renk/malzeme/stok/fiyat), kartlar |
| 4a | Katalog modeli (marka, renk, stok, özellik, oda, varyant) | ✅ 30 demo ürün, 17 kategori, 10 oda, 4 marka hattı; SQLite, sürümlü ve yedekli tohum |
| 4b | Ürün detayı | ✅ Varyant, stok, adet, sepete ekle, özellikler, ilgili ürünler. ⏳ Çoklu galeri/yakınlaştırma (tek görsel var) |
| 5a | Dünya renkli kalıcı sepet + sunucu doğrulama | ✅ |
| 5b | Demo ödeme + sipariş kaydı | ✅ Idempotent, stok düşer, fiyat anlık görüntüsü |
| 6 | Admin paneli | ✅ Güvenli giriş, ürün/stok/fiyat, kategori, marka, sipariş. ⏳ Tedarikçi kaydı, banner/sahne yönetimi |
| 2 | Ana sayfa | ✅ Gerçek video, dört dünya, kategori, yeni gelenler, Shop the Room, günlük ihtiyaçlar, odalar, footer |
| 3 | Dört dünya | ✅ Ayrı yerleşimler + renk perdesi geçişi. ⏳ Dünya başına ayrı video/fotoğraf (yalnızca 1 lisanslı video ve 7 fotoğraf var) |
| 7 | Shop the Room | ✅ Ana sayfada 2 sahne / 7 hotspot kodda tanımlı (`data/scenes.ts`). `/rooms` sayfaları sadeleştirme kararıyla kaldırıldı (bkz. karar günlüğü). ⏳ Sahne yönetimi admin'den |
| — | Hesap/üyelik | ✅ Kayıt, giriş, çıkış, güvenli oturum, profil + adres, sipariş geçmişi, hesaba kayıtlı favoriler, ödeme ön doldurma. ⏳ Şifre sıfırlama (e-posta gönderimi gerekir), çoklu adres |
| — | `/categories/[slug]`, `/search`, sitemap, canonical | ⏳ (`/shop?category=` ve `/shop?q=` çalışıyor) |
| 8 | Kalite: erişilebilirlik, performans, güvenlik denetimi | ⏳ Temel kontroller var; derin denetim yapılmadı |
| 9 | Yatırımcı demosu: GitHub, hosting, HTTPS | ⏳ **Onay gerekir** (SQLite sunucusuz ortamda kalıcı değil) |

## 14. Kabul testleri (40+ madde)

Sonuçlar her aşama sonunda dürüstçe işaretlenir: Başarılı / Başarısız / Henüz yapılmadı / Test edilemedi. Güncel çizelge: bu dosyanın sonundaki "Test günlüğü".

## 15. Karar günlüğü

- 14 Kas 2026 — Proje klasörü doğrulandı; tek kod tabanı; `/shop` hero'su boş olduğu için yeniden tasarlandı.
- 14 Kas 2026 — Katalog SQLite'ta tutulur; sürümlü, yedekli, silmeyen senkron.
- 14 Kas 2026 — Sepet satırı = varyant + kaynak dünya; fiyat/toplam yalnızca sunucuda hesaplanır (`/api/cart/quote`); sipariş idempotency anahtarıyla.
- 14 Kas 2026 — Stok `inventory` tablosunda tutulur; ürün kaydındaki stok yalnızca başlangıç değeridir. Yönetici düzenlemeleri (`adminEdited`) tohum güncellemesinde ezilmez.
- 14 Kas 2026 — Yönetici parolası yalnızca `.env.local`'da (`npm run setup:admin`); Git'e girmez.
- 14 Kas 2026 — Dünya geçişi bir CSS renk perdesidir (video değil); `prefers-reduced-motion`'da atlanır.
- 14 Kas 2026 — Fotoğrafı olmayan demo ürünler çizgi ikonlu panelle ve "Demo görsel" etiketiyle gösterilir.

- 14 Kas 2026 — **Tasarım yönü değişti (kullanıcı kararı):** Zara Home / Bershka çizgisinde sade, beyaz, görsel ağırlıklı mağaza. Kart başına yalnızca görsel + ad + fiyat; marka/malzeme/stok satırları ürün sayfasına taşındı. "Pazar yeri" hissini azaltmak için 17 kategori **8 departmana** gruplandı (ör. Mutfak = beyaz eşya + küçük aletler + pişirme + sofra tek sayfada); departmanlar `data/departments.ts`'te, kategoriler veride durur; hiçbir departmana bağlı olmayan yönetici kategorileri otomatik "Diğer"de görünür.
- 14 Kas 2026 — Ana sayfa girişi: tam ekran gerçek video + kaydırmaya bağlı sinematik geçiş (zoom + dairesel pencere). Kullanıcının verdiği YouTube Shorts videosunun görüntüsüne erişilemedi (yalnızca başlığı okunabildi); geçiş "kaydırmayla açılan sinematik giriş" olarak yorumlandı — referans videodan farklıysa kullanıcıdan tarifi istenmeli.
- 14 Kas 2026 — `/rooms` sayfaları ve ayrı "odaya göre" gezinmesi kaldırıldı (sadeleştirme). Oda bilgisi ürün verisinde (`rooms`) duruyor; ihtiyaç olursa geri getirilebilir.
- 14 Kas 2026 — Dört dünya sayfası tek sade şablona indirildi (büyük görsel + aynı ürün ızgarası); atmosfer renk ve görselle ayrışır. Dünya renkli sepet özelliği aynen korundu.
- 14 Kas 2026 — Yatay (landscape) telefon hatası: masaüstü menüsü ve 650 px'lik hero 390 px yüksekliğe sığmıyordu; tüm düzen `svh` ve kısa ekran kurallarıyla yeniden yazıldı, testlere yatay ekran boyutları eklendi.

- 14 Kas 2026 — Ana sayfa girişi "20 ortam" olarak yeniden kuruldu (`data/environments.ts`): giriş açılır açılmaz oynar, ortamlar kendiliğinden dönüşür (çözülme / dairesel açılma / yatay silme). **Dürüst sınır:** yalnızca 1 gerçek video var; diğer 19 ortam 7 fotoğrafın farklı kadrajlarıdır. Gerçek video eklemek için `kind: "video"` kaydı yeterli; indirme izni ve telif kontrolü gerekir.
- 14 Kas 2026 — "Hareketi azalt" cihaz ayarı artık videoyu kapatmaz (Windows'ta animasyon efektleri kapalı olan kullanıcı videoyu göremiyordu); yalnızca yakınlaşma ve kaydırma geçişi kapanır, her zaman "Duraklat" düğmesi vardır.

- 15 Kas 2026 — Üyelik eklendi: parolalar scrypt+tuz ile özetlenir, oturum belirteci rastgele ve veritabanında yalnızca SHA-256 özeti tutulur (httpOnly çerez, 30 gün), giriş denemeleri sınırlıdır, açık yönlendirme engellidir. Üyelik isteğe bağlıdır; misafir alışverişi sürer. Çıkışta cihazdaki favoriler temizlenir.
- 15 Kas 2026 — Telefonda giriş videosundan çıkış kasması: kaydırmaya bağlı JS/clip-path/filtre efektleri telefon ve dokunmatik cihazlarda kapatıldı; giriş düz bir bölümdür ve ekrandan çıkınca video durur. Masaüstünde sinematik geçiş korunur.

## Test günlüğü

Son çalıştırma (14 Kas 2026): `npm test` 14/14 ✔ · `npm run lint` ✔ · `tsc` ✔ · `npm run build` ✔ · `npm run test:browser` ✔ (masaüstü + mobil, gerçek video oynatma, hotspot) · `npm run test:e2e` 50/50 ✔ (üretim derlemesi, ayrı veri klasörü).

Kabul testi özeti (bölüm 39): 1–2 ✔, 3 ✔ (video currentTime>0), 4–5 ✔, 6 ✔, 7 ✔ · 8–12 ✔ · 13–16 ✔ · 17–18 ✔ · 19–26 ✔ · 27–30 ✔ · 31–35 ✔ · 36–39, 41 ✔ (390/375/768 px; sepet mobil e2e) · 40 ⚠ yalnızca "video mobilde yüklenmez" tasarımıyla (≤768px'te video kapalı; gerçek cihaz ölçümü yapılmadı) · 42–47 ⏳ yayın aşaması yapılmadı.
