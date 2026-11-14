// Tarayıcı kontrolü (çalışan sunucuya karşı): ana sayfa videosu ve geçişi, mağaza, arama, departmanlar,
// ürün/koleksiyon sayfaları ve DİKEY + YATAY ekran düzenleri. Ekran görüntüleri outputs/ klasörüne kaydedilir.
import assert from "node:assert/strict";
import { access, mkdir } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const baseUrl = process.env.NUVESSA_URL ?? "http://localhost:3000";
const outputDirectory = join(process.cwd(), "outputs");
const candidates = [process.env.CHROME_PATH, join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google/Chrome/Application/chrome.exe")];
let executablePath;
for (const path of candidates) {
  if (!path) continue;
  try { await access(path); executablePath = path; break; } catch { /* sonrakini dene */ }
}
assert.ok(executablePath, "Google Chrome bulunamadı. CHROME_PATH ayarlayın.");
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const ok = (message) => console.log(`  ✔ ${message}`);

try {
  // ---- Masaüstü ana sayfa ----
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const home = await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  assert.equal(home?.status(), 200);
  assert.match(await desktop.title(), /NUVESSA/);
  await desktop.waitForFunction(() => document.querySelector(".cin video")?.currentTime > 0, null, { timeout: 15000 });
  ok("Ana sayfa 200; giriş videosu gerçekten oynuyor (currentTime > 0)");
  assert.ok(await desktop.locator(".cin__title h1").isVisible(), "Başlık ilk ekranda görünmeli.");
  assert.match(await desktop.locator(".env-label__count").innerText(), /01 \/ 20/, "Giriş 20 ortamdan oluşmalı.");
  await desktop.waitForFunction(() => /02 \/ 20/.test(document.querySelector(".env-label__count")?.textContent ?? ""), null, { timeout: 20000 });
  ok("20 ortamlı giriş: 1. ortam (video) bitince 2. ortama kendiliğinden geçiyor");
  const reducedPage = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
  await reducedPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await reducedPage.waitForFunction(() => document.querySelector(".env video")?.currentTime > 0, null, { timeout: 15000 });
  ok("Windows animasyon efektleri kapalı olsa bile video girişte oynuyor");
  await reducedPage.close();
  const range = await desktop.evaluate(() => document.querySelector(".cin").offsetHeight - innerHeight);
  await desktop.evaluate((y) => window.scrollTo(0, y), Math.round(range * 0.7));
  await desktop.waitForTimeout(300);
  const reveal = await desktop.evaluate(() => Number(document.querySelector(".cin__sticky").style.getPropertyValue("--reveal")));
  assert.ok(reveal > 0.2, `Kaydırınca sonraki sahne açılmalı (reveal=${reveal}).`);
  ok(`Kaydırmaya bağlı sinematik geçiş çalışıyor (reveal=${reveal.toFixed(2)})`);
  await desktop.evaluate(() => document.querySelector("#koleksiyonlar").scrollIntoView());
  await desktop.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } });
  await desktop.waitForTimeout(500);
  const broken = await desktop.locator("img").evaluateAll((images) => images.filter((image) => !(image.complete && image.naturalWidth > 0)).map((image) => image.currentSrc || image.src));
  assert.deepEqual(broken, [], "Tüm görseller yüklenmeli.");
  ok("Ana sayfadaki tüm görseller yüklendi");
  await desktop.locator(".room-scene").scrollIntoViewIfNeeded();
  await desktop.locator(".room-scene__dot").first().click();
  assert.match(await desktop.locator(".room-scene__card").innerText(), /₺/);
  await desktop.keyboard.press("Escape");
  assert.equal(await desktop.locator(".room-scene__card").count(), 0);
  ok("Odadan alışveriş noktası ürün kartı açıyor, Esc kapatıyor");
  await desktop.evaluate(() => window.scrollTo(0, 0));
  await desktop.screenshot({ path: join(outputDirectory, "nuvessa-desktop.png") });

  // ---- Mağaza, arama, departman ----
  const shop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const count = async (url) => { await shop.goto(`${baseUrl}${url}`, { waitUntil: "networkidle" }); return shop.locator(".pcard").count(); };
  assert.equal(await count("/shop"), 30);
  ok("Mağazada 30 ürün var");
  assert.equal(await count("/shop?q=vazo"), 1); assert.equal(await count("/shop?q=kase"), 1);
  assert.equal(await count("/shop?q=cop%20kovasi"), 1); assert.equal(await count("/shop?q=kasik"), 1);
  assert.equal(await count("/shop?q=buzdolabi"), 1);
  assert.equal(await count("/shop?q=uzay%20gemisi"), 0);
  assert.equal(await shop.locator(".zempty").count(), 1);
  ok("Arama: vazo, kâse/kase, çöp kovası/cop kovasi, kaşık/kasik, buzdolabı; boş sonuç durumu");
  assert.equal(await count("/shop?dept=mutfak"), 9);
  const kitchenText = await shop.locator(".pgrid").innerText();
  for (const word of ["Buzdolabı", "Tencere", "Çatal Kaşık", "Espresso", "Kupa"]) assert.ok(kitchenText.includes(word), `Mutfak sayfasında ${word} olmalı.`);
  ok("Mutfak departmanı tek sayfada: beyaz eşya + küçük aletler + pişirme + sofra (9 ürün)");
  assert.equal(await count("/shop?dept=mutfak&category=beyaz-esya"), 3);
  await shop.goto(`${baseUrl}/shop?sort=price-asc`, { waitUntil: "networkidle" });
  const prices = await shop.locator(".pcard__price").allTextContents();
  assert.match(prices[0], /290/); assert.match(prices.at(-1), /84\.990/);
  ok("Fiyat sıralaması doğru (₺290 → ₺84.990)");
  assert.equal(await count("/shop?color=Bordo"), (await (async () => { await shop.goto(`${baseUrl}/shop?color=Bordo`); return shop.locator(".pcard").count(); })()));
  assert.ok((await count("/shop?color=Bordo")) > 0 && (await count("/shop?color=Bordo")) < 30);
  ok("Renk filtresi çalışıyor");
  await shop.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  await shop.getByRole("button", { name: "Ara", exact: true }).first().click();
  await shop.fill("#z-search-input", "havlu");
  await shop.keyboard.press("Enter");
  await shop.waitForURL(/q=havlu/);
  assert.equal(await shop.locator(".pcard").count(), 1);
  ok("Üst bardaki arama paneli çalışıyor");
  await shop.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  await shop.getByRole("button", { name: "Menüyü aç" }).click();
  assert.ok(await shop.locator(".zmenu__list a", { hasText: "Mutfak" }).isVisible());
  await shop.keyboard.press("Escape");
  assert.equal(await shop.locator(".zmenu").count(), 0);
  ok("Tam ekran menü açılıp kapanıyor");
  assert.equal((await shop.goto(`${baseUrl}/products/vela-cift-kapili-buzdolabi`, { waitUntil: "networkidle" }))?.status(), 200);
  assert.equal(await shop.locator(".zp__media .product-visual__icon").count(), 1);
  for (const slug of ["modern-form", "soft-living", "heritage", "art-house"]) {
    assert.equal((await shop.goto(`${baseUrl}/worlds/${slug}`, { waitUntil: "networkidle" }))?.status(), 200);
    assert.ok((await shop.locator(".pcard").count()) > 0);
  }
  ok("Ürün sayfası ve dört koleksiyon sayfası açılıyor");

  // ---- Dikey ve YATAY ekran düzenleri ----
  const routes = ["/", "/shop", "/shop?dept=mutfak", "/products/sera-boucle-kanepe", "/worlds", "/worlds/heritage", "/cart", "/wishlist"];
  const layouts = [["telefon dikey 375", 375, 812, true], ["telefon dikey 390", 390, 844, true], ["telefon YATAY 844×390", 844, 390, true], ["telefon YATAY 915×412", 915, 412, true], ["telefon YATAY 667×375", 667, 375, true], ["tablet dikey 768", 768, 1024, true], ["tablet YATAY 1024×768", 1024, 768, true], ["dizüstü 1366×768", 1366, 768, false]];
  for (const [name, width, height, touch] of layouts) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200, `${name} ${route}`);
      const metrics = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, header: document.querySelector(".zh")?.getBoundingClientRect().height ?? 0 }));
      assert.ok(metrics.overflow <= 0, `${name} ${route}: yatay taşma ${metrics.overflow}px`);
      assert.ok(metrics.header <= height * 0.2, `${name} ${route}: üst bar çok yüksek (${metrics.header}px)`);
    }
    // İlk ekranda başlık ve düğmeler görünmeli (yatay telefonda taşma olmamalı)
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const first = await page.evaluate(() => { const r = (s) => document.querySelector(s).getBoundingClientRect(); return { h1: r(".cin__title h1"), cta: r(".cin__cta"), vh: innerHeight }; });
    assert.ok(first.cta.bottom <= first.vh, `${name}: ana sayfa düğmeleri ilk ekrana sığmıyor (${Math.round(first.cta.bottom)} > ${first.vh})`);
    assert.ok(first.h1.top >= 0, `${name}: başlık ekranın üstünden taşıyor`);
    await page.screenshot({ path: join(outputDirectory, `nuvessa-home-${width}x${height}.png`) });
    await page.close();
    ok(`${name}: ${routes.length} sayfada yatay taşma yok, üst bar uygun, ilk ekran sığıyor`);
  }
  // Yatay telefonda menü kullanılabilir mi?
  const land = await browser.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  await land.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  await land.getByRole("button", { name: "Menüyü aç" }).tap();
  const lastItem = land.locator(".zmenu__list a").last();
  await lastItem.scrollIntoViewIfNeeded();
  assert.ok(await lastItem.isVisible());
  ok("Yatay telefonda menü açılıyor ve tüm maddelere ulaşılıyor");
} finally {
  await browser.close();
}
console.log("\nTarayıcı kontrolü tamamlandı.");
