import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const editorial = Cormorant_Garamond({
  variable: "--font-editorial",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const clean = Manrope({
  variable: "--font-clean",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NUVESSA — The Private Gallery",
  description: "Mekânlara karakter katan heykelsi formlar ve seçili dekor nesneleri.",
  icons: { icon: "/brand/logos/favicon.svg" },
  openGraph: {
    title: "NUVESSA — The Private Gallery",
    description: "Nesnelerle kurulan, mekâna ait bir atmosfer.",
    locale: "tr_TR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2ede5",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${editorial.variable} ${clean.variable}`}>
      <body>{children}</body>
    </html>
  );
}
