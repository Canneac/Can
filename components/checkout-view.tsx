"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CartLineCard, CartSummary } from "@/components/cart-view";
import { clearCart, useCart } from "@/lib/cart-store";
import { useQuote } from "@/lib/use-quote";

const fields = [
  { name: "name", label: "Ad soyad", autoComplete: "name", type: "text" },
  { name: "email", label: "E-posta", autoComplete: "email", type: "email" },
  { name: "phone", label: "Telefon", autoComplete: "tel", type: "tel" },
  { name: "city", label: "Şehir", autoComplete: "address-level1", type: "text" },
  { name: "address", label: "Açık adres", autoComplete: "street-address", type: "text" },
] as const;

export function CheckoutView() {
  const router = useRouter();
  const lines = useCart();
  const { quote, loading, error } = useQuote();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const keyRef = useRef<string>("");

  // Aynı sipariş denemesi için sabit işlem anahtarı: çift tıklama çift sipariş oluşturmaz.
  useEffect(() => {
    try {
      let key = window.sessionStorage.getItem("nuvessa.checkout.key");
      if (!key) {
        key = crypto.randomUUID();
        window.sessionStorage.setItem("nuvessa.checkout.key", key);
      }
      keyRef.current = key;
    } catch {
      keyRef.current = crypto.randomUUID();
    }
  }, []);

  if (lines.length === 0) {
    return <div className="cart-empty"><h2>Sepetiniz boş</h2><p>Ödemeye geçmek için önce sepetinize ürün ekleyin.</p><Link className="button button--dark" href="/shop">Alışverişe başla</Link></div>;
  }
  if (error) return <p className="cart-error" role="alert">Sipariş bilgileri alınamadı. Lütfen sayfayı yenileyin.</p>;
  if (loading || !quote) return <p className="cart-loading" role="status">Sipariş özeti hazırlanıyor…</p>;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);
    setErrors({});
    const data = new FormData(event.currentTarget);
    const customer = Object.fromEntries(["name", "email", "phone", "address", "city", "note"].map((key) => [key, String(data.get(key) ?? "")]));
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lines, customer, idempotencyKey: keyRef.current }) });
      const body = (await response.json()) as { orderNumber?: string; error?: string; fields?: Record<string, string> };
      if (response.ok && body.orderNumber) {
        clearCart();
        try { window.sessionStorage.removeItem("nuvessa.checkout.key"); } catch { /* yoksay */ }
        router.push(`/orders/${body.orderNumber}`);
        return;
      }
      if (body.fields) setErrors(body.fields);
      setMessage(body.error ?? "Sipariş oluşturulamadı.");
    } catch {
      setMessage("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
    setSubmitting(false);
  }

  return (
    <div className="cart-layout">
      <form className="checkout-form" onSubmit={submit} noValidate>
        <p className="demo-banner" role="note"><b>DEMO ÖDEME.</b> Bu bir tasarım demosudur; kart bilgisi istenmez, gerçek para çekilmez, gerçek sipariş oluşmaz.</p>
        <h2>Teslimat bilgileri</h2>
        {fields.map((field) => (
          <label key={field.name} className="checkout-field">
            <span>{field.label}</span>
            <input name={field.name} type={field.type} autoComplete={field.autoComplete} required aria-invalid={Boolean(errors[field.name])} aria-describedby={errors[field.name] ? `err-${field.name}` : undefined} />
            {errors[field.name] && <small id={`err-${field.name}`} role="alert">{errors[field.name]}</small>}
          </label>
        ))}
        <label className="checkout-field"><span>Sipariş notu (isteğe bağlı)</span><input name="note" type="text" maxLength={300} /></label>
        <h2>Ödeme</h2>
        <p className="checkout-payment">Demo ödeme yöntemi: <b>Gerçek para çekilmez</b>. Aşağıdaki düğme yalnızca demo siparişi oluşturur ve yönetici paneline düşürür.</p>
        {message && <p className="cart-error" role="alert">{message}</p>}
        <button type="submit" className="button button--dark button--block" disabled={submitting}>{submitting ? "Sipariş oluşturuluyor…" : "Demo siparişi onayla"}</button>
      </form>
      <aside className="cart-summary" aria-label="Sipariş özeti">
        <h2>Sipariş özeti</h2>
        <ul className="cart-lines cart-lines--compact">{quote.lines.map((line) => <CartLineCard key={line.key} line={line} editable={false} />)}</ul>
        <CartSummary subtotal={quote.subtotalInKurus} shipping={quote.shippingInKurus} discount={quote.discountInKurus} total={quote.totalInKurus} />
        <Link className="cart-continue" href="/cart">← Sepete dön</Link>
      </aside>
    </div>
  );
}
