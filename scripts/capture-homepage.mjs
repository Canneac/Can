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

  await desktop.locator(".room-hotspot--mirror summary").click();
  assert.equal(await desktop.locator(".room-hotspot--mirror").getAttribute("open") !== null, true, "Oda hotspot detayı açılmalı.");
  assert.match(await desktop.locator(".room-hotspot--mirror .hotspot-card").innerText(), /Antik tonlu ayna/);
  await desktop.locator(".room-hotspot--mirror summary").click();

  await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await desktop.waitForTimeout(300);
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
  assert.equal(await mobile.locator(".mobile-nav nav a").count(), 3, "Mobil menüde üç bölüm bağlantısı olmalı.");

  console.log(`Masaüstü: ${desktopViewport.width} × ${desktopViewport.height} — 200, logo ve tüm görseller yüklü.`);
  console.log("Mobil: 390 × 844 — yatay taşma yok, menü ve hotspot çalışıyor.");
  console.log("Ekran görüntüleri outputs/nuvessa-desktop.png ve outputs/nuvessa-mobile.png dosyalarına kaydedildi.");
} finally {
  await browser.close();
}
