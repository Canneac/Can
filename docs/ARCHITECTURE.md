# NUVESSA mevcut mimarisi

Mevcut uygulama, Next.js App Router üzerinde marka ana sayfası, demo katalog, dört tasarım dünyası ve demo ürün detaylarını içerir. Katalog `data/catalog.ts` içindeki altı sabit demo kaydını kullanır; kalıcı veritabanı henüz bağlı değildir. Sepet, sipariş, ödeme, hesap, stok ve yönetim ekranları geliştirilmemiştir.

## Yapı

- `app/`: Next.js App Router sayfası, metadata ve global stiller
- `components/`: tekrar kullanılabilen arayüz parçaları; logo seçimi `BrandLogo` üzerinden yapılır
- `config/brand.ts`: logo eşlemesi, marka adı, dil ve para birimi
- `data/homepage.ts`: ana sayfada gösterilen düzenlenebilir koleksiyon ve örnek nesne verileri; henüz merkezi ürün kataloğu değildir
- `data/catalog.ts`: altı demo ürün, başlangıç kategorileri ve dört tasarım dünyası; canlı stok ya da DB değildir
- `domain/money.ts`: arayüzden ayrı, kuruş tabanlı fiyat gösterimi
- `domain/search.ts`: Türkçe karakter farklarını normalize ederek demo kataloğunda arama
- `components/storefront-header.tsx`: ana sayfa ve mağaza sayfalarında ortak gezinme
- `/shop`: katalog, arama, aktif kategori/dünya filtreleri ve fiyat sıralama
- `/worlds`, `/worlds/[slug]`: dünyalar giriş ve detay sayfaları
- `/products/[slug]`: demo ürün detay sayfaları
- `public/brand/logos/`: ZIP paketinden çıkarılan özgün SVG ve PNG logolar
- `public/images/`: yerel editoryal görseller ve konsept demo katalog görselleri

Shop the Room noktaları hâlâ editoryal örnektir ve ürünlere bağlı değildir. `/shop` araması mevcut demo kayıtlarında sunucu tarafında çalışır; sipariş, stok veya sepete ekleme yapmaz. Kalıcı katalog bağlandığında erişim ayrı bir sunucu veri katmanına taşınmalı, sayfa bileşenleri doğrudan veritabanına bağlanmamalıdır. İleride sepet satırı tasarım dünyası kaynağını korumalı; fiyat ve stok sunucuda yeniden doğrulanmalıdır.

Denetim bulguları, doğrulama sonuçları ve aşama planı için kök dizindeki `PROJECT_PLAN.md` dosyasına bakın.
