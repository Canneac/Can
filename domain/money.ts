export function formatTryFromKurus(amountInKurus: number): string {
  if (!Number.isSafeInteger(amountInKurus) || amountInKurus < 0) {
    throw new RangeError("Tutar kuruş cinsinden, sıfır veya pozitif güvenli bir tam sayı olmalı.");
  }

  // Tam liralar kuruşsuz (₺1.490), kuruşlu tutarlar iki haneyle (₺49,90) yazılır.
  const whole = amountInKurus % 100 === 0;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amountInKurus / 100);
}
