# NUVESSA önizleme mimarisi

Bu aşama yalnızca ana sayfa ve marka sunumunu içerir. Ürün detayları, ödeme, hesap, kargo ve yönetim ekranları henüz geliştirilmemiştir.

## Yapı

- `app/`: Next.js App Router sayfası, metadata ve global stiller
- `components/`: tekrar kullanılabilen arayüz parçaları; logo seçimi `BrandLogo` üzerinden yapılır
- `config/brand.ts`: logo eşlemesi, marka adı, dil ve para birimi
- `data/homepage.ts`: ana sayfada gösterilen düzenlenebilir koleksiyon ve örnek nesne verileri
- `domain/money.ts`: arayüzden ayrı, kuruş tabanlı fiyat gösterimi
- `public/brand/logos/`: ZIP paketinden çıkarılan özgün SVG ve PNG logolar
- `public/images/`: projeye ait yerel editoryal görseller

Yeni sayfalar geldiğinde ürün kataloğu ve içerik katmanları `data/` altında, sepet/fiyat davranışları `domain/` veya `features/` altında tutulabilir. Gerçek içerik kaynağı bağlanırken sayfa bileşenleri doğrudan veri tabanına bağlanmamalıdır.
