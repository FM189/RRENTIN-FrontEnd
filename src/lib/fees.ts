// ─── Fee rate shape ────────────────────────────────────────────────────────────

export interface FeeRates {
  platformFeeRate:  number;   // e.g. 0.09  → 9% of transaction
  vatRate:          number;   // e.g. 0.07  → 7% of platform fee
  stripeFeePercent: number;   // e.g. 0.034 → 3.4% of transaction
  stripeFeeFixed:   number;   // e.g. 10    → flat THB per transaction
}

// ─── Fee breakdown result ──────────────────────────────────────────────────────

export interface FeeBreakdown {
  subtotal:    number;  // base amount passed in
  platformFee: number;  // 9% of subtotal
  vat:         number;  // 7% of platformFee
  stripeFee:   number;  // 3.4% of subtotal + fixed
  total:       number;  // subtotal + platformFee + vat + stripeFee
}

// ─── Calculator ───────────────────────────────────────────────────────────────

export function calculateFees(amount: number, rates: FeeRates): FeeBreakdown {
  const platformFee = amount * rates.platformFeeRate;
  const vat         = platformFee * rates.vatRate;
  const stripeFee   = amount * rates.stripeFeePercent + rates.stripeFeeFixed;
  const total       = amount + platformFee + vat + stripeFee;

  return { subtotal: amount, platformFee, vat, stripeFee, total };
}
