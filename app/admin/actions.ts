"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endAdminSession, requireAdmin, startAdminSession, verifyPassword } from "@/lib/admin-auth";
import { saveBrand, saveCategory, saveProduct, saveUpload, setProductArchived, updateVariantQuick, type ProductForm } from "@/lib/admin-data";
import { setOrderStatus } from "@/lib/orders";

const failedLogins = new Map<string, number[]>();

export async function loginAction(formData: FormData) {
  const now = Date.now();
  const recent = (failedLogins.get("global") ?? []).filter((time) => now - time < 10 * 60_000);
  if (recent.length >= 8) redirect("/admin/login?error=rate");
  if (!verifyPassword(String(formData.get("password") ?? ""))) {
    failedLogins.set("global", [...recent, now]);
    redirect("/admin/login?error=invalid");
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endAdminSession();
  redirect("/admin/login");
}

const text = (data: FormData, key: string) => String(data.get(key) ?? "");

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const existingSlug = text(formData, "slug");
  const back = existingSlug ? `/admin/products/${existingSlug}` : "/admin/products/new";
  let image = text(formData, "image");
  const upload = formData.get("upload");
  if (upload instanceof File && upload.size > 0) {
    const saved = await saveUpload(upload);
    if (!saved.ok) redirect(`${back}?error=${encodeURIComponent(saved.error)}`);
    image = saved.path;
  }
  const form: ProductForm = {
    slug: existingSlug, name: text(formData, "name"), brand: text(formData, "brand"), categorySlug: text(formData, "categorySlug"),
    description: text(formData, "description"), material: text(formData, "material"), materialGroups: text(formData, "materialGroups"),
    worlds: formData.getAll("worlds").map(String), rooms: formData.getAll("rooms").map(String), searchTerms: text(formData, "searchTerms"),
    icon: text(formData, "icon"), tone: text(formData, "tone"), image, imageAlt: text(formData, "imageAlt"), specs: text(formData, "specs"),
    isDemo: formData.get("isDemo") === "on", archived: formData.get("archived") === "on",
    variants: [0, 1, 2, 3, 4, 5].map((i) => ({
      id: text(formData, `variantId${i}`), label: text(formData, `variantLabel${i}`), color: text(formData, `variantColor${i}`),
      price: text(formData, `variantPrice${i}`), stock: text(formData, `variantStock${i}`) || "0",
    })),
  };
  const result = saveProduct(form);
  if (!result.ok) redirect(`${back}?error=${encodeURIComponent(result.errors.join(" "))}`);
  revalidatePath("/", "layout");
  redirect(`/admin/products?saved=${result.slug}`);
}

export async function quickVariantAction(formData: FormData) {
  await requireAdmin();
  const slug = text(formData, "slug");
  const ok = updateVariantQuick(slug, text(formData, "variantId"), text(formData, "price"), text(formData, "stock"));
  revalidatePath("/", "layout");
  redirect(`/admin/products?${ok ? "saved" : "error"}=${encodeURIComponent(slug)}`);
}

export async function archiveProductAction(formData: FormData) {
  await requireAdmin();
  setProductArchived(text(formData, "slug"), text(formData, "archived") === "1");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const result = saveCategory({
    slug: text(formData, "slug") || undefined, name: text(formData, "name"), parent: text(formData, "parent"),
    order: Number(text(formData, "order")), visible: formData.get("visible") === "on", icon: text(formData, "icon"),
  });
  revalidatePath("/", "layout");
  redirect(`/admin/categories${result.ok ? `?saved=${result.slug}` : `?error=${encodeURIComponent(result.error)}`}`);
}

export async function saveBrandAction(formData: FormData) {
  await requireAdmin();
  const result = saveBrand({ name: text(formData, "name"), kind: text(formData, "kind") });
  revalidatePath("/", "layout");
  redirect(`/admin/brands${result.ok ? `?saved=${result.slug}` : `?error=${encodeURIComponent(result.error)}`}`);
}

export async function orderStatusAction(formData: FormData) {
  await requireAdmin();
  setOrderStatus(text(formData, "orderNumber"), text(formData, "status"));
  redirect("/admin/orders");
}
