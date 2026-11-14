import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dataDirectory, openDatabase, readProductRecords } from "@/data/catalog-db";
import { designWorlds } from "@/data/catalog";
import type { BrandRecord, CategoryRecord, ProductIconName, ProductRecord, Tone, Variant } from "@/domain/catalog-types";

export function slugify(text: string) {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export const TONES: Tone[] = ["stone", "wine", "shadow", "sage", "ink"];
export const ICONS: ProductIconName[] = ["sofa", "table", "fridge", "oven", "dishwasher", "pot", "bed", "rug", "lamp", "towel", "spray", "bin", "cutlery", "vase", "coffee", "box", "plug", "chair", "desk", "hanger", "cup", "sponge"];

export type ProductForm = {
  slug: string;
  name: string; brand: string; categorySlug: string; description: string; material: string; materialGroups: string;
  worlds: string[]; rooms: string[]; searchTerms: string; icon: string; tone: string; image: string; imageAlt: string;
  specs: string; isDemo: boolean; archived: boolean;
  variants: { id: string; label: string; color: string; price: string; stock: string }[];
};

function toKurus(value: string) {
  const amount = Number(String(value).replace(",", "."));
  return Number.isFinite(amount) && amount > 0 && amount < 10_000_000 ? Math.round(amount * 100) : null;
}

export function validateProductForm(form: ProductForm, existingSlugs: readonly string[], categorySlugs: readonly string[], brandSlugs: readonly string[]) {
  const errors: string[] = [];
  if (form.name.trim().length < 3) errors.push("Ürün adı en az 3 karakter olmalı.");
  if (!brandSlugs.includes(form.brand)) errors.push("Geçerli bir marka seçin.");
  if (!categorySlugs.includes(form.categorySlug)) errors.push("Geçerli bir kategori seçin.");
  if (form.description.trim().length < 10) errors.push("Açıklama en az 10 karakter olmalı.");
  const variants: Variant[] = [];
  for (const row of form.variants) {
    if (!row.label.trim() && !row.price.trim()) continue;
    const price = toKurus(row.price);
    const stock = Math.floor(Number(row.stock));
    if (!row.label.trim()) errors.push("Her varyantın bir adı olmalı.");
    else if (price === null) errors.push(`“${row.label}” için geçerli bir fiyat girin.`);
    else if (!Number.isFinite(stock) || stock < 0 || stock > 100000) errors.push(`“${row.label}” için geçerli bir stok girin.`);
    else variants.push({ id: row.id, label: row.label.trim().slice(0, 60), color: row.color.trim() || undefined, priceInKurus: price, stock });
  }
  if (!variants.length) errors.push("En az bir varyant (ad, fiyat, stok) girin.");
  const slug = form.slug || slugify(form.name);
  if (!form.slug && (!slug || existingSlugs.includes(slug))) errors.push("Bu ada sahip bir ürün zaten var veya ad geçersiz.");
  return { errors, variants, slug };
}

export function parseSpecs(text: string): [string, string][] {
  return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const index = line.indexOf(":");
    return (index > 0 ? [line.slice(0, index).trim(), line.slice(index + 1).trim()] : [line, ""]) as [string, string];
  }).slice(0, 20);
}

