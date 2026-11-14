import type { ProductIconName } from "@/data/catalog";

const paths: Record<ProductIconName, string> = {
  sofa: "M12 34v-8a6 6 0 0 1 6-6h28a6 6 0 0 1 6 6v8M6 38a4 4 0 0 1 8 0v4h36v-4a4 4 0 0 1 8 0v10H6zM14 52v4M50 52v4",
  table: "M8 22h48v5H8zM14 27v26M50 27v26M22 27v10M42 27v10",
  fridge: "M20 8h24a3 3 0 0 1 3 3v42a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3zM17 27h30M23 15v7M23 33v12",
  oven: "M10 12h44a3 3 0 0 1 3 3v34a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3zM7 22h50M15 29h34v16H15zM17 17h2M25 17h2M33 17h2",
  dishwasher: "M12 8h40a3 3 0 0 1 3 3v42a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3zM9 20h46M18 14h6M32 31a10 10 0 1 0 .01 0M32 36a4 4 0 1 0 .01 0",
  pot: "M14 28h36v14a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10zM9 32h5M50 32h5M20 28c0-6 24-6 24 0M32 20v-3",
  bed: "M8 18v34M8 40h48v12M56 52V34a6 6 0 0 0-6-6H26v12M15 33a4 4 0 1 0 .01 0",
  rug: "M8 18h48a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V20a2 2 0 0 1 2-2zM14 24h36v16H14zM6 50h4M14 50h4M22 50h4M30 50h4M38 50h4M46 50h4M54 50h4",
  lamp: "M22 56h20M32 56V26c0-14 14-16 18-8M42 16l8-6 10 10-8 6z",
  towel: "M14 10h36v6H14zM18 16v38h28V16M18 28h28M18 40h28",
  spray: "M26 30h16v24a3 3 0 0 1-3 3H29a3 3 0 0 1-3-3zM30 30v-9h8v9M38 24h9l5-5M50 28h4",
  bin: "M18 20h28l-3 36H21zM14 20h36M27 14h10v6M27 30v18M37 30v18",
  cutlery: "M22 8v14a5 5 0 0 0 10 0V8M27 27v29M46 8c-6 0-8 10-3 14v34",
  vase: "M26 9h12M28 9c0 9-11 11-11 26 0 13 6 21 15 21s15-8 15-21C47 20 36 18 36 9",
};

export function ProductIcon({ name, className }: { name: ProductIconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  );
}
