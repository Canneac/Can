import { saveCategoryAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { ICONS, readAdminCatalog } from "@/lib/admin-data";

export default async function AdminCategories({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { saved, error } = await searchParams;
  const { categories, products } = readAdminCatalog();
  const count = (slug: string) => products.filter((product) => product.status === "active" && (product.categorySlug === slug || product.categorySlugs?.includes(slug))).length;
  return (
    <>
      <h1>Kategoriler</h1>
      {saved && <p className="admin-ok" role="status">Kaydedildi: {saved}</p>}
      {error && <p className="admin-alert" role="alert">{error}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Kategori</th><th>Üst kategori</th><th>Sıra</th><th>Görünür</th><th>Ürün</th><th /></tr></thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.slug}>
                <td colSpan={5}>
                  <form action={saveCategoryAction} className="admin-inline admin-inline--wide">
                    <input type="hidden" name="slug" value={category.slug} /><input type="hidden" name="icon" value={category.icon} />
                    <input name="name" defaultValue={category.name} aria-label="Kategori adı" />
                    <select name="parent" defaultValue={category.parent ?? ""} aria-label="Üst kategori"><option value="">— ana kategori</option>{categories.filter((c) => c.slug !== category.slug).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
                    <input name="order" type="number" min="0" defaultValue={category.order} aria-label="Sıra" />
                    <label className="admin-check"><input type="checkbox" name="visible" defaultChecked={category.visible} />Görünür</label>
                    <span>{count(category.slug)} ürün</span>
                    <button type="submit">Kaydet</button>
                  </form>
                </td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Yeni kategori</h2>
      <form action={saveCategoryAction} className="admin-inline admin-inline--wide admin-card">
        <input name="name" placeholder="Kategori adı" required minLength={2} aria-label="Yeni kategori adı" />
        <select name="parent" aria-label="Üst kategori"><option value="">— ana kategori</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <input name="order" type="number" min="0" defaultValue={categories.length + 1} aria-label="Sıra" />
        <select name="icon" aria-label="İkon">{ICONS.map((icon) => <option key={icon}>{icon}</option>)}</select>
        <label className="admin-check"><input type="checkbox" name="visible" defaultChecked />Görünür</label>
        <button type="submit" className="admin-button">Kategori ekle</button>
      </form>
    </>
  );
}
