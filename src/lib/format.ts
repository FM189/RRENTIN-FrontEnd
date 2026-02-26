/**
 * Formats a price value with a currency symbol and proper number formatting.
 * Accepts either a string (from DB) or a number.
 * @param price  - The price value to format.
 * @param currency - Optional currency symbol. Defaults to Thai Baht (฿).
 */
export function formatPrice(price: string | number, currency = "฿"): string {
  const raw = typeof price === "string" ? price.replace(/,/g, "").trim() : price;
  const num = typeof raw === "string" ? parseFloat(raw) : raw;

  if (isNaN(num)) return String(price);

  const formatted = new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return `${currency}${formatted}`;
}
