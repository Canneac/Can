import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldPageLayout } from "@/components/world-pages";
import { readSnapshot } from "@/data/catalog-db";
import { getWorld } from "@/data/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/worlds/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const world = getWorld(slug);
  return world ? { title: `${world.name} | NUVESSA`, description: `${world.quality}. NUVESSA ${world.name} tasarım dünyası.` } : { title: "NUVESSA" };
}

export default async function WorldPage({ params }: PageProps<"/worlds/[slug]">) {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) notFound();
  const { products } = readSnapshot();
  return <WorldPageLayout slug={slug} name={world.name} products={products.filter((product) => product.worlds.includes(slug))} />;
}
