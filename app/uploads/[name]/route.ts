import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDirectory } from "@/data/catalog-db";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

/** Yönetici panelinden yüklenen görselleri veri klasöründen sunar. Yalnızca rastgele üretilmiş güvenli adlar kabul edilir. */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const match = /^[a-f0-9]{20}\.(png|jpg|webp)$/.exec(name);
  if (!match) return new Response("Bulunamadı", { status: 404 });
  try {
    const bytes = await readFile(join(dataDirectory(), "uploads", name));
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": TYPES[match[1]], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}
