import assert from "node:assert/strict";
import { access, mkdir } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const root = process.cwd();
const outputDirectory = join(root, "outputs");
const baseUrl = process.env.NUVESSA_URL ?? "http://localhost:3000";
const candidates = [
  process.env.CHROME_PATH,
  join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google/Chrome/Application/chrome.exe"),
  join(process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)", "Google/Chrome/Application/chrome.exe"),
];

async function firstAvailable(paths) {
  for (const path of paths) {
    if (!path) continue;
    try {
      await access(path);
      return path;
    } catch {
      // Try the next installed Chrome location.
    }
  }
  throw new Error("Google Chrome bulunamadı. CHROME_PATH ortam değişkeniyle yol belirtin.");
}

const executablePath = await firstAvailable(candidates);
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });

try {
  const desktopViewport = { width: 1440, height: 1000 };
  const desktop = await browser.newPage({ viewport: desktopViewport, deviceScaleFactor: 1 });
  const desktopResponse = await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  assert.equal(desktopResponse?.status(), 200, "Ana sayfa 200 yanıtı vermeli.");
  assert.match(await desktop.title(), /NUVESSA/);
  await desktop.evaluate(() => document.fonts.ready);
  await desktop.waitForFunction(() => document.querySelector("video")?.currentTime > 0);

  await desktop.locator(".room-scene").scrollIntoViewIfNeeded();
  await desktop.locator(".room-scene__dot").first().click();
  assert.match(await desktop.locator(".room-scene__card").innerText(), /₺/, "Shop the Room noktası fiyatlı ürün kartı açmalı.");
  await desktop.keyboard.press("Escape");
  assert.equal(await desktop.locator(".room-scene__card").count(), 0, "Esc ile ürün kartı kapanmalı.");

  await desktop.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } });
  await desktop.waitForTimeout(500);
  const imageAudit = await desktop.locator("img").evaluateAll((images) => images.map((image) => ({
    src: image.currentSrc || image.src,
    loaded: image.complete && image.naturalWidth > 0,
    alt: image.alt,
  })));
  assert.ok(imageAudit.length >= 10, `En az 10 logo/görsel bekleniyordu; ${imageAudit.length} bulundu.`);
  assert.deepEqual(imageAudit.filter((image) => !image.loaded).map((image) => image.src), [], "Logo ve içerik görsellerinin tümü yüklenmeli.");
  assert.ok(imageAudit.some((image) => image.src.includes("nuvessa-wordmark-light.svg")), "Yatay NUVESSA logosu yüklenmeli.");
  await desktop.evaluate(() => window.scrollTo(0, 0));
  await desktop.screenshot({ path: join(outputDirectory, "nuvessa-desktop.png") });

  const shop = await browser.newPage({ viewport: desktopViewport, deviceScaleFactor: 1 });
  const shopResponse = await shop.goto(`${baseUrl}/shop?q=vazo`, { waitUntil: "networkidle" });
  assert.equal(shopResponse?.status(), 200, "Katalog sayfası 200 yanıtı vermeli.");
  assert.equal(await shop.locator(".catalog-card").count(), 1, "Vazo araması tek eşleşme göstermeli.");
  const normalizedSearch = await shop.goto(`${baseUrl}/shop?q=kase`, { waitUntil: "networkidle" });
  assert.equal(normalizedSearch?.status(), 200);
  assert.equal(await shop.locator(".catalog-card").count(), 1, "ASCII kâse araması Türkçe karakterli ürünü bulmalı.");
  const noResults = await shop.goto(`${baseUrl}/shop?q=uzay%20gemisi`, { waitUntil: "networkidle" });
  assert.equal(noResults?.status(), 200);
  assert.equal(await shop.locator(".catalog-empty").count(), 1, "Henüz katalogda olmayan arama açık bir boş durum göstermeli.");
  await shop.goto(`${baseUrl}/shop?q=cop%20kovasi`, { waitUntil: "networkidle" });
  assert.equal(await shop.locator(".catalog-card").count(), 1, "ASCII çöp kovası araması Türkçe katalog kaydını bulmalı.");
  assert.equal(await shop.locator(".catalog-card img").evaluate((image) => image.complete && image.naturalWidth > 0), true, "Çöp kovası görseli yüklenmeli.");
  await shop.goto(`${baseUrl}/shop?q=kasik`, { waitUntil: "networkidle" });
  assert.equal(await shop.locator(".catalog-card").count(), 1, "ASCII kaşık araması Türkçe katalog kaydını bulmalı.");
  assert.equal(await shop.locator(".catalog-card img").evaluate((image) => image.complete && image.naturalWidth > 0), true, "Çatal-kaşık görseli yüklenmeli.");
  await shop.goto(`${baseUrl}/shop?category=mobilya&sort=price-asc`, { waitUntil: "networkidle" });
  assert.equal(await shop.locator(".catalog-card").count(), 7, "Mobilya kategorisi (ek kategoriler dahil) 7 ürün göstermeli.");
  const sofaImageHandle = shop.locator(".catalog-card img").first();
  await sofaImageHandle.scrollIntoViewIfNeeded();
  await shop.waitForFunction(() => { const image = document.querySelector(".catalog-card img"); return image && image.complete && image.naturalWidth > 0; });
  const sofaImage = await sofaImageHandle.evaluate((image) => image.complete && image.naturalWidth > 0);
  assert.equal(sofaImage, true, "Kanepe görseli yüklenmeli.");
  await shop.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  assert.equal(await shop.locator(".catalog-card").count(), 30, "Katalogda 30 demo ürün olmalı.");
  assert.equal(await shop.locator(".category-tile").count(), 8, "Sekiz kategori kartı olmalı.");
  assert.equal(await shop.locator(".shop-hero__image").evaluate((image) => image.complete && image.naturalWidth > 0), true, "Giriş görseli yüklenmeli.");
  await shop.goto(`${baseUrl}/shop?category=beyaz-esya`, { waitUntil: "networkidle" });
  assert.equal(await shop.locator(".catalog-card").count(), 3, "Beyaz eşya kategorisinde üç ürün olmalı.");
  await shop.goto(`${baseUrl}/shop?q=buzdolabi`, { waitUntil: "networkidle" });
  assert.equal(await shop.locator(".catalog-card").count(), 1, "ASCII buzdolabı araması ürünü bulmalı.");
  await shop.fill(".header-search input", "havlu");
  await Promise.all([shop.waitForURL(/q=havlu/), shop.locator(".header-search button").click()]);
  assert.equal(await shop.locator(".catalog-card").count(), 1, "Üst arama kutusu kataloğu filtrelemeli.");
  await shop.goto(`${baseUrl}/shop?sort=price-asc`, { waitUntil: "networkidle" });
  const sortedPrices = await shop.locator(".catalog-card__details > strong").allTextContents();
  assert.match(sortedPrices[0], /290/, "Artan sıralama en düşük demo fiyatıyla başlamalı.");
  assert.match(sortedPrices.at(-1), /84\.990/, "Artan sıralama en yüksek demo fiyatıyla bitmeli.");
  const iconProduct = await shop.goto(`${baseUrl}/products/vela-cift-kapili-buzdolabi`, { waitUntil: "networkidle" });
  assert.equal(iconProduct?.status(), 200, "Görselsiz demo ürünün detay sayfası açılmalı.");
  assert.equal(await shop.locator(".product-detail__image .product-visual__icon").count(), 1, "Görselsiz ürün çizgi ikonlu panel göstermeli.");
  const shopLayout = await shop.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
  assert.ok(shopLayout.documentWidth <= shopLayout.width, "Katalog sayfasında yatay taşma olmamalı.");
  await shop.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  await shop.locator(".catalog-grid").scrollIntoViewIfNeeded();
  await shop.screenshot({ path: join(outputDirectory, "nuvessa-catalog-desktop.png") });

  for (const slug of ["modern-form", "soft-living", "heritage", "art-house"]) {
    const response = await shop.goto(`${baseUrl}/worlds/${slug}`, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, `${slug} dünyası açılmalı.`);
    await shop.screenshot({ path: join(outputDirectory, `renewal-${slug}.png`) });
  }
  for (const route of ["shop", "worlds"]) {
    assert.equal((await shop.goto(`${baseUrl}/${route}`, { waitUntil: "networkidle" }))?.status(), 200);
    await shop.setViewportSize({width: 1440, height: 900});
    await shop.screenshot({path: join(outputDirectory, `renewal-${route}.png`)});
  }
  const productResponse = await shop.goto(`${baseUrl}/products/aren-form-vazo`, { waitUntil: "networkidle" });
  assert.equal(productResponse?.status(), 200, "Demo ürün detay sayfası açılmalı.");
  assert.match(await shop.locator("h1").innerText(), /Aren/);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobileResponse = await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  assert.equal(mobileResponse?.status(), 200, "Mobil ana sayfa 200 yanıtı vermeli.");
  await mobile.evaluate(() => document.fonts.ready);
  const mobileLayout = await mobile.evaluate(() => ({
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    menuDisplay: getComputedStyle(document.querySelector(".mobile-nav")).display,
    desktopNavDisplay: getComputedStyle(document.querySelector(".desktop-nav")).display,
  }));
  assert.equal(mobileLayout.width, 390);
  assert.ok(mobileLayout.documentWidth <= mobileLayout.width, "Mobil sayfada yatay taşma olmamalı.");
  assert.equal(mobileLayout.menuDisplay, "block", "Mobil gezinme görünür olmalı.");
  assert.equal(mobileLayout.desktopNavDisplay, "none", "Masaüstü gezinmesi dar ekranda gizlenmeli.");
  await mobile.screenshot({ path: join(outputDirectory, "nuvessa-mobile.png") });

  await mobile.locator(".mobile-nav summary").click();
  assert.equal(await mobile.locator(".mobile-nav").getAttribute("open") !== null, true, "Mobil menü açılmalı.");
  assert.equal(await mobile.locator(".mobile-nav nav a").count(), 4, "Mobil menüde dört bölüm bağlantısı olmalı.");
  await mobile.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  const mobileShopWidth = await mobile.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
  assert.ok(mobileShopWidth.documentWidth <= mobileShopWidth.width, "Mobil katalogda yatay taşma olmamalı.");
  await mobile.locator(".catalog-grid").scrollIntoViewIfNeeded();
  await mobile.screenshot({ path: join(outputDirectory, "nuvessa-catalog-mobile.png") });

  const narrowMobile = await browser.newPage({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 1 });
  await narrowMobile.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  const narrowWidth = await narrowMobile.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
  assert.ok(narrowWidth.documentWidth <= narrowWidth.width, "360px mobil katalogda yatay taşma olmamalı.");

  for (const width of [375, 390, 768]) {
    await mobile.setViewportSize({ width, height: 900 });
    for (const route of ["", "shop"]) {
      await mobile.goto(`${baseUrl}/${route}`, { waitUntil: "networkidle" });
      assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await mobile.screenshot({path: join(outputDirectory, `renewal-${route || "home"}-${width}.png`)});
    }
  }
  console.log(`Masaüstü: ${desktopViewport.width} × ${desktopViewport.height} — ana sayfa 200, logo ve tüm görseller yüklü.`);
  console.log("Katalog: Türkçe/ASCII araması, boş durum, mobilya filtresi, dört dünya ve ürün detayı çalışıyor.");
  console.log("Mobil: 390 × 844 ve katalog 360 × 780 — yatay taşma yok; menü ve hotspot çalışıyor.");
  console.log("Masaüstü/mobil ana sayfa ve katalog ekran görüntüleri outputs/ klasörüne kaydedildi.");
} finally {
  await browser.close();
}


