import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { CATALOG_REVISION, catalogProducts, type CatalogProduct } from "@/data/catalog";
import { ensureSchema, isRevisionApplied, syncCatalog } from "@/domain/catalog-sync";

export function readCatalog(): CatalogProduct[] {
  const directory = join(process.cwd(), "work");
  const file = join(directory, "catalog.sqlite");
  mkdirSync(directory, { recursive: true });

  const db = new DatabaseSync(file);
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    ensureSchema(db);
    if (!isRevisionApplied(db, CATALOG_REVISION)) {
      // Güncellemeden önce mevcut veritabanının yedeğini al; hiçbir kayıt silinmez.
      db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
      const backups = join(directory, "backups");
      mkdirSync(backups, { recursive: true });
      const backup = join(backups, `catalog.before-revision-${CATALOG_REVISION}.sqlite`);
      if (existsSync(file) && !existsSync(backup)) copyFileSync(file, backup);
      syncCatalog(db, catalogProducts, CATALOG_REVISION);
    }
    return db
      .prepare("SELECT details FROM products ORDER BY rowid")
      .all()
      .map((row) => JSON.parse(String(row.details)) as CatalogProduct)
      .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
  } finally {
    db.close();
  }
}
