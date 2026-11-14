import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  CATALOG_REVISION, seedBrands, seedCategories, seedProducts, seedRooms,
  type BrandRecord, type CategoryRecord, type Product, type ProductRecord, type RoomRecord,
} from "@/data/catalog";
import { deriveProduct } from "@/domain/catalog-types";
import { ensureSchema, isRevisionApplied, syncCatalog } from "@/domain/catalog-sync";

const TABLES = ["products", "categories", "brands", "rooms"] as const;

/** Veri klasörü: varsayılan ./work; testler NUVESSA_DATA_DIR ile ayrı bir klasör kullanır. */
export function dataDirectory() {
  return process.env.NUVESSA_DATA_DIR ? process.env.NUVESSA_DATA_DIR : join(process.cwd(), "work");
}

export function databaseFile() {
  return join(dataDirectory(), "catalog.sqlite");
}

/** Veritabanını açar, şemayı ve (gerekirse yedekli) tohum güncellemesini uygular. */
export function openDatabase(): DatabaseSync {
  const file = databaseFile();
  mkdirSync(dataDirectory(), { recursive: true });
  const db = new DatabaseSync(file);
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    ensureSchema(db, TABLES);
    ensureCommerceSchema(db);
    if (!isRevisionApplied(db, CATALOG_REVISION)) {
      // Güncellemeden önce mevcut veritabanının yedeğini al; hiçbir kayıt silinmez.
      db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
      const backups = join(dataDirectory(), "backups");
      mkdirSync(backups, { recursive: true });
      const backup = join(backups, `catalog.before-revision-${CATALOG_REVISION}.sqlite`);
      if (existsSync(file) && !existsSync(backup)) copyFileSync(file, backup);
      syncCatalog(
        db,
        { products: seedProducts, categories: seedCategories, brands: seedBrands, rooms: seedRooms },
        CATALOG_REVISION,
      );
    }
    seedInventory(db);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

/** Eksik varyantlar için başlangıç stoğunu ekler; mevcut stok değerlerine dokunmaz. */
export function seedInventory(db: DatabaseSync) {
  const insert = db.prepare("INSERT OR IGNORE INTO inventory (variant_id, stock) VALUES (?, ?)");
  const known = new Set(db.prepare("SELECT variant_id FROM inventory").all().map((row) => String(row.variant_id)));
  for (const record of readAll<ProductRecord>(db, "products")) {
    for (const variant of record.variants) if (!known.has(variant.id)) insert.run(variant.id, Math.max(0, variant.stock));
  }
}

/** Sipariş tabloları (yalnızca ekler; mevcut veriye dokunmaz). */
function ensureCommerceSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (variant_id TEXT PRIMARY KEY, stock INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      idempotency_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      is_demo INTEGER NOT NULL DEFAULT 1,
      customer TEXT NOT NULL,
      subtotal_kurus INTEGER NOT NULL,
      shipping_kurus INTEGER NOT NULL,
      discount_kurus INTEGER NOT NULL,
      total_kurus INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      product_slug TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      variant_label TEXT NOT NULL,
      unit_price_kurus INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      source_world TEXT
    );
  `);
}

function readAll<T>(db: DatabaseSync, table: string): T[] {
  return db.prepare(`SELECT details FROM ${table} ORDER BY rowid`).all().map((row) => JSON.parse(String(row.details)) as T);
}

/** Ürün kayıtlarını okur ve varyant stoklarını envanter tablosundaki gerçek değerle değiştirir. */
export function readProductRecords(db: DatabaseSync): ProductRecord[] {
  const stock = new Map(db.prepare("SELECT variant_id, stock FROM inventory").all().map((row) => [String(row.variant_id), Number(row.stock)]));
  return readAll<ProductRecord>(db, "products").map((record) => ({
    ...record,
    variants: record.variants.map((variant) => ({ ...variant, stock: stock.get(variant.id) ?? variant.stock })),
  }));
}

export function readCatalog(): Product[] {
  const db = openDatabase();
  try {
    return readProductRecords(db)
      .filter((record) => record.status !== "archived")
      .map(deriveProduct)
      .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
  } finally {
    db.close();
  }
}

export function readAllProducts(): Product[] {
  const db = openDatabase();
  try {
    return readProductRecords(db).map(deriveProduct).sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
  } finally {
    db.close();
  }
}

export type CatalogSnapshot = {
  products: Product[];
  categories: CategoryRecord[];
  brands: BrandRecord[];
  rooms: RoomRecord[];
};

export function readSnapshot(): CatalogSnapshot {
  const db = openDatabase();
  try {
    return {
      products: readProductRecords(db)
        .filter((record) => record.status !== "archived")
        .map(deriveProduct)
        .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999)),
      categories: readAll<CategoryRecord>(db, "categories").filter((c) => c.visible).sort((a, b) => a.order - b.order),
      brands: readAll<BrandRecord>(db, "brands"),
      rooms: readAll<RoomRecord>(db, "rooms").sort((a, b) => a.order - b.order),
    };
  } finally {
    db.close();
  }
}
