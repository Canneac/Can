import { randomInt } from "node:crypto";
import { openDatabase, readProductRecords } from "@/data/catalog-db";
import { designWorlds } from "@/data/catalog";
import { deriveProduct } from "@/domain/catalog-types";
import { computeQuote, type CartLineInput, type Quote } from "@/domain/cart";

export type Customer = { name: string; email: string; phone: string; address: string; city: string; note: string };

export const ORDER_STATUSES = ["received", "preparing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Sipariş alındı", preparing: "Hazırlanıyor", shipped: "Kargoya verildi", delivered: "Teslim edildi", cancelled: "İptal edildi",
};

const worldSlugs = designWorlds.map((world) => world.slug);

/** Müşteri alanlarını doğrular; hata varsa alan -> mesaj döner. */
export function validateCustomer(input: unknown): { ok: true; value: Customer } | { ok: false; errors: Record<string, string> } {
  const source = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const text = (key: string, max: number) => (typeof source[key] === "string" ? (source[key] as string).trim().slice(0, max) : "");
  const value: Customer = { name: text("name", 80), email: text("email", 120), phone: text("phone", 30), address: text("address", 240), city: text("city", 60), note: text("note", 300) };
  const errors: Record<string, string> = {};
  if (value.name.length < 3) errors.name = "Ad soyad en az 3 karakter olmalı.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.email)) errors.email = "Geçerli bir e-posta adresi girin.";
  if (value.phone.replace(/\D/g, "").length < 10) errors.phone = "Telefon numarası en az 10 haneli olmalı.";
  if (value.address.length < 10) errors.address = "Açık adres en az 10 karakter olmalı.";
  if (value.city.length < 2) errors.city = "Şehir girin.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

export function currentQuote(lines: CartLineInput[]): Quote {
  const db = openDatabase();
  try {
    return computeQuote(lines, readProductRecords(db).filter((r) => r.status !== "archived").map(deriveProduct), worldSlugs);
  } finally {
    db.close();
  }
}

export type CreateOrderResult =
  | { ok: true; orderNumber: string; replayed: boolean }
  | { ok: false; code: "empty" | "changed" | "invalid_key" | "server"; message: string; quote?: Quote };

function newOrderNumber() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `NV-${date}-${randomInt(10000, 100000)}`;
}

/**
 * Demo sipariş oluşturur. Fiyat ve stok sunucuda yeniden doğrulanır, stok düşer, satır fiyatları kayda geçer.
 * Aynı idempotencyKey ile tekrar çağrılırsa yeni sipariş açılmaz, mevcut sipariş numarası döner.
 */
