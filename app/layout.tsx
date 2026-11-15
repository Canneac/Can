import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "./store.css";
import { SiteEffects } from "@/components/site-effects";

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
    <html lang="tr" className={clean.variable}>
      <body>{children}<SiteEffects /></body>
    </html>
  );
}
