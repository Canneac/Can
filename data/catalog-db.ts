import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { catalogProducts, type CatalogProduct } from "@/data/catalog";

export function readCatalog(): CatalogProduct[] {
  const directory = join(process.cwd(), "work");
  mkdirSync(directory, { recursive: true });
  const db = new DatabaseSync(join(directory, "catalog.sqlite"));
  try {
    db.exec("PRAGMA busy_timeout = 5000; BEGIN IMMEDIATE");
    db.exec("CREATE TABLE IF NOT EXISTS products (slug TEXT PRIMARY KEY, details TEXT NOT NULL); CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY)");
    if (!db.prepare("SELECT version FROM migrations WHERE version = 1").get()) {
      const insert = db.prepare("INSERT OR IGNORE INTO products (slug, details) VALUES (?, ?)");
      for (const product of catalogProducts) insert.run(product.slug, JSON.stringify(product));
      db.exec("INSERT INTO migrations VALUES (1)");
    }
    db.exec("COMMIT");
    return db.prepare("SELECT details FROM products ORDER BY rowid").all().map(
      (row) => JSON.parse(String(row.details)) as CatalogProduct,
    );
  } finally {
    db.close();
  }
}