export function createDemoOrder(lines: CartLineInput[], customer: Customer, idempotencyKey: string, userId: number | null = null): CreateOrderResult {
  if (!/^[A-Za-z0-9-]{16,64}$/.test(idempotencyKey)) return { ok: false, code: "invalid_key", message: "Geçersiz işlem anahtarı." };
  const db = openDatabase();
  try {
    db.exec("BEGIN IMMEDIATE");
    try {
      const existing = db.prepare("SELECT order_number FROM orders WHERE idempotency_key = ?").get(idempotencyKey) as { order_number: string } | undefined;
      if (existing) {
        db.exec("COMMIT");
        return { ok: true, orderNumber: existing.order_number, replayed: true };
      }
      const products = readProductRecords(db).filter((r) => r.status !== "archived").map(deriveProduct);
      const quote = computeQuote(lines, products, worldSlugs);
      if (!quote.lines.length) {
        db.exec("ROLLBACK");
        return { ok: false, code: "empty", message: "Sepetinizde satın alınabilir ürün yok.", quote };
      }
      if (quote.removedKeys.length || quote.lines.some((line) => line.note)) {
        db.exec("ROLLBACK");
        return { ok: false, code: "changed", message: "Sepetinizdeki bazı ürünlerin stok veya fiyat bilgisi değişti. Lütfen sepeti kontrol edin.", quote };
      }

      let orderNumber = newOrderNumber();
      while (db.prepare("SELECT 1 FROM orders WHERE order_number = ?").get(orderNumber)) orderNumber = newOrderNumber();
      const created = new Date().toISOString();
      const result = db.prepare(
        `INSERT INTO orders (order_number, idempotency_key, status, is_demo, customer, subtotal_kurus, shipping_kurus, discount_kurus, total_kurus, created_at, user_id)
         VALUES (?, ?, 'received', 1, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(orderNumber, idempotencyKey, JSON.stringify(customer), quote.subtotalInKurus, quote.shippingInKurus, quote.discountInKurus, quote.totalInKurus, created, userId);
      const orderId = Number(result.lastInsertRowid);
      const insertItem = db.prepare(
        `INSERT INTO order_items (order_id, product_slug, variant_id, name, variant_label, unit_price_kurus, quantity, source_world) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      const decrement = db.prepare("UPDATE inventory SET stock = stock - ? WHERE variant_id = ? AND stock >= ?");
      for (const line of quote.lines) {
        const changed = decrement.run(line.quantity, line.variantId, line.quantity).changes;
        if (Number(changed) !== 1) throw new Error("STOCK");
        insertItem.run(orderId, line.productSlug, line.variantId, line.name, line.variantLabel, line.unitPriceInKurus, line.quantity, line.sourceWorld);
      }
      db.exec("COMMIT");
      return { ok: true, orderNumber, replayed: false };
    } catch (error) {
      try { db.exec("ROLLBACK"); } catch { /* işlem zaten kapanmış olabilir */ }
      if (error instanceof Error && error.message === "STOCK") return { ok: false, code: "changed", message: "Stok az önce değişti. Lütfen sepeti yenileyin." };
      throw error;
    }
  } catch {
    return { ok: false, code: "server", message: "Sipariş oluşturulamadı. Lütfen tekrar deneyin." };
  } finally {
    db.close();
  }
}

export type OrderItemRow = { productSlug: string; variantId: string; name: string; variantLabel: string; unitPriceInKurus: number; quantity: number; sourceWorld: string | null };
export type OrderRow = {
  id: number; orderNumber: string; status: OrderStatus; isDemo: boolean; customer: Customer;
  subtotalInKurus: number; shippingInKurus: number; discountInKurus: number; totalInKurus: number; createdAt: string; items: OrderItemRow[];
};

function mapOrder(row: Record<string, unknown>, items: Record<string, unknown>[]): OrderRow {
  return {
    id: Number(row.id), orderNumber: String(row.order_number), status: String(row.status) as OrderStatus, isDemo: Number(row.is_demo) === 1,
    customer: JSON.parse(String(row.customer)) as Customer, subtotalInKurus: Number(row.subtotal_kurus), shippingInKurus: Number(row.shipping_kurus),
    discountInKurus: Number(row.discount_kurus), totalInKurus: Number(row.total_kurus), createdAt: String(row.created_at),
    items: items.map((item) => ({
      productSlug: String(item.product_slug), variantId: String(item.variant_id), name: String(item.name), variantLabel: String(item.variant_label),
      unitPriceInKurus: Number(item.unit_price_kurus), quantity: Number(item.quantity), sourceWorld: item.source_world ? String(item.source_world) : null,
    })),
  };
}

export function getOrder(orderNumber: string): OrderRow | null {
  const db = openDatabase();
  try {
    const row = db.prepare("SELECT * FROM orders WHERE order_number = ?").get(orderNumber) as Record<string, unknown> | undefined;
    if (!row) return null;
    return mapOrder(row, db.prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id").all(Number(row.id)) as Record<string, unknown>[]);
  } finally {
    db.close();
  }
}

export function listOrders(): OrderRow[] {
  const db = openDatabase();
  try {
    return (db.prepare("SELECT * FROM orders ORDER BY id DESC").all() as Record<string, unknown>[]).map((row) =>
      mapOrder(row, db.prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id").all(Number(row.id)) as Record<string, unknown>[]),
    );
  } finally {
    db.close();
  }
}

/** Yalnızca geçerli durum değerleri kabul edilir. */
export function setOrderStatus(orderNumber: string, status: string): boolean {
  if (!ORDER_STATUSES.includes(status as OrderStatus)) return false;
  const db = openDatabase();
  try {
    return Number(db.prepare("UPDATE orders SET status = ? WHERE order_number = ?").run(status, orderNumber).changes) === 1;
  } finally {
    db.close();
  }
}

/** Üyenin kendi siparişleri (yeniden eskiye). */
export function listOrdersForUser(userId: number): OrderRow[] {
  const db = openDatabase();
  try {
    return (db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC").all(userId) as Record<string, unknown>[]).map((row) =>
      mapOrder(row, db.prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id").all(Number(row.id)) as Record<string, unknown>[]),
    );
  } finally {
    db.close();
  }
}
