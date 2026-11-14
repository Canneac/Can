import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { HeaderActions } from "@/components/header-actions";
import { HeaderControls } from "@/components/header-controls";
import { readSnapshot } from "@/data/catalog-db";
import { activeDepartments, inDepartment } from "@/data/departments";

/** Sade üst bar: solda menü/arama, ortada logo, sağda favori ve sepet. overlay=true → videonun üstünde saydam. */
export function StorefrontHeader({ overlay = false }: { overlay?: boolean }) {
  const { products, categories } = readSnapshot();
  const departments = activeDepartments(products, categories.map((category) => category.slug)).map((department) => ({
    slug: department.slug, name: department.name, count: products.filter((product) => inDepartment(product, department)).length,
  }));
  return (
    <header className={`zh${overlay ? " zh--overlay" : ""}`}>
      <div className="zh__left"><HeaderControls departments={departments} /></div>
      <Link className="zh__logo" href="/" aria-label="NUVESSA ana sayfa">
        <BrandLogo variant={overlay ? "footer" : "header"} decorative priority className="wordmark" />
      </Link>
      <div className="zh__right"><HeaderActions /></div>
    </header>
  );
}
