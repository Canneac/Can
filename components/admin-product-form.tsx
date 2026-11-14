import { saveProductAction } from "@/app/admin/actions";
import { designWorlds } from "@/data/catalog";
import { COLOR_HEX, type BrandRecord, type CategoryRecord, type ProductRecord } from "@/domain/catalog-types";
import { ICONS, TONES } from "@/lib/admin-data";

type Props = { product?: ProductRecord; categories: CategoryRecord[]; brands: BrandRecord[]; rooms: { slug: string; name: string }[]; error?: string };

export function AdminProductForm({ product, categories, brands, rooms, error }: Props) {
  const variants = [...(product?.variants ?? [])];
  while (variants.length < 6) variants.push({ id: "", label: "", priceInKurus: 0, stock: 0 });
  return (
    <form action={saveProductAction} className="admin-form" encType="multipart/form-data">
      {error && <p className="admin-alert" role="alert">{error}</p>}
      <input type="hidden" name="slug" value={product?.slug ?? ""} />
      <input type="hidden" name="image" value={product?.image ?? ""} />
      <label>Ürün adı<input name="name" defaultValue={product?.name} required minLength={3} /></label>
      <div className="admin-grid">
        <label>Marka<select name="brand" defaultValue={product?.brand}>{brands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}</select></label>
        <label>Ana kategori<select name="categorySlug" defaultValue={product?.categorySlug}>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
      </div>
      <label>Açıklama<textarea name="description" rows={3} defaultValue={product?.description} required /></label>
      <div className="admin-grid">
        <label>Kısa malzeme/özet satırı<input name="material" defaultValue={product?.material} /></label>
        <label>Malzeme grupları (virgülle: Ahşap, Metal)<input name="materialGroups" defaultValue={product?.materials.join(", ")} /></label>
      </div>
      <fieldset><legend>Tasarım dünyaları</legend>{designWorlds.map((world) => <label key={world.slug} className="admin-check"><input type="checkbox" name="worlds" value={world.slug} defaultChecked={product?.worlds.includes(world.slug)} />{world.name}</label>)}</fieldset>
      <fieldset><legend>Odalar</legend>{rooms.map((room) => <label key={room.slug} className="admin-check"><input type="checkbox" name="rooms" value={room.slug} defaultChecked={product?.rooms.includes(room.slug)} />{room.name}</label>)}</fieldset>
      <label>Arama kelimeleri (eş anlamlılar)<input name="searchTerms" defaultValue={product?.searchTerms} /></label>
      <div className="admin-grid">
        <label>Görselsiz ürün ikonu<select name="icon" defaultValue={product?.icon ?? "box"}>{ICONS.map((icon) => <option key={icon}>{icon}</option>)}</select></label>
        <label>Panel tonu<select name="tone" defaultValue={product?.tone ?? "stone"}>{TONES.map((tone) => <option key={tone}>{tone}</option>)}</select></label>
      </div>
      <div className="admin-grid">
        <label>Görsel yükle (PNG/JPEG/WebP, en çok 4 MB){product?.image && <small>Mevcut: {product.image}</small>}<input type="file" name="upload" accept="image/png,image/jpeg,image/webp" /></label>
        <label>Görsel açıklaması (erişilebilirlik)<input name="imageAlt" defaultValue={product?.imageAlt} /></label>
      </div>
      <label>Teknik özellikler (her satıra “Etiket: değer”)<textarea name="specs" rows={5} defaultValue={product?.specs.map(([label, value]) => `${label}: ${value}`).join("\n")} /></label>
      <fieldset className="admin-variants"><legend>Varyantlar (boş satırlar yok sayılır; kimlikler değişmez)</legend>
        <div className="admin-variants__head"><span>Ad</span><span>Renk</span><span>Fiyat (₺)</span><span>Stok</span></div>
        {variants.map((variant, index) => (
          <div key={index} className="admin-variants__row">
            <input type="hidden" name={`variantId${index}`} value={variant.id} />
            <input name={`variantLabel${index}`} defaultValue={variant.label} aria-label={`Varyant ${index + 1} adı`} />
            <select name={`variantColor${index}`} defaultValue={variant.color ?? ""} aria-label={`Varyant ${index + 1} rengi`}><option value="">—</option>{Object.keys(COLOR_HEX).map((color) => <option key={color}>{color}</option>)}</select>
            <input name={`variantPrice${index}`} defaultValue={variant.priceInKurus ? (variant.priceInKurus / 100).toString().replace(".", ",") : ""} inputMode="decimal" aria-label={`Varyant ${index + 1} fiyatı`} />
            <input name={`variantStock${index}`} type="number" min="0" defaultValue={variant.id ? variant.stock : ""} aria-label={`Varyant ${index + 1} stoku`} />
          </div>
        ))}
      </fieldset>
      <label className="admin-check"><input type="checkbox" name="isDemo" defaultChecked={product ? product.isDemo : false} />Demo kaydı (sitede “demo” olarak etiketlenir)</label>
      {product && <label className="admin-check"><input type="checkbox" name="archived" defaultChecked={product.status === "archived"} />Arşivde (sitede görünmez)</label>}
      <button type="submit" className="admin-button">{product ? "Değişiklikleri kaydet" : "Ürünü oluştur"}</button>
    </form>
  );
}
