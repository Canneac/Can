// Gözle kontrol için ekran görüntüsü alır: node scripts/shots.mjs [adres...] (varsayılan: ana sayfa, dünyalar, odalar)
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright-core";

const base = process.env.NUVESSA_URL ?? "http://localhost:3000";
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/worlds", "/worlds/modern-form", "/worlds/soft-living", "/worlds/heritage", "/worlds/art-house", "/rooms"];
const out = join(process.cwd(), "outputs", "shots");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google/Chrome/Application/chrome.exe") });
for (const [label, width, height] of [["d", 1440, 900], ["m", 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  for (const route of routes) {
    const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    // Tembel yüklenen görseller için sayfayı sonuna kadar kaydır
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const name = (route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "")) + `-${label}.png`;
    await page.screenshot({ path: join(out, name), fullPage: true });
    console.log(`${label} ${route} -> ${response?.status()} taşma:${overflow}px ${name}`);
  }
  await page.close();
}
await browser.close();
