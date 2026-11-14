import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { syncCatalog, ensureSchema } from "../domain/catalog-sync.ts";
import { catalogProducts, CATALOG_REVISION } from "../data/catalog.ts";

const rows = (db) => db.prepare("SELECT slug, details FROM products ORDER BY rowid").all();

test("tohum yeni ürünleri ekler ve ikinci çalıştırmada hiçbir şey yapmaz", () => {
  const db = new DatabaseSync(":memory:");
  assert.equal(syncCatalog(db, catalogProducts, CATALOG_REVISION), true);
  assert.equal(rows(db).length, catalogProducts.length);
  assert.equal(syncCatalog(db, catalogProducts, CATALOG_REVISION), false);
  assert.equal(rows(db).length, catalogProducts.length);
});

test("eski sürümden gelen veritabanı güncellenir, tohumda olmayan kayıtlar korunur", () => {
  const db = new DatabaseSync(":memory:");
  ensureSchema(db);
  db.prepare("INSERT INTO products VALUES (?, ?)").run(catalogProducts[0].slug, JSON.stringify({ ...catalogProducts[0], name: "ESKİ AD" }));
  db.prepare("INSERT INTO products VALUES (?, ?)").run("elle-eklenen", JSON.stringify({ slug: "elle-eklenen" }));
  db.prepare("INSERT INTO migrations VALUES (1)").run();

  assert.equal(syncCatalog(db, catalogProducts, CATALOG_REVISION), true);
  const all = rows(db);
  assert.equal(all.length, catalogProducts.length + 1);
  assert.equal(JSON.parse(all.find((r) => r.slug === catalogProducts[0].slug).details).name, catalogProducts[0].name);
  assert.ok(all.some((r) => r.slug === "elle-eklenen"));
});

test("katalog slug'ları benzersizdir ve fiyatlar kuruş cinsinden tam sayıdır", () => {
  assert.equal(new Set(catalogProducts.map((p) => p.slug)).size, catalogProducts.length);
  for (const product of catalogProducts) assert.ok(Number.isSafeInteger(product.priceInKurus) && product.priceInKurus > 0);
});
