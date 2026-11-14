import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin-product-form";
import { requireAdmin } from "@/lib/admin-auth";
import { readAdminCatalog } from "@/lib/admin-data";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const { error } = await searchParams;
  const { products, categories, brands, rooms } = readAdminCatalog();
  const product = products.find((entry) => entry.slug === slug);
  if (!product) notFound();
  return (
    <>
      <h1>{product.name}</h1>
      <AdminProductForm product={product} categories={categories} brands={brands} rooms={rooms} error={error} />
    </>
  );
}
