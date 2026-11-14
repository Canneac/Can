import Link from "next/link";
import { archiveProductAction, quickVariantAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { readAdminCatalog } from "@/lib/admin-data";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { saved, error } = await searchParams;
  const { products, categories } = readAdminCatalog();
  const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug;
  return (
    <>
      <div className="admin-head"><h1>Ürünler</h1><Link className="admin-button" href="/admin/products/new">+ Yeni ürün</Link></div>
      {saved && <p className="admin-ok" role="status">Kaydedildi: {saved}</p>}
      {error && <p className="admin-alert" role="alert">Güncelleme yapılamadı: {error}</p>}
      <p className="admin-note">Fiyat (₺) ve stok burada hızlıca değiştirilir. Ürünler silinmez, <b>arşivlenir</b> (geri açılabilir).</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Ürün</th><th>Kategori</th><th>Varyant</th><th>Fiyat (₺)</th><th>Stok</th><th /></tr></thead>
          <tbody>
            {products.flatMap((product) => product.variants.map((variant, index) => (
              <tr key={variant.id} className={product.status === "archived" ? "is-archived" : undefined}>
                {index === 0 && (
                  <>
                    <td rowSpan={product.variants.length}>
                      <Link href={`/admin/products/${product.slug}`}><b>{product.name}</b></Link>
                      {product.status === "archived" && <span className="admin-badge">ARŞİV</span>}
                      {product.isDemo && <span className="admin-badge">DEMO</span>}
                    </td>
                    <td rowSpan={product.variants.length}>{categoryName(product.categorySlug)}</td>
                  </>
                )}
                <td>{variant.label}</td>
                <td colSpan={2}>
                  <form action={quickVariantAction} className="admin-inline">
                    <input type="hidden" name="slug" value={product.slug} /><input type="hidden" name="variantId" value={variant.id} />
                    <input name="price" aria-label={`${product.name} ${variant.label} fiyat`} defaultValue={(variant.priceInKurus / 100).toString().replace(".", ",")} inputMode="decimal" />
                    <input name="stock" aria-label={`${product.name} ${variant.label} stok`} type="number" min="0" defaultValue={variant.stock} />
                    <button type="submit">Kaydet</button>
                  </form>
                </td>
                {index === 0 && (
                  <td rowSpan={product.variants.length}>
                    <form action={archiveProductAction}>
                      <input type="hidden" name="slug" value={product.slug} /><input type="hidden" name="archived" value={product.status === "archived" ? "0" : "1"} />
                      <button type="submit" className="admin-link">{product.status === "archived" ? "Geri aç" : "Arşivle"}</button>
                    </form>
                  </td>
                )}
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </>
  );
}
