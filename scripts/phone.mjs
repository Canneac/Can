// Telefondan deneme: siteyi üretim kipinde, ağdaki diğer cihazlara açık biçimde başlatır.
// Kullanım: npm run phone   → ekranda yazan adresi (http://192.168.x.x:3100) telefonun tarayıcısına yazın.
// Telefon ve bilgisayar AYNI Wi-Fi/ağda olmalı. Windows ilk seferde güvenlik duvarı sorusu sorar: "Özel ağlar" için izin verin.
import { spawn, spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();
const port = process.env.PHONE_PORT ?? "3100";
const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const env = { ...process.env, NEXT_DIST_DIR: ".next-phone", NEXT_TELEMETRY_DISABLED: "1" };

const addresses = Object.values(networkInterfaces()).flat()
  .filter((entry) => entry && entry.family === "IPv4" && !entry.internal && /^(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))/.test(entry.address))
  .map((entry) => entry.address);

const nextEnvPath = join(root, "next-env.d.ts");
const nextEnvOriginal = await readFile(nextEnvPath, "utf8");
console.log("Üretim derlemesi hazırlanıyor (1-2 dakika)…");
const build = spawnSync(process.execPath, [nextBin, "build"], { cwd: root, env, stdio: "inherit" });
await writeFile(nextEnvPath, nextEnvOriginal);
if (build.status !== 0) process.exit(build.status ?? 1);

console.log("\n=======================================================");
console.log("Telefonunuzun tarayıcısında şu adreslerden birini açın:");
for (const address of addresses.length ? addresses : ["(ağ adresi bulunamadı — bilgisayarın ağa bağlı olduğundan emin olun)"]) console.log(`   http://${address}:${port}`);
console.log("Durdurmak için bu pencerede Ctrl+C.");
console.log("=======================================================\n");
const server = spawn(process.execPath, [nextBin, "start", "-H", "0.0.0.0", "-p", port], { cwd: root, env, stdio: "inherit" });
process.on("SIGINT", () => { server.kill(); process.exit(0); });
server.on("exit", (code) => process.exit(code ?? 0));
