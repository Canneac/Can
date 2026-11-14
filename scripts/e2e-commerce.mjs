// Uçtan uca alışveriş testi: üretim derlemesini AYRI bir veri klasörüyle başlatır,
// sepet → dünya renkleri → kalıcılık → demo sipariş akışını gerçek tarayıcıda dener.
// Gerçek demo veritabanına (work/catalog.sqlite) dokunmaz.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const root = process.cwd();
const port = process.env.E2E_PORT ?? "3101";
const baseUrl = `http://localhost:${port}`;
const dataDir = join(root, "work", "e2e-data");
const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const adminPassword = "e2e-admin-password-123";
const env = { ...process.env, ADMIN_PASSWORD: adminPassword, ADMIN_SESSION_SECRET: "e2e-session-secret-0123456789abcdef", NUVESSA_DATA_DIR: dataDir, NEXT_DIST_DIR: ".next-e2e", NEXT_TELEMETRY_DISABLED: "1" };
const outputDirectory = join(root, "outputs");

const candidates = [process.env.CHROME_PATH, join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google/Chrome/Application/chrome.exe")];
async function firstAvailable(paths) {
  for (const path of paths) {
    if (!path) continue;
    try { await access(path); return path; } catch { /* sonrakini dene */ }
  }
  throw new Error("Google Chrome bulunamadı. CHROME_PATH ayarlayın.");
}

// next build, next-env.d.ts dosyasını ayrı derleme klasörüne yönlendirir; işimiz bitince eski hâline getiririz.
const nextEnvPath = join(root, "next-env.d.ts");
const nextEnvOriginal = await readFile(nextEnvPath, "utf8");
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


    // 31–35: yönetici paneli
    const guest = await browser.newContext();
    const guestPage = await guest.newPage();
    await guestPage.goto(`${baseUrl}/admin/orders`, { waitUntil: "networkidle" });
    check("Giriş yapmadan /admin/orders giriş sayfasına yönlendiriyor", guestPage.url().endsWith("/admin/login"));
    await guestPage.goto(`${baseUrl}/admin/products/new`, { waitUntil: "networkidle" });
    check("Giriş yapmadan ürün ekleme sayfası açılmıyor", guestPage.url().endsWith("/admin/login"));
    await guestPage.fill('input[name="password"]', "yanlis-parola-123");
    await guestPage.getByRole("button", { name: "Giriş yap" }).click();
    await guestPage.getByText("Parola hatalı").waitFor();
    check("Yanlış parola reddediliyor", true);
    await guestPage.fill('input[name="password"]', adminPassword);
    await guestPage.getByRole("button", { name: "Giriş yap" }).click();
    await guestPage.waitForURL(/\/admin$/);
    check("Doğru parola ile yönetici girişi yapılıyor", (await guestPage.locator("h1").innerText()) === "Özet");

    await guestPage.goto(`${baseUrl}/admin/orders`, { waitUntil: "networkidle" });
    check("Verilen demo sipariş yönetici panelinde görünüyor", (await guestPage.getByText(orderNumber).count()) >= 1 && (await guestPage.locator(".admin-badge", { hasText: "DEMO" }).count()) >= 1);
    await guestPage.locator(".admin-order").filter({ hasText: orderNumber }).locator("select").selectOption("shipped");
    await guestPage.locator(".admin-order").filter({ hasText: orderNumber }).getByRole("button", { name: "Durumu güncelle" }).click();
    await guestPage.waitForLoadState("networkidle");
    await page.goto(`${baseUrl}/orders/${orderNumber}`, { waitUntil: "networkidle" });
    check("Sipariş durumu yönetici panelinden güncellenebiliyor", (await page.locator("body").innerText()).includes("Kargoya verildi"));

    await guestPage.goto(`${baseUrl}/admin/categories`, { waitUntil: "networkidle" });
    await guestPage.fill('input[aria-label="Yeni kategori adı"]', "Deneme Kategorisi");
    await guestPage.getByRole("button", { name: "Kategori ekle" }).click();
    await guestPage.waitForURL(/saved=deneme-kategorisi/);

    await guestPage.goto(`${baseUrl}/admin/products/new`, { waitUntil: "networkidle" });
    await guestPage.fill('input[name="name"]', "Deneme Test Ürünü");
    await guestPage.selectOption('select[name="categorySlug"]', "deneme-kategorisi");
    await guestPage.fill('textarea[name="description"]', "Yönetici panelinden eklenen deneme ürünü açıklaması.");
    await guestPage.fill('input[name="variantLabel0"]', "Standart");
    await guestPage.fill('input[name="variantPrice0"]', "123,45");
    await guestPage.fill('input[name="variantStock0"]', "7");
    await guestPage.getByRole("button", { name: "Ürünü oluştur" }).click();
    await guestPage.waitForURL(/saved=deneme-test-urunu/);
    await page.goto(`${baseUrl}/shop?q=deneme`, { waitUntil: "networkidle" });
    check("Yönetici ekleyen yeni ürün mağazada görünüyor", (await page.locator(".pcard").count()) === 1 && (await page.locator(".pcard").innerText()).includes("123,45"));
    await page.goto(`${baseUrl}/shop?dept=diger`, { waitUntil: "networkidle" });
    check("Yönetici kategorisi mağazada \"Diğer\" departmanı altında görünüyor", (await page.locator(".ztabs").textContent()).includes("Diğer") && (await page.locator(".pcard").count()) >= 1);
    const invalid = await guestPage.goto(`${baseUrl}/admin/products/new`, { waitUntil: "networkidle" });
    await guestPage.fill('input[name="name"]', "Eksik Ürün");
    await guestPage.fill('textarea[name="description"]', "Varyant (fiyat/stok) girilmeyen geçersiz ürün.");
    await guestPage.getByRole("button", { name: "Ürünü oluştur" }).click();
    await guestPage.waitForURL(/error=/);
    check("Eksik/geçersiz ürün formu reddediliyor", invalid?.status() === 200 && (await guestPage.locator(".admin-alert").count()) === 1);

    await guestPage.goto(`${baseUrl}/admin/products?saved=x`, { waitUntil: "networkidle" });
    const quick = guestPage.locator("form", { has: guestPage.locator('input[name="variantId"][value="saf-set"]') });
    await quick.locator('input[name="price"]').fill("99,50");
    await quick.locator('input[name="stock"]').fill("3");
    await quick.getByRole("button", { name: "Kaydet" }).click();
    await guestPage.waitForURL(/saved=saf-bitkisel/);
    await page.goto(`${baseUrl}/products/saf-bitkisel-temizlik-seti`, { waitUntil: "networkidle" });
    check("Yönetici fiyat değişikliği mağazaya yansıyor", (await page.locator(".buy-box__price").innerText()).includes("99,50"));
    check("Yönetici stok değişikliği mağazaya yansıyor", (await page.locator(".buy-box__stock").innerText()).includes("Son 3"));
    const oldOrder = await (await page.request.get(`${baseUrl}/orders/${orderNumber}`)).text();
    check("Eski siparişin fiyat kaydı fiyat değişiminden etkilenmiyor", oldOrder.includes("₺1.490") || oldOrder.includes("1.490"));

    // Görsel yükleme: geçerli PNG kabul edilir, sahte dosya reddedilir, yüklenen görsel sunulur
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
    await guestPage.goto(`${baseUrl}/admin/products/new`, { waitUntil: "networkidle" });
    await guestPage.fill('input[name="name"]', "Görselli Test Ürünü");
    await guestPage.fill('textarea[name="description"]', "Görsel yükleme denemesi için eklenen ürün.");
    await guestPage.fill('input[name="variantLabel0"]', "Standart");
    await guestPage.fill('input[name="variantPrice0"]', "10");
    await guestPage.setInputFiles('input[name="upload"]', { name: "x.png", mimeType: "image/png", buffer: png });
    await guestPage.getByRole("button", { name: "Ürünü oluştur" }).click();
    await guestPage.waitForURL(/saved=gorselli-test-urunu/);
    await page.goto(`${baseUrl}/products/gorselli-test-urunu`, { waitUntil: "networkidle" });
    const uploaded = await page.locator(".zp__media img").first().getAttribute("src");
    check("Yüklenen görsel ürün sayfasında görünüyor", Boolean(uploaded) && decodeURIComponent(uploaded).includes("/uploads/"));
    const raw = decodeURIComponent(uploaded).match(/\/uploads\/[a-f0-9]{20}\.png/)[0];
    check("Yüklenen görsel /uploads yolundan sunuluyor", (await page.request.get(`${baseUrl}${raw}`)).status() === 200);
    check("Geçersiz /uploads adı reddediliyor", (await page.request.get(`${baseUrl}/uploads/..%2Fcatalog.sqlite`)).status() === 404);
    await guestPage.goto(`${baseUrl}/admin/products/new`, { waitUntil: "networkidle" });
    await guestPage.fill('input[name="name"]', "Sahte Dosya Ürünü");
    await guestPage.fill('textarea[name="description"]', "Sahte görsel yükleme denemesi.");
    await guestPage.fill('input[name="variantLabel0"]', "Standart");
    await guestPage.fill('input[name="variantPrice0"]', "10");
    await guestPage.setInputFiles('input[name="upload"]', { name: "x.png", mimeType: "image/png", buffer: Buffer.from("bu bir görsel değil") });
    await guestPage.getByRole("button", { name: "Ürünü oluştur" }).click();
    await guestPage.waitForURL(/error=/);
    check("Görsel olmayan dosya yüklemesi reddediliyor", (await guestPage.locator(".admin-alert").innerText()).includes("PNG"));
    const health = await (await page.request.get(`${baseUrl}/api/health`)).json();
    check("Sağlık kontrolü (/api/health) veritabanını doğruluyor", health.ok === true && health.products >= 30);
    await guest.close();

    // Dünya geçişi, odalar, Shop the Room
    const tour = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const t = await tour.newPage();
    await t.goto(`${baseUrl}/worlds`, { waitUntil: "networkidle" });
    check("Dört dünya paneli listeleniyor", (await t.locator(".world-panel").count()) === 4);
    await t.locator(".zcol", { hasText: "Heritage" }).click();
    await t.waitForURL(/\/worlds\/heritage/);
    check("Dünya geçişi (renk perdesi) Heritage sayfasına götürüyor", (await t.locator("h1").textContent()).toLowerCase().includes("heritage"));
    for (const [slug, cls] of [["modern-form", "zw--modern"], ["soft-living", "zw--soft"], ["heritage", "zw--heritage"], ["art-house", "zw--art"]]) {
      const response = await t.goto(`${baseUrl}/worlds/${slug}`, { waitUntil: "networkidle" });
      check(`/worlds/${slug} açılıyor ve kendi yerleşimini kullanıyor`, response?.status() === 200 && (await t.locator(`main.${cls}`).count()) === 1 && (await t.locator(".pcard").count()) > 0);
    }
    await t.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await t.locator(".room-scene__dot").first().scrollIntoViewIfNeeded();
    await t.locator(".room-scene__dot").nth(2).click(); // 3. nokta: tek varyantlı vazo (doğrudan sepete eklenebilir)
    await t.locator(".room-scene__card").waitFor();
    check("Shop the Room noktası ürün kartını açıyor (ad, fiyat, stok)", (await t.locator(".room-scene__card").innerText()).includes("₺"));
    const hotspotLink = await t.locator(".room-scene__actions a").first().getAttribute("href");
    check("Nokta gerçek ürün sayfasına bağlanıyor", /^\/products\/[a-z0-9-]+$/.test(hotspotLink));
    await t.locator(".room-scene__card .add-to-cart__button").first().click();
    await t.getByText("Sepete eklendi").first().waitFor();
    check("Shop the Room'dan sepete ekleme çalışıyor", (await t.locator('a[href="/cart"] b').first().innerText()) === "1");
    const responses = [];
    for (const path of ["/", "/shop", "/wishlist", "/cart", "/checkout", "/admin/login"]) responses.push((await t.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" }))?.status());
    check("Ana menü ve alışveriş sayfaları 200 veriyor", responses.every((code) => code === 200));
    await t.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
    await t.locator(".pcard__fav").first().click();
    check("Favori ekleme üst menüdeki sayacı güncelliyor", (await t.locator('a[href="/wishlist"] b').first().innerText()) === "1");
    await t.goto(`${baseUrl}/wishlist`, { waitUntil: "networkidle" });
    check("Favoriler sayfasında ürün listeleniyor", (await t.locator(".pcard").count()) === 1);
    await tour.close();

    // Üyelik
    const memberCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const m = await memberCtx.newPage();
    const email = `uye${Date.now()}@example.com`;
    await m.goto(`${baseUrl}/account`, { waitUntil: "networkidle" });
    check("Giriş yapmayan kullanıcı /account'tan giriş sayfasına yönlendiriliyor", m.url().includes("/account/login"));
    await m.goto(`${baseUrl}/account/register`, { waitUntil: "networkidle" });
    await m.fill('input[name="name"]', "Deniz Test");
    await m.fill('input[name="email"]', email);
    await m.fill('input[name="password"]', "123");
    await m.evaluate(() => document.querySelector('input[name="password"]').removeAttribute("minlength"));
    await m.getByRole("button", { name: "Üye ol" }).click();
    await m.waitForURL(/error=/);
    check("Kısa parola ile üyelik reddediliyor", (await m.locator('.cart-error').innerText()).includes("8 karakter"));
    await m.fill('input[name="password"]', "guclu-parola-123");
    await m.getByRole("button", { name: "Üye ol" }).click();
    await m.waitForURL(/\/account$/);
    check("Üyelik oluşturuldu ve hesap sayfası açıldı", (await m.locator("h1").textContent()).includes("Merhaba, Deniz"));
    check("Üstteki hesap simgesi giriş yapıldığını gösteriyor", (await m.locator('a[href="/account"][aria-label^="Hesabım"]').count()) === 1);

    // Favori hesaba kaydolur, başka cihazda (yeni oturum) giriş yapınca gelir
    await m.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
    await m.locator(".pcard__fav").first().click();
    await m.waitForTimeout(1500);

    // Profil + ödeme ön doldurma + sipariş hesaba bağlanır
    await m.goto(`${baseUrl}/account`, { waitUntil: "networkidle" });
    await m.fill('input[name="phone"]', "05551112233");
    await m.fill('input[name="city"]', "İzmir");
    await m.fill('input[name="address"]', "Deneme Mah. Üye Sok. No: 5");
    await m.getByRole("button", { name: "Kaydet" }).click();
    await m.waitForURL(/saved=1/);
    check("Profil ve adres kaydedildi", (await m.locator(".cart-notice").innerText()).includes("kaydedildi"));
    await m.goto(`${baseUrl}/products/saf-bitkisel-temizlik-seti`, { waitUntil: "networkidle" });
    await m.locator(".buy-box__add").click();
    await m.getByText("Sepete eklendi").first().waitFor();
    await m.goto(`${baseUrl}/checkout`, { waitUntil: "networkidle" });
    await m.locator('input[name="name"]').waitFor();
    check("Ödeme formu üye bilgileriyle önceden dolu", (await m.inputValue('input[name="city"]')) === "İzmir" && (await m.inputValue('input[name="email"]')) === email);
    await m.getByRole("button", { name: "Demo siparişi onayla" }).click();
    await m.waitForURL(/\/orders\/NV-/);
    const memberOrder = await m.getByTestId("order-number").innerText();
    await m.goto(`${baseUrl}/account`, { waitUntil: "networkidle" });
    check("Sipariş üyenin hesabındaki 'Siparişlerim' listesinde", (await m.locator(".account__orders").innerText()).includes(memberOrder));

    // Çıkış, yanlış parola, doğru parola, açık yönlendirme koruması
    await m.getByRole("button", { name: "Çıkış yap" }).click();
    await m.waitForURL(/cikis=1|\/$/);
    await m.goto(`${baseUrl}/account`, { waitUntil: "networkidle" });
    check("Çıkıştan sonra /account yine giriş istiyor", m.url().includes("/account/login"));
    await m.fill('input[name="email"]', email);
    await m.fill('input[name="password"]', "yanlis-parola-999");
    await m.getByRole("button", { name: "Giriş yap" }).click();
    await m.waitForURL(/error=/);
    check("Yanlış parola genel bir hata mesajı veriyor", (await m.locator('.cart-error').innerText()).includes("hatalı"));
    await m.goto(`${baseUrl}/account/login?next=//evil.example`, { waitUntil: "networkidle" });
    await m.fill('input[name="email"]', email);
    await m.fill('input[name="password"]', "guclu-parola-123");
    await m.getByRole("button", { name: "Giriş yap" }).click();
    await m.waitForURL(/\/account$/);
    check("Dış adrese yönlendirme engelleniyor (giriş sonrası sitede kalınıyor)", new URL(m.url()).host === new URL(baseUrl).host);
    await m.goto(`${baseUrl}/account/register`, { waitUntil: "networkidle" });
    check("Giriş yapmış üye üyelik sayfasından hesabına yönlendiriliyor", m.url().endsWith("/account"));

    const device = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const d = await device.newPage();
    await d.goto(`${baseUrl}/account/login`, { waitUntil: "networkidle" });
    await d.fill('input[name="email"]', email);
    await d.fill('input[name="password"]', "guclu-parola-123");
    await d.getByRole("button", { name: "Giriş yap" }).click();
    await d.waitForURL(/\/account$/);
    await d.goto(`${baseUrl}/wishlist`, { waitUntil: "networkidle" });
    await d.locator(".pcard").first().waitFor({ timeout: 10000 });
    check("Favori başka cihazda giriş yapınca hesapla geliyor", (await d.locator(".pcard").count()) === 1);
    await device.close();

    const dup = await memberCtx.newPage();
    await dup.goto(`${baseUrl}/account`, { waitUntil: "networkidle" });
    await dup.getByRole("button", { name: "Çıkış yap" }).click();
    await dup.waitForLoadState("networkidle");
    await dup.goto(`${baseUrl}/account/register`, { waitUntil: "networkidle" });
    await dup.fill('input[name="name"]', "Başka Biri");
    await dup.fill('input[name="email"]', email.toUpperCase());
    await dup.fill('input[name="password"]', "baska-guclu-parola");
    await dup.getByRole("button", { name: "Üye ol" }).click();
    await dup.waitForURL(/error=/);
    check("Aynı e-posta (büyük/küçük harf fark etmeden) ikinci kez kaydedilemiyor", (await dup.locator('.cart-error').innerText()).includes("zaten"));
    const apiGuest = await dup.request.get(`${baseUrl}/api/account/favorites`);
    check("Giriş yapmadan favori API'si 401 veriyor", apiGuest.status() === 401);
    await memberCtx.close();

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
  await writeFile(nextEnvPath, nextEnvOriginal);
}
