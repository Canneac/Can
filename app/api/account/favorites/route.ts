import { currentMember, readFavorites, writeFavorites } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

/** Üyenin favorileri. Giriş yoksa 401. */
export async function GET() {
  const member = await currentMember();
  if (!member) return Response.json({ error: "Giriş gerekli." }, { status: 401 });
  return Response.json({ slugs: readFavorites(member.id) });
}

export async function PUT(request: Request) {
  const member = await currentMember();
  if (!member) return Response.json({ error: "Giriş gerekli." }, { status: 401 });
  let body: { slugs?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (!Array.isArray(body.slugs) || body.slugs.length > 500) return Response.json({ error: "Geçersiz liste." }, { status: 400 });
  return Response.json({ slugs: writeFavorites(member.id, body.slugs as string[]) });
}
