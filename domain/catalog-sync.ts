import type { DatabaseSync } from "node:sqlite";

export type SeedRecord = { slug: string };

/**
 * Katalog tohumunun (data/catalog.ts) mevcut SQLite dosyasına güvenli aktarımı.
 *
 * Eski yöntem yalnızca ilk çalıştırmada ürün ekliyordu; koddaki ürünler değişince
 * veritabanı güncellenmiyordu. Burada her tohum sürümü (revision) bir kez uygulanır:
 * tohumdaki slug'lar eklenir ya da güncellenir, tohumda olmayan kayıtlara dokunulmaz,
 * hiçbir kayıt silinmez.
 */
export function ensureSchema(db: DatabaseSync) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS products (slug TEXT PRIMARY KEY, details TEXT NOT NULL); " +
      "CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY)",
  );
}

export function isRevisionApplied(db: DatabaseSync, revision: number) {
  return Boolean(db.prepare("SELECT version FROM migrations WHERE version = ?").get(revision));
}

export function syncCatalog(db: DatabaseSync, seed: readonly SeedRecord[], revision: number): boolean {
  ensureSchema(db);
  if (isRevisionApplied(db, revision)) return false;

  db.exec("BEGIN IMMEDIATE");
  try {
    if (isRevisionApplied(db, revision)) {
      db.exec("COMMIT");
      return false;
    }
    const upsert = db.prepare(
      "INSERT INTO products (slug, details) VALUES (?, ?) ON CONFLICT(slug) DO UPDATE SET details = excluded.details",
    );
    for (const record of seed) upsert.run(record.slug, JSON.stringify(record));
    db.prepare("INSERT INTO migrations (version) VALUES (?)").run(revision);
    db.exec("COMMIT");
    return true;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