export function saveProduct(form: ProductForm): { ok: true; slug: string } | { ok: false; errors: string[] } {
  const db = openDatabase();
  try {
    const all = readProductRecords(db);
    const categories = (db.prepare("SELECT slug FROM categories").all() as { slug: string }[]).map((row) => row.slug);
    const brands = (db.prepare("SELECT slug FROM brands").all() as { slug: string }[]).map((row) => row.slug);
    const existing = form.slug ? all.find((record) => record.slug === form.slug) : undefined;
    const { errors, variants, slug } = validateProductForm(form, all.map((r) => r.slug), categories, brands);
    if (errors.length) return { ok: false, errors };

    // Yeni varyantlara kalıcı kimlik ver; mevcut kimlikler korunur (sepet ve siparişler bunlara bağlı).
    const usedIds = new Set<string>();
    const finalVariants = variants.map((variant, index) => {
      let id = variant.id || `${slug}-${slugify(variant.label) || index}`;
      while (usedIds.has(id)) id = `${id}-${randomBytes(2).toString("hex")}`;
      usedIds.add(id);
      return { ...variant, id };
    });

    const record: ProductRecord = {
      slug, number: existing?.number ?? `Nº ${String(all.length + 1).padStart(2, "0")}`,
      name: form.name.trim(), brand: form.brand, material: form.material.trim() || "—",
      materials: form.materialGroups.split(",").map((m) => m.trim()).filter(Boolean),
      image: form.image || null, imageAlt: form.imageAlt.trim() || `${form.name.trim()} ürün görseli`,
      tone: (TONES.includes(form.tone as Tone) ? form.tone : "stone") as Tone,
      categorySlug: form.categorySlug, categorySlugs: existing?.categorySlugs,
      description: form.description.trim(), worlds: form.worlds.filter((w) => designWorlds.some((d) => d.slug === w)),
      rooms: form.rooms, searchTerms: form.searchTerms.trim(),
      icon: (ICONS.includes(form.icon as ProductIconName) ? form.icon : "box") as ProductIconName,
      rank: existing?.rank ?? Math.max(0, ...all.map((r) => r.rank)) + 1,
      createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
      status: form.archived ? "archived" : "active",
      variants: finalVariants, specs: parseSpecs(form.specs), isDemo: form.isDemo, adminEdited: true,
    };

    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("INSERT INTO products (slug, details) VALUES (?, ?) ON CONFLICT(slug) DO UPDATE SET details = excluded.details").run(slug, JSON.stringify(record));
      const setStock = db.prepare("INSERT INTO inventory (variant_id, stock) VALUES (?, ?) ON CONFLICT(variant_id) DO UPDATE SET stock = excluded.stock");
      for (const variant of finalVariants) setStock.run(variant.id, variant.stock);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    return { ok: true, slug };
  } finally {
    db.close();
  }
}

/** Ürünü silmek yerine arşivler/geri açar (geri alınabilir). */
export function setProductArchived(slug: string, archived: boolean) {
  const db = openDatabase();
  try {
    const row = db.prepare("SELECT details FROM products WHERE slug = ?").get(slug) as { details: string } | undefined;
    if (!row) return false;
    const record = JSON.parse(row.details) as ProductRecord;
    db.prepare("UPDATE products SET details = ? WHERE slug = ?").run(JSON.stringify({ ...record, status: archived ? "archived" : "active", adminEdited: true }), slug);
    return true;
  } finally {
    db.close();
  }
}

/** Hızlı fiyat/stok güncellemesi (ürün listesinden). */
export function updateVariantQuick(slug: string, variantId: string, priceText: string, stockText: string) {
  const price = toKurus(priceText);
  const stock = Math.floor(Number(stockText));
  if (price === null || !Number.isFinite(stock) || stock < 0 || stock > 100000) return false;
  const db = openDatabase();
  try {
    const row = db.prepare("SELECT details FROM products WHERE slug = ?").get(slug) as { details: string } | undefined;
    if (!row) return false;
    const record = JSON.parse(row.details) as ProductRecord;
    if (!record.variants.some((variant) => variant.id === variantId)) return false;
    db.exec("BEGIN IMMEDIATE");
    db.prepare("UPDATE products SET details = ? WHERE slug = ?").run(
      JSON.stringify({ ...record, adminEdited: true, variants: record.variants.map((v) => (v.id === variantId ? { ...v, priceInKurus: price } : v)) }), slug,
    );
    db.prepare("INSERT INTO inventory (variant_id, stock) VALUES (?, ?) ON CONFLICT(variant_id) DO UPDATE SET stock = excluded.stock").run(variantId, stock);
    db.exec("COMMIT");
    return true;
  } catch (error) {
    try { db.exec("ROLLBACK"); } catch { /* işlem kapanmış olabilir */ }
    throw error;
  } finally {
    db.close();
  }
}

