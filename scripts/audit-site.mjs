// Tüm siteyi tarar: iç bağlantıları gezer (en çok 120 sayfa) ve her sayfada şunları denetler:
// HTTP durumu, konsol hataları/uyarıları, erişilebilirlik (axe-core: WCAG 2.x A/AA), yatay taşma (6 ekran),
// dokunma hedefi boyutu (< 24 px), görsel alt metni, başlık sırası, <title>/<meta description>, kırık görsel.
// Kullanım: node scripts/audit-site.mjs [adres]   (varsayılan http://localhost:3000)
import { readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3000";
const axeSource = readFileSync(join(process.cwd(), "node_modules", "axe-core", "axe.min.js"), "utf8");
const browser = await chromium.launch({ executablePath: join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google/Chrome/Application/chrome.exe") });

// ---- 1. Bağlantıları gez ----
const crawlPage = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const seen = new Set();
const queue = ["/"];
const skip = /^\/(admin|api|uploads|orders|_next)/;
while (queue.length && seen.size < 120) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  try { await crawlPage.goto(base + path, { waitUntil: "domcontentloaded" }); } catch { continue; }
  const links = await crawlPage.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
  for (const href of links) {
    if (!href || href.startsWith("#") || /^(mailto|tel|http)/.test(href)) continue;
    const clean = href.split("#")[0];
    if (!clean || skip.test(clean)) continue;
    const key = clean.replace(/\?.*$/, "").startsWith("/shop") ? clean : clean.split("?")[0];
    if (!seen.has(key) && !queue.includes(key) && queue.length < 400) queue.push(key);
  }
}
const pages = [...seen].sort();
console.log(`Taranan sayfa: ${pages.length}`);

// ---- 2. Her sayfayı denetle ----
const widths = [[320, 640], [375, 812], [390, 844], [768, 1024], [844, 390], [1366, 768]];
const issues = new Map();
const add = (key, detail) => { if (!issues.has(key)) issues.set(key, new Set()); issues.get(key).add(detail); };

for (const path of pages) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const consoleProblems = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) consoleProblems.push(message.text().slice(0, 140)); });
  page.on("pageerror", (error) => consoleProblems.push("pageerror: " + String(error).slice(0, 140)));
  const bad = [];
  page.on("response", (response) => { if (response.status() >= 400 && !response.url().includes("favicon")) bad.push(`${response.status()} ${new URL(response.url()).pathname}`); });
  const response = await page.goto(base + path, { waitUntil: "networkidle" });
  if (response?.status() !== 200) add("HTTP durumu 200 değil", `${path} → ${response?.status()}`);
  consoleProblems.forEach((text) => add("Konsol hata/uyarı", `${path}: ${text}`));
  bad.forEach((text) => add("Başarısız istek (4xx/5xx)", `${path}: ${text}`));

  const info = await page.evaluate(() => {
    const out = {};
    out.title = document.title;
    out.description = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    out.h1 = document.querySelectorAll("h1").length;
    out.lang = document.documentElement.lang;
    out.brokenImages = [...document.images].filter((image) => image.complete && image.naturalWidth === 0 && image.currentSrc).map((image) => image.currentSrc);
    out.noAlt = [...document.images].filter((image) => !image.hasAttribute("alt")).map((image) => image.currentSrc.slice(-40));
    out.small = [...document.querySelectorAll("a[href], button, input:not([type=hidden]), select, summary")]
      .filter((el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && (r.width < 24 || r.height < 24) && !el.closest(".visually-hidden") && !(el.tagName === "A" && el.closest("p, li, nav.zf") && r.height >= 14 && r.width >= 24); })
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 25)} "${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 20)}" ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`);
    return out;
  });
  if (!info.title) add("Sayfa başlığı (<title>) yok", path);
  if (!info.description && !/^\/(cart|checkout|account|wishlist|orders)/.test(path)) add("Meta açıklama yok", path);
  if (info.h1 !== 1) add("Sayfada tam 1 adet <h1> olmalı", `${path}: ${info.h1}`);
  if (!info.lang) add("<html lang> yok", path);
  info.brokenImages.forEach((src) => add("Kırık görsel", `${path}: ${src}`));
  info.noAlt.forEach((src) => add("Görselde alt özniteliği yok", `${path}: ${src}`));
  info.small.slice(0, 6).forEach((text) => add("Dokunma hedefi < 24 px (WCAG 2.2)", `${path}: ${text}`));

  await page.waitForTimeout(1200);
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } })).violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, sample: v.nodes[0]?.target?.join(" ").slice(0, 80) })));
  axe.forEach((v) => add(`Erişilebilirlik [${v.impact}] ${v.id}: ${v.help}`, `${path} (${v.n}×) ${v.sample}`));
  await ctx.close();

  for (const [w, h] of widths) {
    const c = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 1000, hasTouch: w < 1000 });
    const p = await c.newPage();
    await p.goto(base + path, { waitUntil: "networkidle" });
    const overflow = await p.evaluate(() => {
      const wide = document.documentElement.scrollWidth - innerWidth;
      const offenders = wide > 0 ? [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest(".ztabs, .zrail, .zcols, .category-bar, .zmenu, .zsearch, .env-stage, .cin")).slice(0, 2).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 30)}`) : [];
      return { wide, offenders };
    });
    if (overflow.wide > 0) add("Yatay taşma", `${path} @${w}×${h}: +${overflow.wide}px ${overflow.offenders.join(", ")}`);
    await c.close();
  }
}
await browser.close();

console.log("\n===== DENETİM SONUCU =====");
if (!issues.size) console.log("Sorun bulunmadı.");
for (const [key, details] of issues) {
  console.log(`\n■ ${key}  (${details.size})`);
  [...details].slice(0, 5).forEach((detail) => console.log("   - " + detail));
  if (details.size > 5) console.log(`   … +${details.size - 5} daha`);
}
