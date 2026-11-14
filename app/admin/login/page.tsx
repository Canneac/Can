import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <section className="admin-card admin-card--narrow">
      <h1>Yönetici girişi</h1>
      {!adminConfigured() ? (
        <p className="admin-alert">Yönetici girişi henüz yapılandırılmamış. Proje klasöründe <code>npm run setup:admin</code> komutunu çalıştırın; parola <code>.env.local</code> dosyasında oluşur.</p>
      ) : (
        <form action={loginAction}>
          <label>Parola<input type="password" name="password" autoComplete="current-password" required autoFocus /></label>
          {error && <p className="admin-alert" role="alert">{error === "rate" ? "Çok fazla hatalı deneme. 10 dakika sonra tekrar deneyin." : "Parola hatalı."}</p>}
          <button type="submit" className="admin-button">Giriş yap</button>
        </form>
      )}
    </section>
  );
}
