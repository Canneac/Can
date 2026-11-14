import test from "node:test";
import assert from "node:assert/strict";
import { computeQuote, lineKey, SHIPPING_FEE_KURUS } from "../domain/cart.ts";
import { deriveProduct } from "../domain/catalog-types.ts";
import { seedProducts, designWorlds } from "../data/catalog.ts";

const products = seedProducts.map(deriveProduct);
const worlds = designWorlds.map((w) => w.slug);
const mira = products.find((p) => p.slug === "mira-catal-kasik-seti");
const vela = products.find((p) => p.slug === "vela-cift-kapili-buzdolabi");

test("aynı ürün iki farklı dünyadan eklenirse iki ayrı satır olur", () => {
  const quote = computeQuote([
    { productSlug: "mira-catal-kasik-seti", variantId: "mira-24", quantity: 1, sourceWorld: "heritage" },
    { productSlug: "mira-catal-kasik-seti", variantId: "mira-24", quantity: 2, sourceWorld: "soft-living" },
    { productSlug: "mira-catal-kasik-seti", variantId: "mira-24", quantity: 1, sourceWorld: "heritage" },
  ], products, worlds);
  assert.equal(quote.lines.length, 2);
  assert.equal(quote.lines.find((l) => l.sourceWorld === "heritage").quantity, 2);
  assert.notEqual(lineKey("a", "heritage"), lineKey("a", null));
});

test("fiyat tarayıcıdan değil katalogdan gelir; toplam ve kargo doğru hesaplanır", () => {
  const quote = computeQuote([{ productSlug: "mira-catal-kasik-seti", variantId: "mira-24", quantity: 1, sourceWorld: null, priceInKurus: 1 }], products, worlds);
  assert.equal(quote.lines[0].unitPriceInKurus, mira.variants[0].priceInKurus);
  assert.equal(quote.subtotalInKurus, 149000);
  assert.equal(quote.shippingInKurus, SHIPPING_FEE_KURUS);
  assert.equal(quote.totalInKurus, 149000 + SHIPPING_FEE_KURUS);
  const big = computeQuote([{ productSlug: vela.slug, variantId: "vela-inox", quantity: 1, sourceWorld: "modern-form" }], products, worlds);
  assert.equal(big.shippingInKurus, 0);
});

test("stok aşan adet düşürülür, tükenen ve bilinmeyen satırlar çıkarılır, geçersiz dünya nötre döner", () => {
  const quote = computeQuote([
    { productSlug: "vela-cift-kapili-buzdolabi", variantId: "vela-siyah", quantity: 9, sourceWorld: "modern-form" },
    { productSlug: "lora-cop-kovasi", variantId: "lora-bordo-50", quantity: 1, sourceWorld: null },
    { productSlug: "yok", variantId: "yok", quantity: 1, sourceWorld: null },
    { productSlug: "mira-catal-kasik-seti", variantId: "mira-24", quantity: 1, sourceWorld: "art-house" },
  ], products, worlds);
  const siyah = quote.lines.find((l) => l.variantId === "vela-siyah");
  assert.equal(siyah.quantity, 2);
  assert.equal(siyah.note, "quantity_reduced");
  assert.equal(quote.removedKeys.length, 2);
  assert.equal(quote.lines.find((l) => l.variantId === "mira-24").sourceWorld, null);
});

test("geçersiz adetler yok sayılır; boş sepette kargo ücreti yoktur", () => {
  const quote = computeQuote([{ productSlug: "mira-catal-kasik-seti", variantId: "mira-24", quantity: -3, sourceWorld: null }, null], products, worlds);
  assert.equal(quote.lines.length, 0);
  assert.equal(quote.totalInKurus, 0);
});
