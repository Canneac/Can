import { currentQuote } from "@/lib/orders";
import type { CartLineInput } from "@/domain/cart";

export const dynamic = "force-dynamic";

/** Sepet satırlarını (yalnızca kimlik + adet + kaynak dünya) alır; fiyatları ve toplamı sunucuda hesaplar. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const lines = (body as { lines?: unknown })?.lines;
  if (!Array.isArray(lines) || lines.length > 60) return Response.json({ error: "Geçersiz sepet." }, { status: 400 });
  return Response.json(currentQuote(lines as CartLineInput[]));
}
