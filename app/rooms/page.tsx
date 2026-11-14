import Image from "next/image";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront-header";

export default function RoomsPage() {
  return <main><StorefrontHeader /><section className="section-shell room-directory">
    <h1>Odaya göre keşfet</h1>
    <div className="room-directory__grid">
      <Link href="/shop?category=mobilya"><Image src="/images/sofa-gallery.png" width={900} height={600} alt="Fildişi kanepeli salon" /><h2>Salon</h2></Link>
      <Link href="/shop?category=mutfak"><Image src="/images/cutlery-gallery.png" width={900} height={600} alt="Keten örtü üzerinde sofra gereçleri" /><h2>Mutfak ve yemek odası</h2></Link>
    </div>
  </section></main>;
}
