import { AdminProductForm } from "@/components/admin-product-form";
import { requireAdmin } from "@/lib/admin-auth";
import { readAdminCatalog } from "@/lib/admin-data";

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  const { categories, brands, rooms } = readAdminCatalog();
  return (
    <>
      <h1>Yeni ürün</h1>
      <AdminProductForm categories={categories} brands={brands} rooms={rooms} error={error} />
    </>
  );
}
