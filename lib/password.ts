import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Parola özeti: scrypt + rastgele tuz. Biçim: scrypt$<tuz>$<özet> (base64url). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltText, hashText] = stored.split("$");
  if (scheme !== "scrypt" || !saltText || !hashText) return false;
  const expected = Buffer.from(hashText, "base64url");
  const actual = scryptSync(password, Buffer.from(saltText, "base64url"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export type RegistrationInput = { name: string; email: string; password: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Kayıt alanlarını doğrular; hata varsa alan -> Türkçe mesaj döner. */
export function validateRegistration(input: Partial<RegistrationInput>): { ok: true; value: RegistrationInput } | { ok: false; errors: Record<string, string> } {
  const name = String(input.name ?? "").trim().slice(0, 80);
  const email = String(input.email ?? "").trim().toLowerCase().slice(0, 120);
  const password = String(input.password ?? "");
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Ad soyad en az 2 karakter olmalı.";
  if (!EMAIL.test(email)) errors.email = "Geçerli bir e-posta adresi girin.";
  if (password.length < 8) errors.password = "Parola en az 8 karakter olmalı.";
  else if (password.length > 128) errors.password = "Parola en fazla 128 karakter olabilir.";
  else if (password.toLowerCase() === email || /^(.)\1+$/.test(password)) errors.password = "Daha tahmin edilmesi zor bir parola seçin.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { name, email, password } };
}
