import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/account/actions";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { currentMember } from "@/lib/user-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Giriş yap | NUVESSA", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string; next?: string }> }) {
  if (await currentMember()) redirect("/account");
  const { error, email, next } = await searchParams;
  return (
    <main>
      <StorefrontHeader />
      <section className="page-section auth">
        <p className="eyebrow">NUVESSA / ÜYELİK</p>
        <h1 className="page-title">Giriş yap</h1>
        <form action={loginAction} className="auth__form">
          <input type="hidden" name="next" value={next ?? ""} />
          <label className="checkout-field"><span>E-posta</span><input name="email" type="email" autoComplete="email" required defaultValue={email} /></label>
          <label className="checkout-field"><span>Parola</span><input name="password" type="password" autoComplete="current-password" required /></label>
          {error && <p className="cart-error" role="alert">{error}</p>}
          <button type="submit" className="zbtn zbtn--dark auth__submit">Giriş yap</button>
        </form>
        <p className="auth__alt">Hesabınız yok mu? <Link href={`/account/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Üye olun</Link></p>
        <p className="auth__note">Bu bir tasarım demosudur; üyelik bilgileri yalnızca bu demo sunucusunda saklanır. Parola sıfırlama (e-posta ile) henüz yoktur.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
