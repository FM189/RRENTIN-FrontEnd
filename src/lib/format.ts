/**
 * Formats a price value with Thai Baht symbol and proper number formatting.
 * Accepts either a string (from DB) or a number.
 */
export function formatPrice(price: string | number): string {
  const raw = typeof price === "string" ? price.replace(/,/g, "").trim() : price;
  const num = typeof raw === "string" ? parseFloat(raw) : raw;

  if (isNaN(num)) return String(price);

  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
