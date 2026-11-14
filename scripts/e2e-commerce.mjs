// Uçtan uca alışveriş testi: üretim derlemesini AYRI bir veri klasörüyle başlatır,
// sepet → dünya renkleri → kalıcılık → demo sipariş akışını gerçek tarayıcıda dener.
// Gerçek demo veritabanına (work/catalog.sqlite) dokunmaz.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { access, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const root = process.cwd();
const port = process.env.E2E_PORT ?? "3101";
const baseUrl = `http://localhost:${port}`;
const dataDir = join(root, "work", "e2e-data");
const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const env = { ...process.env, NUVESSA_DATA_DIR: dataDir, NEXT_DIST_DIR: ".next-e2e", NEXT_TELEMETRY_DISABLED: "1" };
const outputDirectory = join(root, "outputs");

const candidates = [process.env.CHROME_PATH, join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google/Chrome/Application/chrome.exe")];
async function firstAvailable(paths) {
  for (const path of paths) {
    if (!path) continue;
    try { await access(path); return path; } catch { /* sonrakini dene */ }
  }
  throw new Error("Google Chrome bulunamadı. CHROME_PATH ayarlayın.");
}

await rm(dataDir, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
console.log("Üretim derlemesi (ayrı klasör) hazırlanıyor…");
const build = spawnSync(process.execPath, [nextBin, "build"], { cwd: root, env, stdio: "inherit" });
assert.equal(build.status, 0, "Üretim derlemesi başarısız.");

const server = spawn(process.execPath, [nextBin, "start", "-p", port], { cwd: root, env, stdio: "ignore" });
const results = [];
const check = (name, ok) => { results.push([name, ok]); assert.ok(ok, name); };

try {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(baseUrl)).ok) break; } catch { /* sunucu henüz hazır değil */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const browser = await chromium.launch({ executablePath: await firstAvailable(candidates) });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const cartCount = () => page.locator(".cart-line").count();
    const addFrom = async (url) => {
      await page.goto(`${baseUrl}${url}`, { waitUntil: "networkidle" });
      await page.locator(".buy-box__add").click();
      await page.getByText("Sepete eklendi").first().waitFor();
    };

    // 19–22: iki farklı dünyadan ürün ekle
    await addFrom("/products/mono-metal-cam-sehpa?world=modern-form");
    await addFrom("/products/mira-catal-kasik-seti?world=heritage");
    await addFrom("/products/mira-catal-kasik-seti?world=soft-living");
    await addFrom("/products/sulun-pamuk-havlu-seti");
    await page.goto(`${baseUrl}/cart`, { waitUntil: "networkidle" });
    await page.locator(".cart-line").first().waitFor();
    check("Sepette 4 ayrı satır var (aynı ürün iki dünyadan = iki satır)", (await cartCount()) === 4);
    const worldOf = (world) => page.locator(`.cart-line[data-world="${world}"]`);
    check("Modern Form satırı petrol/buz gradyanı taşıyor", (await worldOf("modern-form").evaluate((el) => getComputedStyle(el).backgroundImage)).includes("gradient") && (await worldOf("modern-form").getAttribute("class")).includes("cart-line--modern"));
    check("Heritage satırı bordo/espresso gradyanı taşıyor", (await worldOf("heritage").getAttribute("class")).includes("cart-line--heritage"));
    const bgModern = await worldOf("modern-form").evaluate((el) => getComputedStyle(el).backgroundImage);
    const bgHeritage = await worldOf("heritage").evaluate((el) => getComputedStyle(el).backgroundImage);
    check("İki dünyanın gradyanı birbirinden farklı", bgModern !== bgHeritage);
    check("/shop kaynaklı satır nötr temada", (await worldOf("shop").getAttribute("class")).includes("cart-line--neutral"));
    await page.screenshot({ path: join(outputDirectory, "e2e-cart-desktop.png"), fullPage: true });

    // 25: kalıcılık
    await page.reload({ waitUntil: "networkidle" });
    await page.locator(".cart-line").first().waitFor();
    check("Sayfa yenilenince sepet ve dünya bilgisi korunuyor", (await cartCount()) === 4 && (await worldOf("heritage").count()) === 1);

    // 23–24, 26: adet, silme, toplam
    const totalBefore = await page.locator(".cart-summary__total dd").innerText();
    await worldOf("heritage").getByRole("button", { name: "Adedi artır" }).click();
    await page.waitForFunction((before) => document.querySelector(".cart-summary__total dd")?.textContent !== before, totalBefore);
    check("Adet artırınca toplam güncelleniyor", (await worldOf("heritage").locator("output").innerText()) === "2");
    await worldOf("soft-living").getByRole("button", { name: "Kaldır" }).click();
    await page.waitForFunction(() => document.querySelectorAll(".cart-line").length === 3);
    check("Ürün kaldırılabiliyor", (await cartCount()) === 3);
    check("Kargo, indirim ve genel toplam satırları görünüyor", (await page.locator(".cart-summary__rows > div").count()) === 4);

    // Başlıkta sepet sayacı
    check("Üst menüdeki sepet sayacı toplam adedi gösteriyor", (await page.locator('a[href="/cart"] b').first().innerText()) === "4");

    // 27–30: demo ödeme
    await page.getByRole("link", { name: "Ödemeye geç" }).click();
    await page.waitForURL(/checkout/);
    check("Ödeme sayfasında DEMO uyarısı var", (await page.locator(".demo-banner").first().innerText()).includes("DEMO"));
    await page.getByRole("button", { name: "Demo siparişi onayla" }).click();
    await page.locator("small[role=alert]").first().waitFor();
    check("Boş form doğrulama hatası veriyor", (await page.locator("small[role=alert]").count()) >= 4);
    await page.fill('input[name="name"]', "Otomatik Test Müşterisi");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="phone"]', "05550000000");
    await page.fill('input[name="city"]', "İstanbul");
    await page.fill('input[name="address"]', "Örnek Mah. Test Sok. No: 1 Daire 2");
    await page.getByRole("button", { name: "Demo siparişi onayla" }).click();
    await page.waitForURL(/\/orders\/NV-/);
    const orderNumber = await page.getByTestId("order-number").innerText();
    check("Sipariş numarası alındı", /^NV-\d{8}-\d{5}$/.test(orderNumber));
    check("Onay sayfasında demo olduğu belirtiliyor", (await page.locator(".demo-banner").innerText()).includes("DEMO"));
    await page.goto(`${baseUrl}/cart`, { waitUntil: "networkidle" });
    check("Sipariş sonrası sepet boşaldı", (await page.locator(".cart-empty").count()) === 1);

    // Çift sipariş engeli: aynı anahtarla ikinci istek aynı siparişi döndürür
    const body = { lines: [{ productSlug: "saf-bitkisel-temizlik-seti", variantId: "saf-set", quantity: 1, sourceWorld: null }], customer: { name: "Otomatik Test", email: "t@example.com", phone: "05550000000", address: "Test adresi 12345", city: "Ankara", note: "" }, idempotencyKey: "e2e-idempotency-key-0001" };
    const post = () => page.request.post(`${baseUrl}/api/orders`, { data: body });
    const first = await (await post()).json();
    const second = await (await post()).json();
    check("Aynı işlem anahtarı çift sipariş oluşturmuyor", first.orderNumber === second.orderNumber && second.replayed === true);

    // Sunucu fiyatı kendisi belirler (istemci fiyatı yok sayılır)
    const quote = await (await page.request.post(`${baseUrl}/api/cart/quote`, { data: { lines: [{ productSlug: "saf-bitkisel-temizlik-seti", variantId: "saf-set", quantity: 2, sourceWorld: null, priceInKurus: 1 }] } })).json();
    check("Sunucu istemcinin gönderdiği fiyatı yok sayıyor", quote.lines[0].unitPriceInKurus === 89000 && quote.subtotalInKurus === 178000);
    const bad = await page.request.post(`${baseUrl}/api/orders`, { data: { lines: [], customer: {}, idempotencyKey: "x" } });
    check("Boş/geçersiz sipariş reddediliyor", bad.status() === 400);

    // Stok: tükenmiş varyant satın alınamaz
    const soldOut = await page.request.post(`${baseUrl}/api/orders`, { data: { ...body, lines: [{ productSlug: "fon-heykelsi-sehpa", variantId: "fon-mor", quantity: 1, sourceWorld: "art-house" }], idempotencyKey: "e2e-idempotency-key-0002" } });
    check("Tükenen ürün için sipariş verilemiyor", soldOut.status() === 400 || soldOut.status() === 409);

    // Mobil sepet
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(`${baseUrl}/products/mono-metal-cam-sehpa?world=modern-form`, { waitUntil: "networkidle" });
    await mobile.locator(".buy-box__add").click();
    await mobile.goto(`${baseUrl}/products/orta-banyo-paspasi`, { waitUntil: "networkidle" });
    await mobile.locator(".buy-box__add").click();
    await mobile.goto(`${baseUrl}/cart`, { waitUntil: "networkidle" });
    await mobile.locator(".cart-line").first().waitFor();
    check("Mobil sepette yatay taşma yok", await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check("Mobil sepette dünya teması korunuyor", (await mobile.locator('.cart-line[data-world="modern-form"]').getAttribute("class")).includes("cart-line--modern"));
    await mobile.screenshot({ path: join(outputDirectory, "e2e-cart-mobile.png"), fullPage: true });
  } finally {
    await browser.close();
  }
  console.log(`\nUçtan uca alışveriş testi: ${results.length} kontrol başarılı.`);
  for (const [name] of results) console.log(`  ✔ ${name}`);
} finally {
  server.kill();
}