export function saveCategory(input: { slug?: string; name: string; parent: string; order: number; visible: boolean; icon: string }) {
  const name = input.name.trim();
  if (name.length < 2) return { ok: false as const, error: "Kategori adı en az 2 karakter olmalı." };
  const db = openDatabase();
  try {
    const slug = input.slug || slugify(name);
    if (!slug) return { ok: false as const, error: "Geçersiz kategori adı." };
    const row = db.prepare("SELECT details FROM categories WHERE slug = ?").get(slug) as { details: string } | undefined;
    if (!input.slug && row) return { ok: false as const, error: "Bu adla bir kategori zaten var." };
    if (input.parent && input.parent === slug) return { ok: false as const, error: "Kategori kendi alt kategorisi olamaz." };
    const previous = row ? (JSON.parse(row.details) as CategoryRecord) : undefined;
    const record: CategoryRecord = {
      slug, name: name.slice(0, 60), parent: input.parent || undefined, order: Math.max(0, Math.floor(input.order) || 0), visible: input.visible,
      icon: (ICONS.includes(input.icon as ProductIconName) ? input.icon : "box") as ProductIconName, image: previous?.image, adminEdited: true,
    };
    db.prepare("INSERT INTO categories (slug, details) VALUES (?, ?) ON CONFLICT(slug) DO UPDATE SET details = excluded.details").run(slug, JSON.stringify(record));
    return { ok: true as const, slug };
  } finally {
    db.close();
  }
}

export function saveBrand(input: { name: string; kind: string }) {
  const name = input.name.trim();
  const slug = slugify(name);
  if (name.length < 2 || !slug) return { ok: false as const, error: "Marka adı en az 2 karakter olmalı." };
  const db = openDatabase();
  try {
    if (db.prepare("SELECT 1 FROM brands WHERE slug = ?").get(slug)) return { ok: false as const, error: "Bu marka zaten kayıtlı." };
    const record: BrandRecord = { slug, name: name.slice(0, 60), kind: input.kind === "partner" ? "partner" : "own", adminEdited: true };
    db.prepare("INSERT INTO brands (slug, details) VALUES (?, ?)").run(slug, JSON.stringify(record));
    return { ok: true as const, slug };
  } finally {
    db.close();
  }
}

export function readAdminCatalog() {
  const db = openDatabase();
  try {
    const parse = <T,>(table: string) => (db.prepare(`SELECT details FROM ${table} ORDER BY rowid`).all() as { details: string }[]).map((row) => JSON.parse(row.details) as T);
    return {
      products: readProductRecords(db),
      categories: parse<CategoryRecord>("categories").sort((a, b) => a.order - b.order),
      brands: parse<BrandRecord>("brands"),
      rooms: parse<{ slug: string; name: string; order: number }>("rooms").sort((a, b) => a.order - b.order),
    };
  } finally {
    db.close();
  }
}

/** Görsel yükleme: yalnızca PNG/JPEG/WebP (dosya imzasıyla doğrulanır), en çok 4 MB, rastgele dosya adı. */
export async function saveUpload(file: File): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  if (file.size === 0) return { ok: false, error: "Dosya seçilmedi." };
  if (file.size > 4 * 1024 * 1024) return { ok: false, error: "Görsel en çok 4 MB olabilir." };
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? "png"
    : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? "jpg"
    : bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP" ? "webp" : null;
  if (!ext) return { ok: false, error: "Yalnızca PNG, JPEG veya WebP görseller yüklenebilir." };
  // Yüklemeler veri klasöründe (kalıcı diskte) durur ve /uploads/[ad] yolundan sunulur.
  const directory = join(dataDirectory(), "uploads");
  mkdirSync(directory, { recursive: true });
  const name = `${randomBytes(10).toString("hex")}.${ext}`;
  writeFileSync(join(directory, name), bytes);
  return { ok: true, path: `/uploads/${name}` };
}
