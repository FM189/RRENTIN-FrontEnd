"use server";

import dbConnect from "@/lib/mongodb";
import PlatformFees from "@/models/PlatformFees";
import type { FeeRates } from "@/lib/fees";

const DEFAULT_RATES: FeeRates = {
  platformFeeRate:  0.09,
  vatRate:          0.07,
  stripeFeePercent: 0.034,
  stripeFeeFixed:   10,
};

/**
 * Returns the currently active platform fee rates from DB.
 * If no active document exists, seeds one with the defaults (singleton — only
 * one active document is ever created thanks to upsert + $setOnInsert).
 */
export async function getActivePlatformFees(): Promise<FeeRates> {
  try {
    await dbConnect();

    // findOneAndUpdate with upsert:
    //   • If a doc with isActive:true exists → return it unchanged
    //   • If none exists → insert exactly one with the default values
    // $setOnInsert ensures existing docs are never overwritten on subsequent calls.
    const doc = await PlatformFees.findOneAndUpdate(
      { isActive: true },
      {
        $setOnInsert: {
          ...DEFAULT_RATES,
          currency:                "thb",
          contractFeeRate:         0.05,
          depositRefundWindowDays: 3,
          isActive:                true,
          updatedBy:               "system",
        },
      },
      { upsert: true, new: true, lean: true }
    );

    if (!doc) return DEFAULT_RATES;

    return {
      platformFeeRate:  doc.platformFeeRate  ?? DEFAULT_RATES.platformFeeRate,
      vatRate:          doc.vatRate          ?? DEFAULT_RATES.vatRate,
      stripeFeePercent: doc.stripeFeePercent ?? DEFAULT_RATES.stripeFeePercent,
      stripeFeeFixed:   doc.stripeFeeFixed   ?? DEFAULT_RATES.stripeFeeFixed,
    };
  } catch {
    return DEFAULT_RATES;
  }
}
