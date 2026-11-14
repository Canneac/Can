# NUVESSA proje planı

## Mevcut durum — 14 Kasım 2026

Çalışma klasörü: `C:\Users\Can\Documents\Codex\2026-11-12\sela`

Proje Next.js 16.4.6 App Router, React 19.3.1, TypeScript ve Tailwind CSS 4.3.5 kullanıyor. Git çalışma ağacı ilk incelemede temizdi; `2029433` commit'i güvenli geri dönüş noktası olarak korunuyor ve geliştirme `codex/nuvessa-platform-roadmap` dalında sürüyor.

### Gerçekten mevcut olanlar

- Tek uygulama route'u: `/` ana sayfası. Üretim derlemesi ayrıca Next.js'in `/_not-found` hata sayfasını üretiyor.
- Marka logosu bileşeni ve proje içindeki SVG/PNG marka varlıkları.
- Yerel hero, oda ve obje görselleri.
- Editoryal ana sayfa: başlık/menü, koleksiyon görselleri, örnek obje/fiyat sunumu, Shop the Room görünümünde açılır iki bilgi noktası, marka bölümü ve footer.
- Mobil menü, responsive ana sayfa, fiyat biçimlendirme yardımcısı.
- Demo içeriği olduğu arayüzde belirtiliyor; gerçek sipariş/ödeme alınmıyor.
- Otomatik tarayıcı betiği ana sayfayı, logoları/görselleri, yatay taşmayı, mobil menüyü ve iki statik oda bilgi noktasını kontrol edip ekran görüntüsü alıyor.

### Eksik olanlar

Ürün/kategori detay route'ları, katalog servisi/veritabanı, gerçek ürün araması ve filtreler, varyant/stok, favoriler, sepet, oturum/üyelik, checkout/sipariş, ödeme sağlayıcısı, güvenli yönetici paneli ve ürün yönetimi henüz yok. Koleksiyon bağlantıları ve Shop the Room noktaları ürünlere gitmiyor; görsel/editoryal önizleme niteliğinde.

### Aşamalar

| Aşama | Kapsam | Durum |
|---|---|---|
| 1. Denetim ve güvenli başlangıç | Kod/route/varlık incelemesi, yerel çalışma ve mevcut kalite kontrolleri, geri dönüş noktası, bu plan | Tamamlandı |
| 2. Marka ve ortak tasarım sistemi | Mevcut sanat yönetimi korunarak ortak gezinme ve dünya temaları eklendi; ortak footer ve merkezi tema token'ları bekliyor | Devam ediyor |
| 3. Katalog temeli | Altı demo ürün, kategori ve dünya ilişkileri eklendi; kalıcı veri kaynağı, varyant/marka/oda modeli bekliyor | Devam ediyor |
| 4. Katalog deneyimi | `/shop`, ürün detayları, Türkçe arama, kategori/dünya filtresi ve fiyat sıralama eklendi; favori ve gelişmiş filtreler bekliyor | İlk dilim tamamlandı |
| 5. Dört tasarım dünyası | Dört dünya sayfası ortak demo kataloğundan ilgili ürünleri gösteriyor; kalıcı katalog bekliyor | İlk dilim tamamlandı |
| 6. Sepet ve demo sipariş | Kalıcı kaynak dünya bilgisi, sunucu fiyat/stok denetimi, açık demo siparişi | Bekliyor |
| 7. Yönetici araçları | Sunucu tarafı yetkili erişim, ürün/kategori/stok/sipariş işlemleri | Bekliyor |
| 8. Keşif deneyimleri | Odaya göre gezinme, gerçek ürün bağlantılı Shop the Room | Bekliyor |
| 9. Kalite ve güvenlik | Mobil, erişilebilirlik, performans, güvenlik ve akış testleri | Bekliyor |
| 10. İnternette erişilebilir yatırımcı demosu | Özel repo ve güvenli demo ortamı; sağlayıcı, ücret ve yayına alma onayı | Bekliyor |

## Aşama 1–5 ilk dilim doğrulaması

- `npm run typecheck` — başarılı.
- `npm run lint` — başarılı.
- `npm test` — 4 test geçti; fiyat biçimi ve Türkçe/ASCII araması doğrulandı.
- `npm run build` — başarılı; `/`, `/shop`, `/worlds`, dört dünya detay route'u ve altı demo ürün route'u üretildi.
- `npm run test:browser` — başarılı; 1440×1000 ve 390×844 ekranlarda ana sayfa, katalog, mobilya filtresi, boş arama durumu, dört dünya, ürün detayları, görsel yükleme, yatay taşma, mobil menü ve hotspot kontrol edildi. Ekran görüntüleri `outputs/` altına kaydedildi.
- `http://localhost:3000` — HTTP 200, NUVESSA başlığı.

Sepet, sipariş, hesap, gerçek stok ve yönetici akışları henüz yoktur. Katalog verileri sabit demo kaydıdır, kalıcı veritabanı değildir.

## Yatırımcı demosuna güvenli yol

Önce sipariş almayan demo olarak katalog, ürün detayları, arama, tema kaynak bilgili sepet ve etiketli demo siparişi tamamlanmalı. Demo ile canlı ticari ortam ayrılmalı; kalıcı veritabanı, yönetici erişimi ve gizli bilgiler güvenli yapılandırılmalı. Sonra üretim derlemesi ve telefondan erişim test edilmeli. GitHub'a gönderme veya internette yayınlama, uzak hesaba bağlantı ve kullanıcı onayı gerektirdiğinden onaysız yapılmayacak; ücretli servis açılmayacak.

## Yayın öncesinde gerekenler

- Demo verisinin gerçek stok/satıcı/ödeme olarak anlaşılmayacağının doğrulanması.
- Ortam değişkenleri, gizli bilgi taraması, özel depo ve demo veritabanı yapılandırması.
- Yönetici panelinin varsayılan olarak kapalı/korumalı olması ve yetkisiz erişim testleri.
- Görsel kullanım hakları ve şirket/iletişim/yasal alanlar için doğrulanmış bilgi.
- Kalıcı veri, mobil checkout ve sipariş akışının yayın ortamında sınanması.
- Hosting/veritabanı ücret ve limitlerinin kullanıcıyla netleştirilip onaylanması.
- Gerçek satıştan önce ödeme sağlayıcısı, stok/teslimat/iade, KVKK ve hukuki metinlerin uzman incelemesi.

## Sonraki geliştirme adımı

Katalog genişlemeden önce Next.js uygulamasına ve ilerideki barındırmaya uygun kalıcı demo veritabanı seçilecek. Ürün/kategori modeli bu kaynağa taşındıktan sonra varyant, favori ve kaynak tasarım dünyasını koruyan sepet geliştirilecek.
