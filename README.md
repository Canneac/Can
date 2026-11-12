# NUVESSA — The Private Gallery

NUVESSA ana sayfasının Türkçe, responsive tasarım önizlemesi. Next.js App Router, TypeScript ve Tailwind CSS ile oluşturulmuştur. Gerçek sipariş veya ödeme almaz.

## Yerel önizleme

1. Proje klasörünü açın.
2. `npm run dev` başlatıldıktan sonra tarayıcıda [http://localhost:3000](http://localhost:3000) adresine gidin.

Kontroller: `npm run typecheck`, `npm run lint`, `npm test` ve uygulama çalışırken `npm run test:browser`. Tarayıcı kontrolü masaüstü/mobil önizlemeleri `outputs/` klasörüne kaydeder.

## Düzenleme

- Logo varyantları: `config/brand.ts`
- Ana sayfa seçki metinleri, görselleri ve örnek fiyatları: `data/homepage.ts`
- Logo SVG/PNG dosyaları: `public/brand/logos/`
- Görseller: `public/images/`
- Renkler, tipografi ve responsive stiller: `app/globals.css`
- Mimari ve satış öncesi işler: `docs/ARCHITECTURE.md`, `docs/PRODUCTION_CHECKLIST.md`

Gösterilen ürün adları, açıklamaları ve fiyatlar yalnızca tasarım demosudur. Ürün görselleri bu önizleme için oluşturulmuş editoryal örneklerdir. Gerçek satıştan önce işletme ve ürün bilgileri doğrulanmalı; teslimat, iade, KVKK ve hukuki metinler gözden geçirilmeli; ödeme ayrıca entegre edilmelidir.
