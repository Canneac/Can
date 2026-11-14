import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/account/actions";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { currentMember } from "@/lib/user-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Üye ol | NUVESSA", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; field?: string; name?: string; email?: string; next?: string }> }) {
  if (await currentMember()) redirect("/account");
  const { error, field, name, email, next } = await searchParams;
  return (
    <main>
      <StorefrontHeader />
      <section className="page-section auth">
        <p className="eyebrow">NUVESSA / ÜYELİK</p>
        <h1 className="page-title">Üye ol</h1>
        <form action={registerAction} className="auth__form">
          <input type="hidden" name="next" value={next ?? ""} />
          <label className="checkout-field"><span>Ad soyad</span><input name="name" autoComplete="name" required minLength={2} defaultValue={name} aria-invalid={field === "name"} /></label>
          <label className="checkout-field"><span>E-posta</span><input name="email" type="email" autoComplete="email" required defaultValue={email} aria-invalid={field === "email"} /></label>
          <label className="checkout-field"><span>Parola (en az 8 karakter)</span><input name="password" type="password" autoComplete="new-password" required minLength={8} aria-invalid={field === "password"} /></label>
          {error && <p className="cart-error" role="alert">{error}</p>}
          <button type="submit" className="zbtn zbtn--dark auth__submit">Üye ol</button>
        </form>
        <p className="auth__alt">Zaten üye misiniz? <Link href={`/account/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Giriş yapın</Link></p>
        <p className="auth__note">Üyelik isteğe bağlıdır; üye olmadan da alışveriş yapabilirsiniz. Bu bir tasarım demosudur: gerçek müşteri verisi girmeyin.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
