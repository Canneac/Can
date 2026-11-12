import Image from "next/image";
import { brand, type BrandLogoVariant } from "@/config/brand";

type BrandLogoProps = {
  variant: BrandLogoVariant;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
};

const logoAlt: Record<BrandLogoVariant, string> = {
  header: "NUVESSA",
  darkSection: "NUVESSA — The Private Gallery",
  burgundyCampaign: "NUVESSA — The Private Gallery",
  footer: "NUVESSA",
  monogramOnLight: "NUVESSA monogramı",
  monogramOnDark: "NUVESSA monogramı",
  favicon: "",
};

export function BrandLogo({ variant, className, decorative = false, priority = false }: BrandLogoProps) {
  const isMark = variant.startsWith("monogram") || variant === "favicon";

  return (
    <Image
      src={brand.logos[variant]}
      alt={decorative ? "" : logoAlt[variant]}
      aria-hidden={decorative || variant === "favicon"}
      className={className}
      width={isMark ? 96 : variant === "darkSection" ? 340 : variant === "burgundyCampaign" ? 420 : 440}
      height={isMark ? 96 : variant === "darkSection" ? 360 : variant === "burgundyCampaign" ? 160 : 88}
      sizes={variant === "darkSection" ? "(max-width: 700px) 58vw, 340px" : "(max-width: 700px) 150px, 220px"}
      priority={priority}
      unoptimized
    />
  );
}
