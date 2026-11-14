import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, validateRegistration } from "../lib/password.ts";

test("parola özeti doğru parolayı kabul eder, yanlışı reddeder", () => {
  const hash = hashPassword("guclu-parola-123");
  assert.ok(hash.startsWith("scrypt$"));
  assert.equal(verifyPassword("guclu-parola-123", hash), true);
  assert.equal(verifyPassword("yanlis-parola-123", hash), false);
  assert.equal(verifyPassword("guclu-parola-123", "bozuk"), false);
});

test("aynı parola her seferinde farklı özet üretir (tuz) ve özet parolayı içermez", () => {
  const a = hashPassword("ayni-parola-1");
  const b = hashPassword("ayni-parola-1");
  assert.notEqual(a, b);
  assert.ok(!a.includes("ayni-parola-1"));
});

test("kayıt doğrulaması: kısa parola, geçersiz e-posta ve zayıf parola reddedilir", () => {
  assert.equal(validateRegistration({ name: "Ada Lovelace", email: "ada@example.com", password: "12345678a" }).ok, true);
  const bad = validateRegistration({ name: "A", email: "yanlis", password: "123" });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.name && bad.errors.email && bad.errors.password);
  assert.equal(validateRegistration({ name: "Ada", email: "ada@example.com", password: "aaaaaaaaaa" }).ok, false);
  assert.equal(validateRegistration({ name: "Ada", email: "ada@example.com", password: "ada@example.com" }).ok, false);
  const normalized = validateRegistration({ name: "  Ada  ", email: " ADA@Example.COM ", password: "uzun-bir-parola" });
  assert.equal(normalized.ok && normalized.value.email, "ada@example.com");
});
