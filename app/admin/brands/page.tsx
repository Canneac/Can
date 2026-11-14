import { saveBrandAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { readAdminCatalog } from "@/lib/admin-data";

export default async function AdminBrands({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { saved, error } = await searchParams;
  const { brands, products } = readAdminCatalog();
  return (
    <>
      <h1>Markalar</h1>
      <p className="admin-note"><b>Kendi hattı</b>: NUVESSA&apos;nın kendi markalı ürünleri. <b>İş ortağı</b>: yalnızca gerçek bir anlaşma yapıldıktan sonra kullanın; anlaşma olmadan yetkili satıcı iddiası yapılmaz.</p>
      {saved && <p className="admin-ok" role="status">Kaydedildi: {saved}</p>}
      {error && <p className="admin-alert" role="alert">{error}</p>}
      <ul className="admin-list">
        {brands.map((brand) => <li key={brand.slug}>{brand.name} <span className="admin-badge">{brand.kind === "own" ? "KENDİ HATTI" : "İŞ ORTAĞI"}</span> — {products.filter((product) => product.brand === brand.slug).length} ürün</li>)}
      </ul>
      <h2>Yeni marka</h2>
      <form action={saveBrandAction} className="admin-inline admin-inline--wide admin-card">
        <input name="name" placeholder="Marka adı" required minLength={2} aria-label="Marka adı" />
        <select name="kind" aria-label="Marka türü"><option value="own">Kendi hattı</option><option value="partner">İş ortağı (gerçek anlaşma gerekir)</option></select>
        <button type="submit" className="admin-button">Marka ekle</button>
      </form>
    </>
  );
}
