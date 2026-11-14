// Yönetici girişi için .env.local dosyasını (Git dışı) oluşturur. Parola ekrana yazdırılmaz.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const file = join(process.cwd(), ".env.local");
const current = existsSync(file) ? readFileSync(file, "utf8") : "";
if (/^ADMIN_PASSWORD=.{12,}/m.test(current) && /^ADMIN_SESSION_SECRET=.{24,}/m.test(current)) {
  console.log(".env.local içinde yönetici ayarları zaten var; değiştirilmedi.");
} else {
  const lines = [];
  if (!/^ADMIN_PASSWORD=/m.test(current)) lines.push(`ADMIN_PASSWORD=${randomBytes(12).toString("base64url")}`);
  if (!/^ADMIN_SESSION_SECRET=/m.test(current)) lines.push(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("hex")}`);
  const prefix = current && !current.endsWith("\n") ? "\n" : "";
  if (current) appendFileSync(file, `${prefix}${lines.join("\n")}\n`);
  else writeFileSync(file, `${lines.join("\n")}\n`);
  console.log("Yönetici ayarları .env.local dosyasına yazıldı. Parolayı o dosyadan okuyabilirsiniz (dosya Git'e eklenmez).");
}
