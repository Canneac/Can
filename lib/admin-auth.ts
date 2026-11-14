import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "nv_admin";
const SESSION_SECONDS = 60 * 60 * 8;

/** Yönetici parolası ve imza anahtarı yalnızca ortam değişkenlerinden (.env.local) okunur; koda yazılmaz. */
function config() {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  return password.length >= 12 && secret.length >= 24 ? { password, secret } : null;
}

export function adminConfigured() {
  return config() !== null;
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyPassword(candidate: string) {
  const current = config();
  if (!current) return false;
  // Uzunluk bilgisi sızmasın diye iki tarafı da HMAC'leyip karşılaştırırız.
  return safeEqual(sign(candidate, current.secret), sign(current.password, current.secret));
}

export async function startAdminSession() {
  const current = config();
  if (!current) throw new Error("Yönetici girişi yapılandırılmamış.");
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `admin.${expires}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload, current.secret)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const current = config();
  if (!current) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [role, expires, signature] = value.split(".");
  if (role !== "admin" || !expires || !signature) return false;
  if (!safeEqual(sign(`${role}.${expires}`, current.secret), signature)) return false;
  return Number(expires) > Date.now() / 1000;
}

/** Her yönetici sayfası ve her sunucu eylemi bunu çağırır; yetkisiz isteği giriş sayfasına yollar. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
