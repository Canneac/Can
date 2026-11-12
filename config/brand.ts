export const brand = {
  name: "NUVESSA",
  signature: "THE PRIVATE GALLERY",
  locale: "tr-TR",
  currency: "TRY",
  logos: {
    header: "/brand/logos/nuvessa-wordmark-light.svg",
    darkSection: "/brand/logos/nuvessa-primary-dark.svg",
    burgundyCampaign: "/brand/logos/nuvessa-collection-signature.svg",
    footer: "/brand/logos/nuvessa-wordmark-dark.svg",
    monogramOnLight: "/brand/logos/nuvessa-monogram-light.svg",
    monogramOnDark: "/brand/logos/nuvessa-monogram-dark.svg",
    favicon: "/brand/logos/favicon.svg",
  },
} as const;

export type BrandLogoVariant = keyof typeof brand.logos;
