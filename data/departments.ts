import type { Product } from "../domain/catalog-types.ts";

/**
 * Mağaza menüsü "departman" bazlıdır: aynı yerde kullanılan ürünler tek sayfada toplanır
 * (ör. mutfakta kullanılan her şey — beyaz eşya, küçük aletler, pişirme, sofra — tek "Mutfak" sayfasında).
 * Altta yatan 17 kategori veride durur; departmanlar yalnızca bunları gruplar.
 */
export type Department = { slug: string; name: string; categories: string[]; image?: string };

export const departments: Department[] = [
  { slug: "mutfak", name: "Mutfak", categories: ["mutfak", "sofra-servis", "beyaz-esya", "kucuk-ev-aletleri"], image: "/images/cutlery-gallery.png" },
  { slug: "mobilya", name: "Mobilya", categories: ["mobilya", "ev-ofisi", "antre"], image: "/images/sofa-gallery.png" },
  { slug: "tekstil", name: "Tekstil", categories: ["ev-tekstili", "cocuk-odasi"] },
  { slug: "banyo", name: "Banyo", categories: ["banyo"] },
  { slug: "aydinlatma", name: "Aydınlatma", categories: ["aydinlatma", "akilli-ev"] },
  { slug: "dekorasyon", name: "Dekorasyon", categories: ["dekorasyon"], image: "/images/vase-bordeaux.png" },
  { slug: "temizlik", name: "Temizlik ve düzen", categories: ["temizlik", "depolama"], image: "/images/waste-bin-gallery.png" },
  { slug: "balkon-bahce", name: "Balkon ve bahçe", categories: ["balkon-bahce", "sezonluk"] },
];

/** Hiçbir departmana bağlı olmayan (ör. yönetici panelinden eklenen) kategoriler "Diğer" altında toplanır; ürünler kaybolmaz. */
export function allDepartments(categorySlugs: readonly string[] = []): Department[] {
  const mapped = new Set(departments.flatMap((department) => department.categories));
  const rest = categorySlugs.filter((slug) => !mapped.has(slug));
  return rest.length ? [...departments, { slug: "diger", name: "Diğer", categories: rest }] : departments;
}

export function getDepartment(slug: string | undefined, categorySlugs: readonly string[] = []) {
  return allDepartments(categorySlugs).find((department) => department.slug === slug);
}

type Categorized = Pick<Product, "categorySlug" | "categorySlugs">;

export function inDepartment(product: Categorized, department: Department) {
  return department.categories.includes(product.categorySlug) || Boolean(product.categorySlugs?.some((slug) => department.categories.includes(slug)));
}

/** Boş departmanlar (içinde ürün olmayanlar) menüde gösterilmez. */
export function activeDepartments(products: Categorized[], categorySlugs: readonly string[] = []) {
  return allDepartments(categorySlugs).filter((department) => products.some((product) => inDepartment(product, department)));
}
