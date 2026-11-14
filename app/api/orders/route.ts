import { createDemoOrder, validateCustomer } from "@/lib/orders";
import type { CartLineInput } from "@/domain/cart";

export const dynamic = "force-dynamic";

// Basit bellek içi hız sınırı: aynı istemciden dakikada en fazla 8 sipariş denemesi.
const attempts = new Map<string, number[]>();

export async function POST(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(client) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 8) return Response.json({ error: "Çok fazla deneme. Lütfen bir dakika sonra tekrar deneyin." }, { status: 429 });
  attempts.set(client, [...recent, now]);

  let body: { lines?: unknown; customer?: unknown; idempotencyKey?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (!Array.isArray(body.lines) || body.lines.length === 0 || body.lines.length > 60) return Response.json({ error: "Sepet boş." }, { status: 400 });
  const customer = validateCustomer(body.customer);
  if (!customer.ok) return Response.json({ error: "Lütfen formdaki alanları kontrol edin.", fields: customer.errors }, { status: 422 });
  const result = createDemoOrder(body.lines as CartLineInput[], customer.value, String(body.idempotencyKey ?? ""));
  if (result.ok) return Response.json({ orderNumber: result.orderNumber, replayed: result.replayed, demo: true }, { status: result.replayed ? 200 : 201 });
  const status = result.code === "changed" ? 409 : result.code === "server" ? 500 : 400;
  return Response.json({ error: result.message, code: result.code, quote: result.quote }, { status });
}
