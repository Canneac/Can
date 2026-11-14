import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { openDatabase } from "@/data/catalog-db";
import { hashPassword, validateRegistration, verifyPassword } from "@/lib/password";

const COOKIE = "nv_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

export type Member = { id: number; email: string; name: string; phone: string; address: string; city: string; createdAt: string };

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
// Parola hiç eşleşmese bile aynı süreyi harcamak için (hesap var mı yok mu zamanlamadan anlaşılmasın).
const DUMMY_HASH = hashPassword("zaman-esitleme-parolasi");

function mapMember(row: Record<string, unknown>): Member {
  return { id: Number(row.id), email: String(row.email), name: String(row.name), phone: String(row.phone), address: String(row.address), city: String(row.city), createdAt: String(row.created_at) };
}

async function startSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const db = openDatabase();
  try {
    db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Math.floor(Date.now() / 1000));
    db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(sha256(token), userId, Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  } finally {
    db.close();
  }
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS });
}

/** Geçerli oturumdaki üyeyi döner; yoksa null. */
export async function currentMember(): Promise<Member | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length < 20) return null;
  const db = openDatabase();
  try {
    const row = db.prepare(
      "SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?",
    ).get(sha256(token), Math.floor(Date.now() / 1000)) as Record<string, unknown> | undefined;
    return row ? mapMember(row) : null;
  } finally {
    db.close();
  }
}

export async function endMemberSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const db = openDatabase();
    try {
      db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
    } finally {
      db.close();
    }
  }
  jar.delete(COOKIE);
}

export type AuthResult = { ok: true } | { ok: false; errors: Record<string, string> };

export async function registerMember(input: { name: string; email: string; password: string }): Promise<AuthResult> {
  const parsed = validateRegistration(input);
  if (!parsed.ok) return parsed;
  const { name, email, password } = parsed.value;
  const db = openDatabase();
  let userId: number;
  try {
    if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) return { ok: false, errors: { email: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin." } };
    const result = db.prepare("INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)").run(email, name, hashPassword(password), new Date().toISOString());
    userId = Number(result.lastInsertRowid);
  } finally {
    db.close();
  }
  await startSession(userId);
  return { ok: true };
}

const attempts = new Map<string, number[]>();

export async function loginMember(emailInput: string, password: string): Promise<AuthResult> {
  const email = emailInput.trim().toLowerCase().slice(0, 120);
  const now = Date.now();
  const recent = (attempts.get(email) ?? []).filter((time) => now - time < 10 * 60_000);
  if (recent.length >= 6) return { ok: false, errors: { form: "Çok fazla hatalı deneme. 10 dakika sonra tekrar deneyin." } };

  const db = openDatabase();
  let row: Record<string, unknown> | undefined;
  try {
    row = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email) as Record<string, unknown> | undefined;
  } finally {
    db.close();
  }
  const valid = verifyPassword(password.slice(0, 128), row ? String(row.password_hash) : DUMMY_HASH);
  if (!row || !valid) {
    attempts.set(email, [...recent, now]);
    return { ok: false, errors: { form: "E-posta veya parola hatalı." } };
  }
  attempts.delete(email);
  await startSession(Number(row.id));
  return { ok: true };
}

export function updateMemberProfile(userId: number, input: { name: string; phone: string; address: string; city: string }): AuthResult {
  const name = input.name.trim().slice(0, 80);
  if (name.length < 2) return { ok: false, errors: { name: "Ad soyad en az 2 karakter olmalı." } };
  const db = openDatabase();
  try {
    db.prepare("UPDATE users SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?").run(name, input.phone.trim().slice(0, 30), input.address.trim().slice(0, 240), input.city.trim().slice(0, 60), userId);
  } finally {
    db.close();
  }
  return { ok: true };
}

export function readFavorites(userId: number): string[] {
  const db = openDatabase();
  try {
    return (db.prepare("SELECT product_slug FROM favorites WHERE user_id = ? ORDER BY rowid").all(userId) as { product_slug: string }[]).map((row) => row.product_slug);
  } finally {
    db.close();
  }
}

/** Üyenin favori listesini verilen listeyle değiştirir (en çok 200 ürün). */
export function writeFavorites(userId: number, slugs: string[]) {
  const clean = [...new Set(slugs.filter((slug) => typeof slug === "string" && /^[a-z0-9-]{1,80}$/.test(slug)))].slice(0, 200);
  const db = openDatabase();
  try {
    db.exec("BEGIN IMMEDIATE");
    db.prepare("DELETE FROM favorites WHERE user_id = ?").run(userId);
    const insert = db.prepare("INSERT INTO favorites (user_id, product_slug) VALUES (?, ?)");
    for (const slug of clean) insert.run(userId, slug);
    db.exec("COMMIT");
  } catch (error) {
    try { db.exec("ROLLBACK"); } catch { /* işlem kapanmış olabilir */ }
    throw error;
  } finally {
    db.close();
  }
  return clean;
}
