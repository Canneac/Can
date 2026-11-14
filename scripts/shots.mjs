// Gözle kontrol için ekran görüntüsü alır.
// Kullanım: node scripts/shots.mjs [adres...]   (varsayılan: ana sayfa, mağaza, mutfak, ürün, koleksiyon)
// Üç düzen denenir: masaüstü, dikey telefon ve YATAY telefon (844×390); her birinde yatay taşma ölçülür.
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright-core";

const base = process.env.NUVESSA_URL ?? "http://localhost:3000";
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/shop", "/shop?dept=mutfak", "/products/sera-boucle-kanepe", "/worlds/heritage", "/cart"];
const out = join(process.cwd(), "outputs", "shots");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google/Chrome/Application/chrome.exe") });
const layouts = [["d", 1440, 900, false], ["m", 390, 844, true], ["l", 844, 390, true]];
for (const [label, width, height, touch] of layouts) {
  const page = await browser.newPage({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  for (const route of routes) {
    const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const name = (route === "/" ? "home" : route.replace(/[/?=&]/g, "_").replace(/^_/, "")) + `-${label}.png`;
    await page.screenshot({ path: join(out, name), fullPage: label !== "l" || route !== "/" });
    console.log(`${label} ${route} -> ${response?.status()} taşma:${overflow}px ${name}`);
  }
  await page.close();
}
await browser.close();
