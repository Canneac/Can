# NUVESSA — Yatırımcı demosu yayın hazırlığı

Durum: **yerelde hazır, yayın yapılmadı.** GitHub'a gönderme, hesap açma, ücretli servis ve internete yayınlama için kullanıcı onayı gerekir.

## 1. Yapılan yerel hazırlık (14 Kas 2026)

| Kontrol | Sonuç |
|---|---|
| Git'te izlenen gizli/veritabanı dosyası | Yok (yalnızca değersiz `.env.example`) |
| Git geçmişinde parola/anahtar deseni | Bulunmadı |
| Kaynak kodda sabit parola/token | Bulunmadı (yönetici parolası yalnızca `.env.local`) |
| `npm audit --omit=dev` | 0 açık |
| Üretim derlemesi (`npm run build`) ve `npm run test:e2e` | Başarılı (48 kontrol) |
| Depo boyutu | ≈ 29 MB (görseller 18 MB, video 13 MB; GitHub sınırlarının altında) |
| Uzak depo (`git remote`) | Yok — henüz hiçbir yere gönderilmedi |
| GitHub CLI (`gh`) | Bu bilgisayarda kurulu değil |

## 2. Yayın seçenekleri

Uygulama bir **Node sunucusu** gerektirir (Next.js sunucu sayfaları, API'ler, SQLite dosyası).

### A) Kalıcı sunucu + kalıcı disk (Railway / Render / Fly.io / küçük VPS) — **önerilen**
- SQLite ve mevcut kod **olduğu gibi** çalışır; mimari değişikliği yok.
- HTTPS ve adres otomatik. Veri, bağlı kalıcı diskte durur (siparişler, yönetici değişiklikleri kaybolmaz).
- Maliyet: genelde aylık birkaç dolar (disk için ücretli plan gerekir). **Ücretli → onay gerekir.**
- Yapılacaklar: `NUVESSA_DATA_DIR`'i disk yoluna ayarlamak, ortam değişkenleri (`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`), başlatma komutu `npm run build && npm start`.

### B) Vercel + yönetilen veritabanı (Neon / Supabase / Vercel Postgres)
- Ücretsiz katman olabilir, adres hızlıca çıkar.
- **Büyük mimari değişiklik gerekir:** `node:sqlite` sunucusuz ortamda kalıcı değildir; veri katmanı (`data/catalog-db.ts`, `lib/orders.ts`, `lib/admin-data.ts`) Postgres'e taşınmalı (zaman uyumsuz sorgular, migration). Görsel yükleme için ayrı dosya depolama da gerekir.
- Vercel'in ücretsiz (Hobby) planı ticari kullanım için tasarlanmamıştır; yatırımcı gösterimi sınırdadır. **Mimari değişiklik + hesap → onay gerekir.**

### C) Geçici tünel (Cloudflare Tunnel / ngrok) — bilgisayarınızdan
- Aynı gün gösterim için en hızlısı: bilgisayarınızdaki site geçici bir HTTPS adresiyle açılır. Ücretsiz katman var.
- Bilgisayar açık ve `npm start` çalışır olmalı; adres kalıcı değildir; ev interneti yavaşsa deneyim düşer.
- Yönetici paneli parolayla korunur; yine de yalnızca gösterim süresince açık tutun. **Hesap + internete açma → onay gerekir.**

**Öneri:** Kalıcı demo için **A**; elinizde acil bir toplantı varsa köprü olarak **C**. B yalnızca ileride gerçek ölçeklenme istenirse.

## 3. GitHub (özel depo) — onay sonrası adımlar

1. github.com'da hesabınızla **boş, özel (private)** bir depo oluşturun (ör. `nuvessa`). README/lisans eklemeyin.
2. Depo adresini bana verin; ben `git remote add origin …` ve ilk gönderimi (`git push`) yaparım. Kimlik doğrulamayı (giriş/anahtar) sizin yapmanız gerekir.
3. `.env.local`, veritabanı (`work/`), yüklemeler ve test çıktıları zaten `.gitignore`'da; gönderilmez.

## 4. Yayın öncesi kontrol listesi

- [ ] Hosting seçimi ve ücret onayı
- [ ] Ortam değişkenleri yayın ortamına elle girilir (parola ayrı, **yeni** ve güçlü olmalı; yerel parola kullanılmaz)
- [ ] Yayın ortamında demo verisi (`NUVESSA_DATA_DIR` boşken ilk açılışta tohumlanır)
- [ ] `/admin` yetkisiz erişim testi canlı adreste tekrarlanır
- [ ] Telefondan açılış, HTTPS, sepet → demo sipariş → admin'de görünme
- [ ] Sitede "DEMO" ibareleri görünür; sahte müşteri/satış rakamı yok
- [ ] Hukuki: NUVESSA marka tescil incelemesi, KVKK/mesafeli satış metinleri gerçek satıştan önce (demo için gerekmez, sitede "tescilli" denmez)
- [ ] Görsel/video lisansları: video Pexels lisanslı (`docs/MEDIA.md`); fotoğraflar yapay zekâ ile üretilmiş editoryal örneklerdir — ticari kullanım hakları doğrulanmalı

## 5. Bilinen yayın sınırlamaları

- Yönetici panelinden **görsel yükleme** yerel diskte `public/uploads` içine yazar; üretimde yeni eklenen dosyalar güvenilir şekilde sunulmayabilir (seçenek A'da kalıcı disk + küçük ayar gerekir; B'de bulut depolama).
- Hız sınırlama ve oturum bellek içidir; sunucu yeniden başlayınca sıfırlanır (tek sunuculu demo için yeterli).
- Tek yönetici parolası vardır; çok kullanıcılı yönetim yok.
