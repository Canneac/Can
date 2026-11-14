import { openDatabase } from "@/data/catalog-db";

export const dynamic = "force-dynamic";

/** Barındırma sağlayıcısının sağlık kontrolü: veritabanı açılabiliyor mu? */
export async function GET() {
  try {
    const db = openDatabase();
    try {
      const row = db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
      return Response.json({ ok: true, products: row.n });
    } finally {
      db.close();
    }
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
