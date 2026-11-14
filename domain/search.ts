export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function matchesSearch(query: string, fields: string[]) {
  const terms = normalizeSearchText(query).split(" ").filter(Boolean);
  if (!terms.length) return true;
  const searchable = normalizeSearchText(fields.join(" "));
  return terms.every((term) => searchable.includes(term));
}

/** İlgililik puanı: ürün adında geçen kelime, diğer alanlarda geçenden daha değerlidir. */
export function searchScore(query: string, name: string, other: string[]) {
  const terms = normalizeSearchText(query).split(" ").filter(Boolean);
  if (!terms.length) return 0;
  const normalizedName = normalizeSearchText(name);
  const normalizedOther = normalizeSearchText(other.join(" "));
  return terms.reduce((score, term) => score + (normalizedName.includes(term) ? 3 : 0) + (normalizedOther.includes(term) ? 1 : 0), 0);
}
