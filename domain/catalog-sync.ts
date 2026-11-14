import type { DatabaseSync } from "node:sqlite";

export type SeedRecord = { slug: string; adminEdited?: boolean };
/** tablo adı -> tohum kayıtları. Her tablo (slug, details JSON) biçimindedir. */
export type SeedCollections = Record<string, readonly SeedRecord[]>;

const TABLE_NAME = /^[a-z_]+$/;

/**
 * Katalog tohumunun (data/catalog.ts) mevcut SQLite dosyasına güvenli aktarımı.
 *
 * - Her tohum sürümü (revision) bir kez uygulanır.
 * - Eksik kayıtlar eklenir; tohumdaki kayıtlar güncellenir.
 * - Yönetici elle düzenlediyse (details.adminEdited) kayıt ezilmez.
 * - Tohumda olmayan kayıtlara dokunulmaz; hiçbir kayıt silinmez.
 */
export function ensureSchema(db: DatabaseSync, tables: readonly string[] = ["products"]) {
  db.exec("CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY)");
  for (const table of tables) {
    if (!TABLE_NAME.test(table)) throw new Error(`Geçersiz tablo adı: ${table}`);
    db.exec(`CREATE TABLE IF NOT EXISTS ${table} (slug TEXT PRIMARY KEY, details TEXT NOT NULL)`);
  }
}

export function isRevisionApplied(db: DatabaseSync, revision: number) {
  return Boolean(db.prepare("SELECT version FROM migrations WHERE version = ?").get(revision));
}

export function syncCatalog(db: DatabaseSync, seed: SeedCollections, revision: number): boolean {
  ensureSchema(db, Object.keys(seed));
  if (isRevisionApplied(db, revision)) return false;

  db.exec("BEGIN IMMEDIATE");
  try {
    if (isRevisionApplied(db, revision)) {
      db.exec("COMMIT");
      return false;
    }
    for (const [table, records] of Object.entries(seed)) {
      const find = db.prepare(`SELECT details FROM ${table} WHERE slug = ?`);
      const insert = db.prepare(`INSERT INTO ${table} (slug, details) VALUES (?, ?)`);
      const update = db.prepare(`UPDATE ${table} SET details = ? WHERE slug = ?`);
      for (const record of records) {
        const existing = find.get(record.slug) as { details: string } | undefined;
        if (!existing) insert.run(record.slug, JSON.stringify(record));
        else if (!(JSON.parse(existing.details) as SeedRecord).adminEdited) update.run(JSON.stringify(record), record.slug);
      }
    }
    db.prepare("INSERT INTO migrations (version) VALUES (?)").run(revision);
    db.exec("COMMIT");
    return true;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
