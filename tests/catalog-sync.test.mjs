import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { syncCatalog, ensureSchema } from "../domain/catalog-sync.ts";
import { seedProducts as catalogProducts, seedCategories, CATALOG_REVISION } from "../data/catalog.ts";

const rows = (db) => db.prepare("SELECT slug, details FROM products ORDER BY rowid").all();

test("tohum yeni ürünleri ekler ve ikinci çalıştırmada hiçbir şey yapmaz", () => {
  const db = new DatabaseSync(":memory:");
  assert.equal(syncCatalog(db, { products: catalogProducts, categories: seedCategories }, CATALOG_REVISION), true);
  assert.equal(rows(db).length, catalogProducts.length);
  assert.equal(syncCatalog(db, { products: catalogProducts, categories: seedCategories }, CATALOG_REVISION), false);
  assert.equal(rows(db).length, catalogProducts.length);
});

test("eski sürümden gelen veritabanı güncellenir, tohumda olmayan kayıtlar korunur", () => {
  const db = new DatabaseSync(":memory:");
  ensureSchema(db, ["products", "categories"]);
  db.prepare("INSERT INTO products VALUES (?, ?)").run(catalogProducts[0].slug, JSON.stringify({ ...catalogProducts[0], name: "ESKİ AD" }));
  db.prepare("INSERT INTO products VALUES (?, ?)").run("elle-eklenen", JSON.stringify({ slug: "elle-eklenen" }));
  db.prepare("INSERT INTO migrations VALUES (1)").run();

  assert.equal(syncCatalog(db, { products: catalogProducts, categories: seedCategories }, CATALOG_REVISION), true);
  const all = rows(db);
  assert.equal(all.length, catalogProducts.length + 1);
  assert.equal(JSON.parse(all.find((r) => r.slug === catalogProducts[0].slug).details).name, catalogProducts[0].name);
  assert.ok(all.some((r) => r.slug === "elle-eklenen"));
});

test("katalog slug'ları benzersizdir ve fiyatlar kuruş cinsinden tam sayıdır", () => {
  assert.equal(new Set(catalogProducts.map((p) => p.slug)).size, catalogProducts.length);
  for (const product of catalogProducts) assert.ok(Number.isSafeInteger(product.variants[0].priceInKurus) && product.variants[0].priceInKurus > 0);
});

test("yönetici düzenlemesi (adminEdited) tohum güncellemesinde ezilmez", () => {
  const db = new DatabaseSync(":memory:");
  ensureSchema(db, ["products", "categories"]);
  const edited = { ...catalogProducts[0], name: "YÖNETİCİ ADI", adminEdited: true };
  db.prepare("INSERT INTO products VALUES (?, ?)").run(edited.slug, JSON.stringify(edited));
  syncCatalog(db, { products: catalogProducts, categories: seedCategories }, CATALOG_REVISION);
  assert.equal(JSON.parse(rows(db).find((r) => r.slug === edited.slug).details).name, "YÖNETİCİ ADI");
});

test("her varyant benzersizdir ve her ürünün en az bir fiyatlı varyantı vardır", () => {
  const ids = catalogProducts.flatMap((p) => p.variants.map((v) => v.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const p of catalogProducts) assert.ok(p.variants.some((v) => v.priceInKurus > 0), p.slug);
  const categories = new Set(seedCategories.map((c) => c.slug));
  for (const p of catalogProducts) assert.ok(categories.has(p.categorySlug), `${p.slug}: bilinmeyen kategori`);
});
