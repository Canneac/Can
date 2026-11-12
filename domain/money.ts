export function formatTryFromKurus(amountInKurus: number): string {
  if (!Number.isSafeInteger(amountInKurus) || amountInKurus < 0) {
    throw new RangeError("Tutar kuruş cinsinden, sıfır veya pozitif güvenli bir tam sayı olmalı.");
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amountInKurus / 100);
}
